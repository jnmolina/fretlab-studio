import { midiToFreq } from './theory';

export type GuitarTone = 'classical' | 'acoustic' | 'electric' | 'highgain' | 'chiptune';
export type BassStyle = 'warm' | 'metal' | 'nes_8bit';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.65;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (!this.noiseBuffer) {
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buffer;
    }
    return this.noiseBuffer;
  }

  private makeDistortionCurve(amount = 40): Float32Array<ArrayBuffer> {
    const k = amount;
    const nSamples = 256;
    const curve = new Float32Array(new ArrayBuffer(nSamples * 4));
    const deg = Math.PI / 180;
    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  public playNote(
    midi: number,
    tone: GuitarTone = 'classical',
    duration = 1.6,
    delaySec = 0,
    velocity = 0.8,
    isHarmonic = false
  ) {
    const ctx = this.ensureContext();
    if (!this.masterGain) return;

    const now = ctx.currentTime + delaySec;
    const freq = midiToFreq(midi);

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    if (isHarmonic) {
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(8000, freq * 6), now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.32 * velocity, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + duration * 1.2);
    } else if (tone === 'chiptune') {
      // HORSE the band Nintendocore 8-bit square + saw lead
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(freq * 1.003, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(4800, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.24 * velocity, now + 0.003);
      gain.gain.setValueAtTime(0.2 * velocity, now + duration * 0.5);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + duration * 0.95);
    } else if (tone === 'highgain') {
      // Unearth / Deftones tight high-gain saturated tone with cab filter
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(freq * 1.004, now);

      const shaper = ctx.createWaveShaper();
      shaper.curve = this.makeDistortionCurve(55);
      shaper.oversample = '2x';

      // Cabinet simulation lowpass around 3.6kHz
      filter.type = 'lowpass';
      filter.Q.value = 1.8;
      filter.frequency.setValueAtTime(3600, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.24 * velocity, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.12 * velocity, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + duration * 1.15);

      const osc2Mix = ctx.createGain();
      osc2Mix.gain.value = 0.45;
      osc1.connect(shaper);
      osc2.connect(osc2Mix);
      osc2Mix.connect(shaper);
      shaper.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration * 1.2);
      osc2.stop(now + duration * 1.2);
      return;
    } else if (tone === 'classical') {
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, now);

      filter.type = 'lowpass';
      filter.Q.value = 1.1;
      filter.frequency.setValueAtTime(Math.min(3400, freq * 5.5), now);
      filter.frequency.exponentialRampToValueAtTime(Math.max(380, freq * 1.5), now + 0.45);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.38 * velocity, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.08 * velocity, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);
    } else if (tone === 'acoustic') {
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 1.002, now);

      filter.type = 'lowpass';
      filter.Q.value = 1.6;
      filter.frequency.setValueAtTime(Math.min(6500, freq * 9), now);
      filter.frequency.exponentialRampToValueAtTime(Math.max(550, freq * 2.1), now + 0.6);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.28 * velocity, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.09 * velocity, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + duration * 1.15);
    } else {
      // Clean electric (Polyphia / neck pickup)
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(freq * 2, now);

      const osc2Gain = ctx.createGain();
      osc2Gain.gain.value = 0.22;

      filter.type = 'lowpass';
      filter.Q.value = 2.4;
      filter.frequency.setValueAtTime(Math.min(5200, freq * 7.5), now);
      filter.frequency.exponentialRampToValueAtTime(Math.max(650, freq * 2.5), now + 0.35);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.36 * velocity, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.14 * velocity, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + duration * 1.25);

      osc1.connect(filter);
      osc2.connect(osc2Gain);
      osc2Gain.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration * 1.3);
      osc2.stop(now + duration * 1.3);
      return;
    }

    const osc2Mix = ctx.createGain();
    osc2Mix.gain.value = tone === 'classical' ? 0.28 : 0.4;

    osc1.connect(filter);
    osc2.connect(osc2Mix);
    osc2Mix.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration * 1.3);
    osc2.stop(now + duration * 1.3);
  }

  public playChord(
    midiNotes: number[],
    tone: GuitarTone = 'classical',
    arpeggiateMs = 35,
    duration = 2.0
  ) {
    midiNotes.forEach((midi, idx) => {
      this.playNote(midi, tone, duration, (idx * arpeggiateMs) / 1000, 0.78);
    });
  }

  public playClick(accent = false) {
    const ctx = this.ensureContext();
    if (!this.masterGain) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(accent ? 1320 : 880, now);
    osc.frequency.exponentialRampToValueAtTime(accent ? 660 : 440, now + 0.03);

    gain.gain.setValueAtTime(accent ? 0.45 : 0.26, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // --- DRUM SYNTHESIZER ---
  public playKick(punch = 1.0) {
    const ctx = this.ensureContext();
    if (!this.masterGain) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(145 * punch, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.22);

    gain.gain.setValueAtTime(0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playSnare(rimOnly = false) {
    const ctx = this.ensureContext();
    if (!this.masterGain) return;
    const now = ctx.currentTime;

    if (rimOnly) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.05);
      return;
    }

    // Noise burst
    const noise = ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.Q.value = 0.9;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.38, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + 0.18);

    // Snare body
    const body = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    body.type = 'triangle';
    body.frequency.setValueAtTime(185, now);
    body.frequency.exponentialRampToValueAtTime(95, now + 0.07);
    bodyGain.gain.setValueAtTime(0.32, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    body.connect(bodyGain);
    bodyGain.connect(this.masterGain);
    body.start(now);
    body.stop(now + 0.1);
  }

  public playHat(open = false) {
    const ctx = this.ensureContext();
    if (!this.masterGain) return;
    const now = ctx.currentTime;
    const dur = open ? 0.22 : 0.045;

    const noise = ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6800, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(open ? 0.2 : 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + dur + 0.01);
  }

  // --- ROOT-NOTE BASS SYNTHESIZER ---
  public playBass(rootPc: number, style: BassStyle = 'warm', duration = 0.4, octaveOffset = 0) {
    const ctx = this.ensureContext();
    if (!this.masterGain) return;
    const now = ctx.currentTime;

    // Bass register: C1 (24) to B1 (35) or E1 (28) to D#2 (39)
    const baseMidi = (rootPc < 4 ? 36 + rootPc : 24 + rootPc) + octaveOffset * 12;
    const freq = midiToFreq(baseMidi);

    const oscSub = ctx.createOscillator();
    const oscHarm = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    oscSub.type = style === 'nes_8bit' ? 'square' : 'sine';
    oscSub.frequency.setValueAtTime(freq, now);

    oscHarm.type = style === 'nes_8bit' ? 'square' : 'sawtooth';
    oscHarm.frequency.setValueAtTime(style === 'nes_8bit' ? freq * 2 : freq, now);

    filter.type = 'lowpass';
    if (style === 'metal') {
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(260, now + 0.12);
    } else if (style === 'nes_8bit') {
      filter.frequency.setValueAtTime(2600, now);
    } else {
      filter.frequency.setValueAtTime(620, now);
      filter.frequency.exponentialRampToValueAtTime(180, now + 0.25);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.42, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.18, now + duration * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    const harmMix = ctx.createGain();
    harmMix.gain.value = style === 'metal' ? 0.55 : 0.35;

    oscSub.connect(filter);
    oscHarm.connect(harmMix);
    harmMix.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    oscSub.start(now);
    oscHarm.start(now);
    oscSub.stop(now + duration + 0.04);
    oscHarm.stop(now + duration + 0.04);
  }

  // --- SUPPORTING HARMONY PAD (Root + 3rd/5th/7th warm backing) ---
  public playHarmonyPad(
    rootPc: number,
    quality: 'major' | 'minor' | 'power' | 'maj7' = 'minor',
    duration = 1.2
  ) {
    const ctx = this.ensureContext();
    if (!this.masterGain) return;
    const now = ctx.currentTime;

    const baseMidi = 48 + (rootPc % 12);
    let intervals = [0, 3, 7];
    if (quality === 'major') intervals = [0, 4, 7];
    else if (quality === 'power') intervals = [0, 7, 12];
    else if (quality === 'maj7') intervals = [0, 4, 7, 11];

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.06, now + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

    filter.connect(gain);
    gain.connect(this.masterGain);

    intervals.forEach((semi) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(midiToFreq(baseMidi + semi), now);
      osc.connect(filter);
      osc.start(now);
      osc.stop(now + duration + 0.05);
    });
  }
}

export const audio = new AudioEngine();

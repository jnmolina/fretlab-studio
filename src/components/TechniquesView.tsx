import React, { useEffect, useRef, useState } from 'react';
import { Play, Square, ArrowRight, Sparkles } from 'lucide-react';
import { audio, GuitarTone } from '../lib/audio';

interface TechniqueStep {
  stringNum: number; // 6 down to 1
  fret: number;
  midi: number;
  rh: string; // 'p', 'i', 'm', 'a', 'Pick', 'M', 'R', 'H/O', 'Harm', 'PM', 'Sweep', 'Tap'
  isHarmonic?: boolean;
}

export type TechniqueTrack =
  | 'Classical & Acoustic'
  | 'Electric Hybrid (Polyphia)'
  | 'Unearth (Melodic Metalcore)'
  | 'Deftones (Shoegaze Alt-Metal)'
  | 'HORSE the band (Nintendocore)';

interface TechniqueModule {
  id: string;
  title: string;
  track: TechniqueTrack;
  focus: string;
  why20Years: string;
  bridgeNote: string;
  defaultBpm: number;
  recommendedTone: GuitarTone;
  steps: TechniqueStep[];
}

export const TECHNIQUES: TechniqueModule[] = [
  {
    id: 'pima_arpeggio',
    title: 'P-I-M-A Independence & Sequential Planting',
    track: 'Classical & Acoustic',
    focus: 'Right-hand control, zero tension, even volume across nylon/steel strings',
    why20Years:
      'Most self-taught 20-year players have a dominant thumb/index and weak ring finger (a). Planting fingers ahead of the stroke eliminates string-hunting and builds effortless speed.',
    bridgeNote:
      'Direct Bridge: Once p-i-m-a feels automatic on acoustic, replacing p+i with a Pick while keeping m+a gives you instant Polyphia-grade hybrid picking.',
    defaultBpm: 92,
    recommendedTone: 'classical',
    steps: [
      { stringNum: 5, fret: 0, midi: 45, rh: 'p' },
      { stringNum: 3, fret: 2, midi: 57, rh: 'i' },
      { stringNum: 2, fret: 1, midi: 60, rh: 'm' },
      { stringNum: 1, fret: 0, midi: 64, rh: 'a' },
      { stringNum: 2, fret: 1, midi: 60, rh: 'm' },
      { stringNum: 3, fret: 2, midi: 57, rh: 'i' },
      { stringNum: 4, fret: 2, midi: 52, rh: 'p' },
      { stringNum: 1, fret: 3, midi: 67, rh: 'a' },
    ],
  },
  {
    id: 'tremolo_pami',
    title: 'Classical Tremolo (p-a-m-i) & Rest Stroke Tone',
    track: 'Classical & Acoustic',
    focus: 'Finger alternation speed, dynamic shaping, apoyando vs tirando',
    why20Years:
      'Tremolo forces the ring finger (a) to lead into m and i with identical tone and timing—exposing any rhythmic hiccups immediately.',
    bridgeNote:
      'Direct Bridge: This exact 4-note rhythmic subdivision translates to 16th-note hybrid-picked pedal-point riffs and Unearth-style gallops on electric.',
    defaultBpm: 76,
    recommendedTone: 'classical',
    steps: [
      { stringNum: 6, fret: 0, midi: 40, rh: 'p' },
      { stringNum: 1, fret: 0, midi: 64, rh: 'a' },
      { stringNum: 1, fret: 0, midi: 64, rh: 'm' },
      { stringNum: 1, fret: 0, midi: 64, rh: 'i' },
      { stringNum: 4, fret: 2, midi: 52, rh: 'p' },
      { stringNum: 1, fret: 3, midi: 67, rh: 'a' },
      { stringNum: 1, fret: 3, midi: 67, rh: 'm' },
      { stringNum: 1, fret: 3, midi: 67, rh: 'i' },
    ],
  },
  {
    id: 'polyphonic_bass',
    title: 'Polyphonic Voice Separation (Thumb Bass + Melody)',
    track: 'Classical & Acoustic',
    focus: 'Thumb independence, bass damping, singing top voice',
    why20Years:
      'Separating a walking bassline (p) from a legato treble melody (m/a) turns solo guitar into a two-instrument arrangement.',
    bridgeNote:
      'Direct Bridge: On electric, your Pick handles the percussive bassline/muting while M and R pluck vocal double-stops on top.',
    defaultBpm: 86,
    recommendedTone: 'classical',
    steps: [
      { stringNum: 5, fret: 3, midi: 48, rh: 'p' },
      { stringNum: 2, fret: 5, midi: 64, rh: 'm' },
      { stringNum: 4, fret: 2, midi: 52, rh: 'p' },
      { stringNum: 1, fret: 3, midi: 67, rh: 'a' },
      { stringNum: 5, fret: 2, midi: 47, rh: 'p' },
      { stringNum: 2, fret: 3, midi: 62, rh: 'm' },
      { stringNum: 6, fret: 3, midi: 43, rh: 'p' },
      { stringNum: 1, fret: 5, midi: 69, rh: 'a' },
    ],
  },
  {
    id: 'hybrid_maj9_skip',
    title: 'Polyphia Hybrid-Picked Maj9 String-Skip',
    track: 'Electric Hybrid (Polyphia)',
    focus: 'Pick + Middle (M) + Ring (R) wide-interval snapping',
    why20Years:
      'A pure flatpick struggles with rapid 2-string skips at 120+ BPM. Hybrid picking lets the Pick stay anchored on the bass while M & R snap treble strings cleanly.',
    bridgeNote:
      'Classical Origin: Identical muscle memory to p-m-a arpeggios, just holding a pick between thumb and index.',
    defaultBpm: 112,
    recommendedTone: 'electric',
    steps: [
      { stringNum: 5, fret: 3, midi: 48, rh: 'Pick' },
      { stringNum: 3, fret: 4, midi: 59, rh: 'M' },
      { stringNum: 2, fret: 3, midi: 62, rh: 'R' },
      { stringNum: 4, fret: 2, midi: 52, rh: 'Pick' },
      { stringNum: 1, fret: 3, midi: 67, rh: 'R' },
      { stringNum: 2, fret: 5, midi: 64, rh: 'M' },
      { stringNum: 3, fret: 4, midi: 59, rh: 'Pick' },
      { stringNum: 1, fret: 7, midi: 71, rh: 'R' },
    ],
  },
  {
    id: 'selective_legato',
    title: 'Selective Picking & Legato Cascade',
    track: 'Electric Hybrid (Polyphia)',
    focus: 'Single pick/pluck impulse followed by crisp left-hand hammer-ons',
    why20Years:
      'Creates that modern "liquid typewriter" articulation where only the first note of a 3- or 4-note group is picked and the rest erupt from left-hand hammers.',
    bridgeNote:
      'Classical Origin: Built directly on classical Ligados (ascending/descending slurs) practiced on acoustic.',
    defaultBpm: 116,
    recommendedTone: 'electric',
    steps: [
      { stringNum: 6, fret: 0, midi: 40, rh: 'Pick' },
      { stringNum: 5, fret: 2, midi: 47, rh: 'H/O' },
      { stringNum: 5, fret: 5, midi: 50, rh: 'H/O' },
      { stringNum: 4, fret: 2, midi: 52, rh: 'Pick' },
      { stringNum: 4, fret: 5, midi: 55, rh: 'H/O' },
      { stringNum: 3, fret: 4, midi: 59, rh: 'M' },
      { stringNum: 2, fret: 3, midi: 62, rh: 'R' },
      { stringNum: 1, fret: 7, midi: 71, rh: 'H/O' },
    ],
  },
  {
    id: 'harp_harmonics',
    title: 'Natural & Artificial Harmonics (Tim Henson Style)',
    track: 'Electric Hybrid (Polyphia)',
    focus: '12th/7th/5th fret natural chimes + fretted octave touch harmonics',
    why20Years:
      'Harmonics add an airy, synth-like upper octave layer to standard chord voicings without changing your left-hand grip.',
    bridgeNote:
      'Classical Origin: Villa-Lobos & Tarrega used harp harmonics (touch with i, pluck with a/p) 100 years before modern math-rock.',
    defaultBpm: 96,
    recommendedTone: 'electric',
    steps: [
      { stringNum: 6, fret: 12, midi: 52, rh: 'Harm', isHarmonic: true },
      { stringNum: 4, fret: 12, midi: 62, rh: 'Harm', isHarmonic: true },
      { stringNum: 3, fret: 12, midi: 67, rh: 'Harm', isHarmonic: true },
      { stringNum: 2, fret: 12, midi: 71, rh: 'Harm', isHarmonic: true },
      { stringNum: 1, fret: 7, midi: 71, rh: 'Harm', isHarmonic: true },
      { stringNum: 2, fret: 7, midi: 66, rh: 'Harm', isHarmonic: true },
      { stringNum: 3, fret: 7, midi: 62, rh: 'Harm', isHarmonic: true },
      { stringNum: 1, fret: 5, midi: 76, rh: 'Harm', isHarmonic: true },
    ],
  },
  {
    id: 'unearth_pedal_sweeptap',
    title: 'Unearth Harmonic Minor Pedal Riff & Sweep-Tap Apex',
    track: 'Unearth (Melodic Metalcore)',
    focus: 'Buz McGrath & Ken Susi style: 5-7-8 pedal-point + 3-string sweep into tapped apex',
    why20Years:
      'Combines tight metalcore downpicked palm-muting (PM) on the low root with neoclassical Harmonic Minor sweep-tapping—requiring instant right-hand transition from percussive muting to fluid economy motion.',
    bridgeNote:
      'Classical → Unearth Bridge: Directly applies Paganini/Bach Harmonic Minor voice-leading (b6 to natural 7) and classical arpeggio control to high-gain metalcore.',
    defaultBpm: 128,
    recommendedTone: 'highgain',
    steps: [
      { stringNum: 6, fret: 0, midi: 38, rh: 'PM' },
      { stringNum: 5, fret: 5, midi: 50, rh: 'Pick' },
      { stringNum: 6, fret: 0, midi: 38, rh: 'PM' },
      { stringNum: 5, fret: 8, midi: 53, rh: 'Pick' },
      { stringNum: 3, fret: 6, midi: 61, rh: 'Sweep' },
      { stringNum: 2, fret: 8, midi: 67, rh: 'Sweep' },
      { stringNum: 1, fret: 9, midi: 73, rh: 'Sweep' },
      { stringNum: 1, fret: 12, midi: 76, rh: 'Tap' },
    ],
  },
  {
    id: 'deftones_shoegaze_bloom',
    title: 'Deftones Syncopated Chug → Lush Maj9/Add9 Bloom',
    track: 'Deftones (Shoegaze Alt-Metal)',
    focus: 'Stephen Carpenter style: heavy drop-tuned palm-mute groove into wide open-string extensions',
    why20Years:
      'Mastery isn’t just notes-per-second; it’s massive dynamic contrast and letting extended chord tensions (9ths, maj7ths, #11ths) ring clearly even under saturation.',
    bridgeNote:
      'Acoustic → Deftones Bridge: Uses the exact same open-string drone + movable upper-triad architecture as acoustic DADGAD/Classical extensions.',
    defaultBpm: 88,
    recommendedTone: 'highgain',
    steps: [
      { stringNum: 6, fret: 0, midi: 38, rh: 'PM' },
      { stringNum: 6, fret: 0, midi: 38, rh: 'PM' },
      { stringNum: 4, fret: 4, midi: 54, rh: 'Pick' },
      { stringNum: 3, fret: 2, midi: 57, rh: 'M' },
      { stringNum: 2, fret: 2, midi: 61, rh: 'R' },
      { stringNum: 1, fret: 0, midi: 64, rh: 'R' },
      { stringNum: 6, fret: 5, midi: 43, rh: 'PM' },
      { stringNum: 2, fret: 7, midi: 66, rh: 'M' },
    ],
  },
  {
    id: 'horse_nintendocore_arp',
    title: 'HORSE the band 8-Bit Synth-Doubled Arpeggio & Panic Stab',
    track: 'HORSE the band (Nintendocore)',
    focus: 'David Isen & Erik Engstrom style: rapid square-wave triad arpeggios into angular tritone stabs',
    why20Years:
      'Doubling keyboard/chiptune lines on guitar demands zero-slop string crossing and hybrid/alternate accuracy across wide 1-3-5-8 intervals before slamming into mathcore dissonance.',
    bridgeNote:
      'Classical/Polyphia → HORSE Bridge: Hybrid picking (Pick + M + R) makes wide-leaping 8-bit synth arpeggios 2x cleaner than pure flatpicking.',
    defaultBpm: 138,
    recommendedTone: 'chiptune',
    steps: [
      { stringNum: 4, fret: 2, midi: 52, rh: 'Pick' },
      { stringNum: 3, fret: 0, midi: 55, rh: 'M' },
      { stringNum: 2, fret: 0, midi: 59, rh: 'R' },
      { stringNum: 1, fret: 0, midi: 64, rh: 'R' },
      { stringNum: 1, fret: 7, midi: 71, rh: 'Tap' },
      { stringNum: 2, fret: 4, midi: 63, rh: 'M' },
      { stringNum: 4, fret: 3, midi: 53, rh: 'Pick' },
      { stringNum: 3, fret: 4, midi: 59, rh: 'M' },
    ],
  },
];

interface TechniquesViewProps {
  tone: GuitarTone;
}

const TRACKS: ('All' | TechniqueTrack)[] = [
  'All',
  'Classical & Acoustic',
  'Electric Hybrid (Polyphia)',
  'Unearth (Melodic Metalcore)',
  'Deftones (Shoegaze Alt-Metal)',
  'HORSE the band (Nintendocore)',
];

export const TechniquesView: React.FC<TechniquesViewProps> = ({ tone }) => {
  const [trackFilter, setTrackFilter] = useState<'All' | TechniqueTrack>('All');
  const [selectedId, setSelectedId] = useState<string>('hybrid_maj9_skip');
  const [bpm, setBpm] = useState<number>(112);
  const [useRecommendedTone, setUseRecommendedTone] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const visible =
    trackFilter === 'All'
      ? TECHNIQUES
      : TECHNIQUES.filter((t) => t.track === trackFilter);

  const tech = TECHNIQUES.find((t) => t.id === selectedId) ?? TECHNIQUES[0];
  const playbackTone = useRecommendedTone ? tech.recommendedTone : tone;

  const stopPattern = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setActiveStep(null);
  };

  useEffect(() => {
    return () => stopPattern();
  }, []);

  useEffect(() => {
    setBpm(tech.defaultBpm);
    stopPattern();
  }, [selectedId]);

  const startPattern = () => {
    stopPattern();
    setIsPlaying(true);
    let idx = 0;
    const playIdx = (i: number) => {
      const st = tech.steps[i];
      setActiveStep(i);
      const dur = st.rh === 'PM' ? 0.18 : 0.85;
      audio.playNote(st.midi, playbackTone, dur, 0, st.rh === 'H/O' ? 0.65 : 0.88, st.isHarmonic);
    };
    playIdx(0);
    const stepMs = (60 / bpm / 2) * 1000;
    timerRef.current = window.setInterval(() => {
      idx = (idx + 1) % tech.steps.length;
      playIdx(idx);
    }, stepMs);
  };

  return (
    <div className="space-y-6">
      {/* Classical -> Hybrid & Band Bridge Banner */}
      <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-[#13151c] to-cyan-500/10 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              The Classical → Polyphia / Unearth / Deftones / HORSE Bridge
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Master finger independence, voice separation &amp; harmonic minor on <strong>Classical/Acoustic</strong>, then channel it into <strong>Polyphia</strong> hybrid skips, <strong>Unearth</strong> sweep-tap pedal riffs, <strong>Deftones</strong> shoegaze extensions, and <strong>HORSE the band</strong> 8-bit arpeggios.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="rounded-lg border border-amber-500/40 bg-amber-500/15 px-2.5 py-1.5 text-amber-200">
              p · i · m · a
            </span>
            <ArrowRight className="h-4 w-4 text-slate-400" />
            <span className="rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-1.5 text-cyan-200">
              Pick · M · R · Sweep · Tap
            </span>
          </div>
        </div>
      </div>

      {/* Track Filter */}
      <div className="flex flex-wrap gap-2">
        {TRACKS.map((tr) => (
          <button
            key={tr}
            type="button"
            onClick={() => setTrackFilter(tr)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              trackFilter === tr
                ? 'border border-cyan-500/40 bg-cyan-500/20 text-cyan-300'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tr}
          </button>
        ))}
      </div>

      {/* Technique Cards Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelectedId(t.id)}
            className={`rounded-xl border p-3.5 text-left transition-all ${
              tech.id === t.id
                ? 'border-amber-500/60 bg-amber-500/10'
                : 'border-slate-800 bg-[#13151c] hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between font-mono text-[10px] uppercase">
              <span className="text-cyan-400">{t.track}</span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-amber-300">
                {t.recommendedTone}
              </span>
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-100">{t.title}</div>
            <div className="mt-1 text-xs text-slate-400 line-clamp-2">{t.focus}</div>
          </button>
        ))}
      </div>

      {/* Interactive Pattern Lab */}
      <div className="rounded-xl border border-slate-800 bg-[#13151c] p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] uppercase text-cyan-400">{tech.track}</span>
            <h3 className="text-lg font-bold text-slate-100">{tech.title}</h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setUseRecommendedTone(!useRecommendedTone)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 font-mono text-xs text-slate-300"
            >
              Tone: {useRecommendedTone ? `Auto (${tech.recommendedTone})` : `Header (${tone})`}
            </button>

            <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs">
              <span className="text-slate-400">BPM</span>
              <input
                type="range"
                min={50}
                max={170}
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-24 accent-amber-500"
              />
              <span className="w-7 font-mono font-semibold text-amber-300">{bpm}</span>
            </div>

            <button
              type="button"
              onClick={() => (isPlaying ? stopPattern() : startPattern())}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold ${
                isPlaying
                  ? 'bg-rose-500 text-white hover:bg-rose-400'
                  : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
              }`}
            >
              {isPlaying ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isPlaying ? 'Stop Pattern' : 'Play Pattern'}
            </button>
          </div>
        </div>

        {/* 8-Step Tab & Right-Hand Grid */}
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {tech.steps.map((st, idx) => {
            const active = activeStep === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveStep(idx);
                  audio.playNote(
                    st.midi,
                    playbackTone,
                    st.rh === 'PM' ? 0.18 : 0.9,
                    0,
                    0.85,
                    st.isHarmonic
                  );
                }}
                className={`rounded-xl border p-2.5 text-center transition-all ${
                  active
                    ? 'border-amber-400 bg-amber-500/20 scale-105 shadow-lg shadow-amber-500/15'
                    : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                }`}
              >
                <div className="font-mono text-[10px] text-slate-500">Str {st.stringNum}</div>
                <div className="my-1 font-mono text-base font-bold text-slate-100">
                  {st.isHarmonic ? `<${st.fret}>` : st.fret}
                </div>
                <div
                  className={`inline-block rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                    st.rh === 'Pick' || st.rh === 'p' || st.rh === 'PM'
                      ? 'bg-amber-500/20 text-amber-300'
                      : st.rh === 'Harm' || st.rh === 'Tap'
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-cyan-500/20 text-cyan-300'
                  }`}
                >
                  {st.rh}
                </div>
              </button>
            );
          })}
        </div>

        {/* Context & Bridge Explanation */}
        <div className="grid gap-4 md:grid-cols-2 text-xs leading-relaxed">
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3.5">
            <div className="font-semibold text-amber-300">Why This Matters at 20 Years</div>
            <p className="mt-1 text-slate-300">{tech.why20Years}</p>
          </div>
          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3.5">
            <div className="flex items-center gap-1.5 font-semibold text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Classical ↔ Band Style Bridge</span>
            </div>
            <p className="mt-1 text-slate-300">{tech.bridgeNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

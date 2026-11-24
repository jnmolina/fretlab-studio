import React, { useEffect, useRef, useState } from 'react';
import { Play, Square, Drum, Volume2, Music } from 'lucide-react';
import { audio, BassStyle } from '../lib/audio';
import { getNoteName } from '../lib/theory';

export type GrooveId =
  | 'basic_rock'
  | 'acoustic_bossa'
  | 'funk_pocket'
  | 'polyphia_trap'
  | 'deftones_shoegaze'
  | 'unearth_metalcore'
  | 'horse_nintendocore'
  | 'metronome';

export type HarmonyMode = 'off' | 'minor' | 'major' | 'power' | 'maj7';

interface GroovePattern {
  id: GrooveId;
  name: string;
  defaultBpm: number;
  bassStyle: BassStyle;
  kick: number[];
  snare: number[];
  rim?: number[];
  hat: number[];
  openHat?: number[];
  // Bass steps: 0 = rest, 1 = root, 2 = octave up root, 5 = fifth (+7 semis)
  bass: number[];
}

export const GROOVES: GroovePattern[] = [
  {
    id: 'basic_rock',
    name: 'Basic 4/4 Drum Beat',
    defaultBpm: 96,
    bassStyle: 'warm',
    kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    bass: [1, 0, 1, 0, 5, 0, 1, 0, 1, 0, 1, 0, 5, 0, 2, 0],
  },
  {
    id: 'acoustic_bossa',
    name: 'Acoustic / Fingerstyle Pulse',
    defaultBpm: 92,
    bassStyle: 'warm',
    kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    snare: [],
    rim: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
    hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    bass: [1, 0, 0, 1, 0, 0, 5, 0, 1, 0, 0, 1, 0, 0, 5, 0],
  },
  {
    id: 'funk_pocket',
    name: 'Syncopated Groove / Funk',
    defaultBpm: 102,
    bassStyle: 'warm',
    kick: [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0],
    hat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    openHat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    bass: [1, 0, 0, 2, 0, 0, 5, 0, 1, 0, 1, 0, 0, 2, 0, 0],
  },
  {
    id: 'polyphia_trap',
    name: 'Trap / Math-Rock (Polyphia)',
    defaultBpm: 116,
    bassStyle: 'warm',
    kick: [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hat: [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
    openHat: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    bass: [1, 0, 0, 2, 0, 0, 0, 1, 0, 0, 1, 0, 0, 2, 0, 0],
  },
  {
    id: 'deftones_shoegaze',
    name: 'Half-Time Alt-Metal (Deftones)',
    defaultBpm: 88,
    bassStyle: 'metal',
    kick: [1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    hat: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    openHat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    bass: [1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0],
  },
  {
    id: 'unearth_metalcore',
    name: 'Double-Kick Metal (Unearth)',
    defaultBpm: 128,
    bassStyle: 'metal',
    kick: [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    openHat: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    bass: [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 2, 0],
  },
  {
    id: 'horse_nintendocore',
    name: 'Fast Nintendocore (HORSE)',
    defaultBpm: 138,
    bassStyle: 'nes_8bit',
    kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1],
    snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1],
    hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    bass: [1, 2, 1, 2, 1, 2, 5, 2, 1, 2, 1, 2, 5, 2, 1, 2],
  },
  {
    id: 'metronome',
    name: 'Metronome Click Only',
    defaultBpm: 100,
    bassStyle: 'warm',
    kick: [],
    snare: [],
    hat: [],
    bass: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
  },
];

interface BackingTrackBarProps {
  rootPc: number;
  preferFlat: boolean;
  grooveId: GrooveId;
  setGrooveId: (id: GrooveId) => void;
  bpm: number;
  setBpm: (bpm: number) => void;
}

export const BackingTrackBar: React.FC<BackingTrackBarProps> = ({
  rootPc,
  preferFlat,
  grooveId,
  setGrooveId,
  bpm,
  setBpm,
}) => {
  const groove = GROOVES.find((g) => g.id === grooveId) ?? GROOVES[0];
  const [running, setRunning] = useState(false);
  const [bassEnabled, setBassEnabled] = useState(true);
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>('minor');
  const [step, setStep] = useState(0);
  const tapTimesRef = useRef<number[]>([]);
  const timerRef = useRef<number | null>(null);
  const rootPcRef = useRef(rootPc);
  const bassEnabledRef = useRef(bassEnabled);
  const harmonyModeRef = useRef(harmonyMode);

  useEffect(() => {
    rootPcRef.current = rootPc;
  }, [rootPc]);

  useEffect(() => {
    bassEnabledRef.current = bassEnabled;
  }, [bassEnabled]);

  useEffect(() => {
    harmonyModeRef.current = harmonyMode;
  }, [harmonyMode]);

  const stop = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
    setStep(0);
  };

  useEffect(() => {
    if (!running) return;
    let s = 0;
    const stepDurSec = 60 / bpm / 4;

    const triggerStep = (idx: number) => {
      setStep(idx);
      if (groove.id === 'metronome') {
        if (idx % 4 === 0) audio.playClick(idx === 0);
      } else {
        if (groove.kick[idx]) audio.playKick(groove.id === 'unearth_metalcore' ? 1.2 : 1.0);
        if (groove.snare[idx]) audio.playSnare(false);
        if (groove.rim?.[idx]) audio.playSnare(true);
        if (groove.openHat?.[idx]) audio.playHat(true);
        else if (groove.hat[idx]) audio.playHat(false);
      }

      if (bassEnabledRef.current && groove.bass[idx]) {
        const bVal = groove.bass[idx];
        const targetPc = bVal === 5 ? (rootPcRef.current + 7) % 12 : rootPcRef.current;
        const oct = bVal === 2 ? 1 : 0;
        const noteDur =
          groove.id === 'deftones_shoegaze' ? stepDurSec * 2.4 : stepDurSec * 1.4;
        audio.playBass(targetPc, groove.bassStyle, noteDur, oct);
      }

      // Trigger supporting harmony pad on beat 1 and beat 3 (steps 0 and 8)
      if (harmonyModeRef.current !== 'off' && (idx === 0 || idx === 8)) {
        audio.playHarmonyPad(rootPcRef.current, harmonyModeRef.current, stepDurSec * 7.5);
      }
    };

    triggerStep(0);
    timerRef.current = window.setInterval(() => {
      s = (s + 1) % 16;
      triggerStep(s);
    }, stepDurSec * 1000);

    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, [running, bpm, groove]);

  const handleTap = () => {
    const now = performance.now();
    const taps = tapTimesRef.current.filter((t) => now - t < 2000);
    taps.push(now);
    tapTimesRef.current = taps;
    if (taps.length >= 2) {
      const diffs = taps.slice(1).map((t, i) => t - taps[i]);
      const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
      const calcBpm = Math.min(220, Math.max(40, Math.round(60000 / avg)));
      setBpm(calcBpm);
    }
  };

  const rootName = getNoteName(rootPc, preferFlat);

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/95 px-2.5 py-1.5 text-xs">
      {/* Start / Stop Backing Track */}
      <button
        type="button"
        onClick={() => (running ? stop() : setRunning(true))}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all ${
          running
            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
            : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
        }`}
      >
        {running ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        <span>{running ? 'Stop Backing' : 'Play Drums + Bass'}</span>
      </button>

      {/* Drum Loop Picker */}
      <div className="flex items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-950 px-2 py-1">
        <Drum className="h-3.5 w-3.5 text-amber-400 shrink-0" />
        <select
          value={grooveId}
          onChange={(e) => {
            const gId = e.target.value as GrooveId;
            setGrooveId(gId);
            const found = GROOVES.find((g) => g.id === gId);
            if (found) setBpm(found.defaultBpm);
          }}
          className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none"
        >
          {GROOVES.map((g) => (
            <option key={g.id} value={g.id} className="bg-slate-900">
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* Root Bass Toggle */}
      <button
        type="button"
        onClick={() => setBassEnabled(!bassEnabled)}
        className={`flex items-center gap-1 rounded-lg border px-2 py-1 font-mono text-[11px] font-semibold transition-all ${
          bassEnabled
            ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300'
            : 'border-slate-800 bg-slate-950 text-slate-500'
        }`}
      >
        <Volume2 className="h-3 w-3" />
        <span>Bass ({rootName})</span>
      </button>

      {/* Harmony Pad Selector */}
      <div className="flex items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-950 px-2 py-1">
        <Music className="h-3 w-3 text-cyan-400 shrink-0" />
        <select
          value={harmonyMode}
          onChange={(e) => setHarmonyMode(e.target.value as HarmonyMode)}
          className="bg-transparent font-mono text-[11px] text-slate-200 focus:outline-none"
          title="Supporting Harmony Chord Pad"
        >
          <option value="off" className="bg-slate-900">Harmony: Off</option>
          <option value="minor" className="bg-slate-900">Pad: {rootName}m (1-b3-5)</option>
          <option value="major" className="bg-slate-900">Pad: {rootName} (1-3-5)</option>
          <option value="maj7" className="bg-slate-900">Pad: {rootName}maj7</option>
          <option value="power" className="bg-slate-900">Pad: {rootName}5 (Power)</option>
        </select>
      </div>

      {/* BPM & Tap */}
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={40}
          max={220}
          value={bpm}
          onChange={(e) => setBpm(Math.min(220, Math.max(40, Number(e.target.value) || 40)))}
          className="w-12 rounded bg-slate-950 px-1 py-0.5 text-center font-mono text-xs text-amber-300 focus:outline-none"
        />
        <span className="font-mono text-[10px] text-slate-400">BPM</span>
        <button
          type="button"
          onClick={handleTap}
          className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300 hover:border-cyan-500/50"
        >
          Tap
        </button>
      </div>

      {/* 4-Beat LED */}
      <div className="hidden items-center gap-1 md:flex">
        {[0, 4, 8, 12].map((bIdx, i) => {
          const active = running && Math.floor(step / 4) === i;
          return (
            <span
              key={bIdx}
              className={`h-2 w-2 rounded-full transition-all ${
                active
                  ? i === 0
                    ? 'bg-amber-400 scale-125'
                    : 'bg-cyan-400 scale-110'
                  : 'bg-slate-700'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

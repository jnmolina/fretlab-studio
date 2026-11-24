import React, { useEffect, useRef, useState } from 'react';
import { Play, Square, Sparkles, Music2 } from 'lucide-react';
import {
  CHROMATIC_FLAT,
  CHROMATIC_SHARP,
  getIntervalName,
  getNoteName,
  SCALES,
  ScaleCategory,
  Tuning,
} from '../lib/theory';
import { audio, GuitarTone } from '../lib/audio';
import { Fretboard } from './Fretboard';

interface ScalesViewProps {
  tuning: Tuning;
  tone: GuitarTone;
  rootPc: number;
  setRootPc: (pc: number) => void;
  preferFlat: boolean;
  setPreferFlat: (v: boolean) => void;
}

const CATEGORIES: ScaleCategory[] = [
  'Diatonic & Modes',
  'Harmonic & Melodic Minor',
  'Pentatonic & Blues',
  'Symmetrical & Exotic',
];

const WINDOWS: { label: string; range: [number, number] }[] = [
  { label: 'Full Neck (0–15)', range: [0, 15] },
  { label: 'Open (0–4)', range: [0, 4] },
  { label: 'Pos IV (4–8)', range: [4, 8] },
  { label: 'Pos VII (7–11)', range: [7, 11] },
  { label: 'Pos XII (11–15)', range: [11, 15] },
];

export const ScalesView: React.FC<ScalesViewProps> = ({
  tuning,
  tone,
  rootPc,
  setRootPc,
  preferFlat,
  setPreferFlat,
}) => {
  const [category, setCategory] = useState<ScaleCategory>('Diatonic & Modes');
  const [scaleId, setScaleId] = useState<string>('major');
  const [labelMode, setLabelMode] = useState<'intervals' | 'notes'>('intervals');
  const [fretWindow, setFretWindow] = useState<[number, number]>([0, 15]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMidi, setActiveMidi] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);

  const selectedScale = SCALES.find((s) => s.id === scaleId) ?? SCALES[0];
  const filteredScales = SCALES.filter((s) => s.category === category);
  const notesList = preferFlat ? CHROMATIC_FLAT : CHROMATIC_SHARP;

  const stopPlayback = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    setIsPlaying(false);
    setActiveMidi(null);
  };

  useEffect(() => {
    return () => stopPlayback();
  }, [scaleId, rootPc]);

  const handlePlayScale = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }
    setIsPlaying(true);
    // Find lowest root on 6th or 5th string
    const baseOctave = 40 + ((rootPc - (40 % 12) + 12) % 12);
    const up = [...selectedScale.intervals.map((i) => baseOctave + i), baseOctave + 12];
    const down = [...up].slice(0, -1).reverse();
    const seq = [...up, ...down];

    seq.forEach((midi, idx) => {
      const id = window.setTimeout(() => {
        setActiveMidi(midi);
        audio.playNote(midi, tone, 0.75, 0, 0.85);
        if (idx === seq.length - 1) {
          window.setTimeout(() => {
            setIsPlaying(false);
            setActiveMidi(null);
          }, 400);
        }
      }, idx * 240);
      timersRef.current.push(id);
    });
  };

  const playDiatonicChord = (degreeIdx: number, quality: string) => {
    const chordRootSemi = selectedScale.intervals[degreeIdx];
    const rootMidi = 48 + ((rootPc + chordRootSemi) % 12);
    let offsets = [0, 4, 7, 11];
    if (quality === 'm7') offsets = [0, 3, 7, 10];
    else if (quality === '7') offsets = [0, 4, 7, 10];
    else if (quality === 'm7b5') offsets = [0, 3, 6, 10];
    else if (quality === 'dim7') offsets = [0, 3, 6, 9];
    else if (quality === 'm(maj7)') offsets = [0, 3, 7, 11];
    else if (quality === 'maj7#5') offsets = [0, 4, 8, 11];

    audio.playChord(
      offsets.map((o) => rootMidi + o),
      tone,
      40,
      1.8
    );
  };

  const modeOrder = ['lydian', 'major', 'mixolydian', 'dorian', 'aeolian', 'phrygian', 'locrian'];

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="grid gap-4 rounded-xl border border-slate-800 bg-[#13151c] p-4 lg:grid-cols-12">
        {/* Root Picker */}
        <div className="lg:col-span-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Root Center
            </span>
            <button
              type="button"
              onClick={() => setPreferFlat(!preferFlat)}
              className="rounded border border-slate-700 bg-slate-800/80 px-2 py-0.5 font-mono text-[11px] text-slate-300 hover:border-amber-500/50"
            >
              Spelling: {preferFlat ? 'Flats (b)' : 'Sharps (#)'}
            </button>
          </div>
          <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-12">
            {notesList.map((n, pc) => (
              <button
                key={n}
                type="button"
                onClick={() => setRootPc(pc)}
                className={`rounded-lg py-1.5 font-mono text-xs font-semibold transition-all ${
                  rootPc === pc
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Display & Window Controls */}
        <div className="flex flex-wrap items-end gap-3 lg:col-span-6 lg:justify-end">
          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Neck Window
            </span>
            <select
              value={WINDOWS.findIndex(
                (w) => w.range[0] === fretWindow[0] && w.range[1] === fretWindow[1]
              )}
              onChange={(e) => setFretWindow(WINDOWS[Number(e.target.value)].range)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
            >
              {WINDOWS.map((w, idx) => (
                <option key={w.label} value={idx}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Labels
            </span>
            <div className="flex rounded-lg border border-slate-700 bg-slate-900 p-0.5">
              <button
                type="button"
                onClick={() => setLabelMode('intervals')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                  labelMode === 'intervals' ? 'bg-slate-700 text-amber-300' : 'text-slate-400'
                }`}
              >
                Intervals
              </button>
              <button
                type="button"
                onClick={() => setLabelMode('notes')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                  labelMode === 'notes' ? 'bg-slate-700 text-amber-300' : 'text-slate-400'
                }`}
              >
                Notes
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePlayScale}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              isPlaying
                ? 'bg-rose-500/90 text-white hover:bg-rose-500'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
            }`}
          >
            {isPlaying ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isPlaying ? 'Stop' : 'Audition Scale'}
          </button>
        </div>
      </div>

      {/* Category & Scale Selector */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategory(cat);
                const first = SCALES.find((s) => s.category === cat);
                if (first) setScaleId(first.id);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                category === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {filteredScales.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setScaleId(s.id)}
              className={`rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                selectedScale.id === s.id
                  ? 'border-amber-500/60 bg-amber-500/10 text-amber-200'
                  : 'border-slate-800 bg-[#13151c] text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold">{s.name}</div>
              <div className="mt-0.5 font-mono text-[10px] text-slate-400">{s.formula}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Brightness Spectrum (for Diatonic Modes) */}
      {category === 'Diatonic & Modes' && (
        <div className="rounded-xl border border-slate-800 bg-[#13151c] p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">
              Parallel Mode Brightness Spectrum (Root: {getNoteName(rootPc, preferFlat)})
            </span>
            <span className="font-mono text-[11px]">Brightest (#4) → Darkest (b2, b5)</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {modeOrder.map((mId, idx) => {
              const m = SCALES.find((s) => s.id === mId)!;
              const active = selectedScale.id === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setScaleId(m.id)}
                  className={`rounded-lg px-2 py-1.5 text-center text-[11px] font-medium transition-all ${
                    active
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="truncate">{m.name.split(' ')[0]}</div>
                  <div className="mt-0.5 text-[9px] opacity-75">
                    {idx === 0 ? 'Brightest' : idx === 6 ? 'Darkest' : `•`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Fretboard */}
      <Fretboard
        tuning={tuning}
        tone={tone}
        rootPc={rootPc}
        preferFlat={preferFlat}
        fretWindow={fretWindow}
        scaleIntervals={selectedScale.intervals}
        characteristicIntervals={selectedScale.characteristicIntervals}
        useSharpFour={selectedScale.useSharpFour}
        labelMode={labelMode}
        activeMidi={activeMidi}
      />

      {/* Theory Breakdown + Diatonic Chords */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-[#13151c] p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
            <Sparkles className="h-4 w-4" />
            <span>
              {getNoteName(rootPc, preferFlat)} {selectedScale.name} — Breakdown
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedScale.intervals.map((semi) => {
              const isChar = selectedScale.characteristicIntervals.includes(semi);
              return (
                <div
                  key={semi}
                  className={`rounded-lg border px-2.5 py-1.5 text-center font-mono text-xs ${
                    semi === 0
                      ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                      : isChar
                      ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300'
                      : 'border-slate-700 bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="font-bold">{getNoteName(rootPc + semi, preferFlat)}</div>
                  <div className="text-[10px] opacity-80">
                    {getIntervalName(semi, selectedScale.useSharpFour)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="space-y-2 pt-1 text-xs text-slate-300 leading-relaxed">
            <p>
              <span className="font-semibold text-amber-400">Classical / Acoustic: </span>
              {selectedScale.classicalUse}
            </p>
            <p>
              <span className="font-semibold text-cyan-400">Electric / Polyphia Bridge: </span>
              {selectedScale.modernUse}
            </p>
          </div>
        </div>

        {/* Diatonic Chords */}
        <div className="rounded-xl border border-slate-800 bg-[#13151c] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <Music2 className="h-4 w-4" />
              <span>Diatonic 7th Chords (Click to Audition)</span>
            </div>
          </div>
          {selectedScale.diatonicQualities ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {selectedScale.diatonicQualities.map((q, idx) => {
                const degNote = getNoteName(rootPc + selectedScale.intervals[idx], preferFlat);
                const romanBase = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][idx];
                const isMinor = q.startsWith('m');
                const roman = isMinor ? romanBase.toLowerCase() : romanBase;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => playDiatonicChord(idx, q)}
                    className="rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 text-left transition-all hover:border-cyan-500/50 hover:bg-slate-800"
                  >
                    <div className="font-mono text-[10px] text-slate-400">
                      {roman} {q}
                    </div>
                    <div className="mt-0.5 font-mono text-sm font-bold text-slate-100">
                      {degNote}
                      <span className="text-cyan-400">{q}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              This symmetrical/pentatonic scale is typically used melodically or over static dominant/minor vamps rather than generating 7-note tertian diatonic harmony.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

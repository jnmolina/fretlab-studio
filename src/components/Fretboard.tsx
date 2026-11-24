import React from 'react';
import { getIntervalName, getNoteName, Tuning } from '../lib/theory';
import { audio, GuitarTone } from '../lib/audio';

export interface FretNoteOverride {
  stringIdx: number; // 0 = 6th string (low E), 5 = 1st string (high E)
  fret: number | null; // null = muted
  finger?: string | null;
  isRoot?: boolean;
}

interface FretboardProps {
  tuning: Tuning;
  tone: GuitarTone;
  rootPc: number;
  preferFlat?: boolean;
  maxFrets?: number;
  fretWindow?: [number, number];
  scaleIntervals?: number[];
  characteristicIntervals?: number[];
  useSharpFour?: boolean;
  labelMode?: 'notes' | 'intervals';
  chordOverride?: FretNoteOverride[];
  activeMidi?: number | null;
  onNoteClick?: (midi: number, stringIdx: number, fret: number) => void;
}

const SINGLE_DOT_FRETS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const DOUBLE_DOT_FRETS = new Set([12, 24]);

export const Fretboard: React.FC<FretboardProps> = ({
  tuning,
  tone,
  rootPc,
  preferFlat = false,
  maxFrets = 15,
  fretWindow = [0, 15],
  scaleIntervals = [],
  characteristicIntervals = [],
  useSharpFour = false,
  labelMode = 'intervals',
  chordOverride,
  activeMidi = null,
  onNoteClick,
}) => {
  const scaleSet = new Set(scaleIntervals.map((i) => ((i % 12) + 12) % 12));
  const charSet = new Set(characteristicIntervals.map((i) => ((i % 12) + 12) % 12));

  // Display strings top-to-bottom: 1st string (index 5) down to 6th string (index 0)
  const stringIndices = [5, 4, 3, 2, 1, 0];
  const frets = Array.from({ length: maxFrets + 1 }, (_, i) => i);

  const chordMap = new Map<number, FretNoteOverride>();
  if (chordOverride) {
    chordOverride.forEach((c) => chordMap.set(c.stringIdx, c));
  }

  const handleFretClick = (midi: number, stringIdx: number, fret: number) => {
    audio.playNote(midi, tone, 1.5, 0, 0.85);
    onNoteClick?.(midi, stringIdx, fret);
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-[#0f1118] p-4 shadow-2xl">
      <div className="min-w-[820px] select-none">
        {/* Fret Numbers Header */}
        <div className="mb-2 flex items-center">
          <div className="w-10 shrink-0 text-center text-[11px] font-mono text-slate-500">STR</div>
          {frets.map((fret) => {
            const inWindow = fret >= fretWindow[0] && fret <= fretWindow[1];
            return (
              <div
                key={fret}
                className={`flex-1 text-center font-mono text-xs transition-opacity ${
                  fret === 0 ? 'max-w-[44px] text-amber-400/90 font-semibold' : ''
                } ${inWindow ? 'text-slate-300' : 'text-slate-600 opacity-50'}`}
              >
                {fret}
              </div>
            );
          })}
        </div>

        {/* Strings Grid */}
        <div className="relative rounded-lg border border-slate-800/90 bg-gradient-to-b from-[#171923] via-[#1c1917] to-[#171923] py-2">
          {/* Fretboard inlays */}
          <div className="pointer-events-none absolute inset-0 flex">
            <div className="w-10 shrink-0" />
            {frets.map((fret) => (
              <div
                key={fret}
                className={`relative flex flex-1 items-center justify-center ${
                  fret === 0 ? 'max-w-[44px] border-r-4 border-amber-200/70 bg-slate-950/60' : 'border-r border-slate-700/60'
                }`}
              >
                {SINGLE_DOT_FRETS.has(fret) && (
                  <div className="h-3 w-3 rounded-full bg-slate-600/35 ring-1 ring-slate-500/20" />
                )}
                {DOUBLE_DOT_FRETS.has(fret) && (
                  <div className="flex flex-col gap-10">
                    <div className="h-3 w-3 rounded-full bg-slate-500/45 ring-1 ring-slate-400/25" />
                    <div className="h-3 w-3 rounded-full bg-slate-500/45 ring-1 ring-slate-400/25" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 6 Strings */}
          <div className="relative z-10 flex flex-col gap-3">
            {stringIndices.map((strIdx) => {
              const openMidi = tuning.notes[strIdx];
              const stringLabel = tuning.labels[strIdx];
              const thickness = 1 + (5 - strIdx) * 0.42; // thicker on low strings
              const chordNote = chordMap.get(strIdx);
              const isMutedInChord = chordOverride && chordNote?.fret === null;

              return (
                <div key={strIdx} className="relative flex h-7 items-center">
                  {/* String Label */}
                  <div className="flex w-10 shrink-0 items-center justify-center font-mono text-xs font-semibold text-slate-400">
                    {isMutedInChord ? (
                      <span className="text-rose-400 font-bold">✕</span>
                    ) : (
                      <span>{stringLabel}</span>
                    )}
                  </div>

                  {/* String Wire */}
                  <div
                    className="pointer-events-none absolute left-10 right-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-200/40 via-slate-300/50 to-amber-100/40 shadow-sm"
                    style={{ height: `${thickness}px` }}
                  />

                  {/* Fret Cells */}
                  {frets.map((fret) => {
                    const midi = openMidi + fret;
                    const pc = midi % 12;
                    const intervalSemis = (pc - rootPc + 12) % 12;
                    const isRoot = intervalSemis === 0;
                    const inScale = scaleSet.has(intervalSemis);
                    const isChar = charSet.has(intervalSemis);
                    const inWindow = fret >= fretWindow[0] && fret <= fretWindow[1];

                    const isChordFret = chordNote && chordNote.fret === fret;
                    const isActivePlay = activeMidi === midi;

                    const noteName = getNoteName(pc, preferFlat);
                    const intervalName = getIntervalName(intervalSemis, useSharpFour);
                    const displayLabel =
                      labelMode === 'notes' ? noteName : intervalName;

                    // Determine visibility & styling
                    const showMarker = chordOverride
                      ? isChordFret || (inScale && inWindow)
                      : inScale && inWindow;

                    let badgeClass =
                      'bg-slate-800/90 text-slate-200 border border-slate-600/80 hover:scale-110';
                    if (isChordFret) {
                      badgeClass = isRoot
                        ? 'bg-amber-500 text-slate-950 font-bold border-2 border-amber-200 shadow-lg shadow-amber-500/30 scale-110'
                        : 'bg-cyan-400 text-slate-950 font-bold border-2 border-cyan-100 shadow-lg shadow-cyan-500/25 scale-105';
                    } else if (isRoot && showMarker) {
                      badgeClass =
                        'bg-amber-500 text-slate-950 font-bold border border-amber-300 shadow-md shadow-amber-500/25';
                    } else if (isChar && showMarker) {
                      badgeClass =
                        'bg-cyan-500/90 text-slate-950 font-bold border border-cyan-300 shadow-md shadow-cyan-500/20';
                    } else if (chordOverride && inScale) {
                      badgeClass =
                        'bg-slate-800/45 text-slate-400 border border-slate-700/50 scale-90';
                    }

                    if (isActivePlay) {
                      badgeClass += ' ring-4 ring-white/80 scale-125 z-20';
                    }

                    return (
                      <button
                        key={fret}
                        type="button"
                        onClick={() => handleFretClick(midi, strIdx, fret)}
                        title={`${noteName} (${intervalName}) — Fret ${fret}`}
                        className={`group relative flex h-7 flex-1 items-center justify-center focus:outline-none ${
                          fret === 0 ? 'max-w-[44px]' : ''
                        }`}
                      >
                        {showMarker ? (
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] transition-all duration-150 ${badgeClass}`}
                          >
                            {isChordFret && chordNote?.finger
                              ? labelMode === 'notes'
                                ? noteName
                                : chordNote.finger
                              : displayLabel}
                          </span>
                        ) : (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] text-transparent transition-all group-hover:bg-slate-700/70 group-hover:text-slate-200">
                            {noteName}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full bg-amber-500" /> Root (1)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full bg-cyan-500" /> Characteristic Color / Chord Tone
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full border border-slate-600 bg-slate-800" /> Scale Tone
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            Click any fret to audition pitch ({tone})
          </span>
        </div>
      </div>
    </div>
  );
};

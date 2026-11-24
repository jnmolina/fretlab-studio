import React, { useMemo, useState } from 'react';
import { Volume2, Layers } from 'lucide-react';
import {
  CHORD_VOICINGS,
  CHROMATIC_FLAT,
  CHROMATIC_SHARP,
  ChordVoicing,
  getNoteName,
  SCALES,
  Tuning,
} from '../lib/theory';
import { audio, GuitarTone } from '../lib/audio';
import { Fretboard, FretNoteOverride } from './Fretboard';

interface ChordsViewProps {
  tuning: Tuning;
  tone: GuitarTone;
  rootPc: number;
  setRootPc: (pc: number) => void;
  preferFlat: boolean;
}

const CHORD_CATEGORIES: ChordVoicing['category'][] = [
  'Triads',
  '7th & Shell',
  'Classical Extensions',
  'Modern / Polyphia',
  'Band Signatures (Deftones / Unearth / HORSE)',
];

export const ChordsView: React.FC<ChordsViewProps> = ({
  tuning,
  tone,
  rootPc,
  setRootPc,
  preferFlat,
}) => {
  const [category, setCategory] = useState<ChordVoicing['category']>('Modern / Polyphia');
  const [voicingId, setVoicingId] = useState<string>('polyphia_maj9');
  const [labelMode, setLabelMode] = useState<'intervals' | 'notes'>('notes');
  const [overlayScaleId, setOverlayScaleId] = useState<string>('none');

  const voicing = CHORD_VOICINGS.find((v) => v.id === voicingId) ?? CHORD_VOICINGS[0];
  const filtered = CHORD_VOICINGS.filter((v) => v.category === category);
  const notesList = preferFlat ? CHROMATIC_FLAT : CHROMATIC_SHARP;

  // Compute transposed fret positions for the chosen rootPc
  const { chordOverride, midiNotes, anchorFret } = useMemo(() => {
    const rootStrOpenMidi = tuning.notes[voicing.rootString];
    const rootOffset = voicing.offsets[voicing.rootString] ?? 0;
    // Find fret on rootString that gives rootPc
    let targetRootFret = (rootPc - (rootStrOpenMidi % 12) + 12) % 12;
    let anchor = targetRootFret - rootOffset;
    if (anchor < 0) {
      anchor += 12;
    }
    if (anchor === 0 && targetRootFret < 2) {
      // keep open if valid, otherwise fine
    }

    const overrides: FretNoteOverride[] = [];
    const midis: number[] = [];

    voicing.offsets.forEach((off, strIdx) => {
      if (off === null) {
        overrides.push({ stringIdx: strIdx, fret: null });
      } else {
        const fret = anchor + off;
        overrides.push({
          stringIdx: strIdx,
          fret,
          finger: voicing.fingers[strIdx],
          isRoot: strIdx === voicing.rootString,
        });
        midis.push(tuning.notes[strIdx] + fret);
      }
    });

    return { chordOverride: overrides, midiNotes: midis, anchorFret: anchor };
  }, [tuning, voicing, rootPc]);

  const overlayScale = SCALES.find((s) => s.id === overlayScaleId);

  return (
    <div className="space-y-6">
      {/* Root & Playback Controls */}
      <div className="grid gap-4 rounded-xl border border-slate-800 bg-[#13151c] p-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Chord Root
          </span>
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

        <div className="flex flex-wrap items-end gap-2 lg:col-span-5 lg:justify-end">
          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Scale Overlay
            </span>
            <select
              value={overlayScaleId}
              onChange={(e) => setOverlayScaleId(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="none">Chord Only</option>
              {SCALES.map((s) => (
                <option key={s.id} value={s.id}>
                  + {s.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setLabelMode(labelMode === 'notes' ? 'intervals' : 'notes')}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-500"
          >
            {labelMode === 'notes' ? 'Showing: Notes' : 'Showing: Fingerings'}
          </button>

          <button
            type="button"
            onClick={() => audio.playChord(midiNotes, tone, 25, 2.2)}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400"
          >
            <Volume2 className="h-3.5 w-3.5" /> Strum
          </button>

          <button
            type="button"
            onClick={() => audio.playChord(midiNotes, tone, 150, 2.0)}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
          >
            <Layers className="h-3.5 w-3.5" /> Arpeggiate
          </button>
        </div>
      </div>

      {/* Category & Voicing Selector */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {CHORD_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategory(cat);
                const first = CHORD_VOICINGS.find((v) => v.category === cat);
                if (first) setVoicingId(first.id);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                category === cat
                  ? 'border border-cyan-500/40 bg-cyan-500/20 text-cyan-300'
                  : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => {
                setVoicingId(v.id);
              }}
              className={`rounded-xl border p-3 text-left transition-all ${
                voicing.id === v.id
                  ? 'border-amber-500/60 bg-amber-500/10'
                  : 'border-slate-800 bg-[#13151c] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-amber-300">
                  {getNoteName(rootPc, preferFlat)}
                  {v.symbol}
                </span>
                <span className="font-mono text-[10px] text-slate-400">{v.formula}</span>
              </div>
              <div className="mt-1 text-xs font-medium text-slate-200">{v.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Fretboard */}
      <Fretboard
        tuning={tuning}
        tone={tone}
        rootPc={rootPc}
        preferFlat={preferFlat}
        maxFrets={17}
        fretWindow={[Math.max(0, anchorFret - 1), Math.min(17, anchorFret + 6)]}
        scaleIntervals={overlayScale?.intervals ?? []}
        characteristicIntervals={overlayScale?.characteristicIntervals ?? []}
        chordOverride={chordOverride}
        labelMode={labelMode}
      />

      {/* Voicing Details */}
      <div className="grid gap-4 rounded-xl border border-slate-800 bg-[#13151c] p-4 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-amber-300">
            Harmonic & Fretboard Architecture
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{voicing.description}</p>
          <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs">
            <span className="rounded bg-slate-900 px-2.5 py-1 text-slate-300">
              Anchor Fret: {anchorFret}
            </span>
            <span className="rounded bg-slate-900 px-2.5 py-1 text-slate-300">
              Formula: {voicing.formula}
            </span>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-cyan-300">
            Right-Hand Application (Classical → Hybrid)
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{voicing.pickingHint}</p>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Compass, Volume2, ArrowRightLeft } from 'lucide-react';
import { CIRCLE_OF_FIFTHS, getNoteName } from '../lib/theory';
import { audio, GuitarTone } from '../lib/audio';

interface TheoryViewProps {
  tone: GuitarTone;
  rootPc: number;
  setRootPc: (pc: number) => void;
  setPreferFlat: (v: boolean) => void;
}

const MAJOR_SCALE_SEMIS = [0, 2, 4, 5, 7, 9, 11];
const DIATONIC_7THS = ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5'];
const ROMANS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

export const TheoryView: React.FC<TheoryViewProps> = ({
  tone,
  rootPc,
  setRootPc,
  setPreferFlat,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(() => {
    const idx = CIRCLE_OF_FIFTHS.findIndex((k) => k.pc === rootPc);
    return idx >= 0 ? idx : 0;
  });

  const activeKey = CIRCLE_OF_FIFTHS[selectedIndex];

  const handleSelectKey = (idx: number) => {
    setSelectedIndex(idx);
    const k = CIRCLE_OF_FIFTHS[idx];
    setRootPc(k.pc);
    setPreferFlat(k.preferFlat);
  };

  const playChordQuality = (chordRootPc: number, quality: string) => {
    const base = 48 + (chordRootPc % 12);
    let semis = [0, 4, 7, 11];
    if (quality === 'm7') semis = [0, 3, 7, 10];
    else if (quality === '7') semis = [0, 4, 7, 10];
    else if (quality === 'm7b5') semis = [0, 3, 6, 10];
    audio.playChord(
      semis.map((s) => base + s),
      tone,
      35,
      1.8
    );
  };

  // Secondary dominants in this key
  const secondaryDominants = [
    { label: 'V/ii', targetDegree: 1, desc: 'Resolves to ii (m7)' },
    { label: 'V/iii', targetDegree: 2, desc: 'Resolves to iii (m7)' },
    { label: 'V/IV', targetDegree: 3, desc: 'Resolves to IV (maj7)' },
    { label: 'V/V', targetDegree: 4, desc: 'Resolves to V7' },
    { label: 'V/vi', targetDegree: 5, desc: 'Classic Polyphia III7#9 → vi!' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Interactive Circle of Fifths */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-[#13151c] p-6 lg:col-span-5">
          <div className="mb-4 flex w-full items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              <Compass className="h-4 w-4" />
              <span>Interactive Circle of Fifths</span>
            </div>
            <span className="font-mono text-xs text-slate-400">
              {activeKey.major} / {activeKey.minor} ({activeKey.accidentals})
            </span>
          </div>

          <svg viewBox="0 0 320 320" className="w-full max-w-[300px] select-none">
            {CIRCLE_OF_FIFTHS.map((k, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              const outerR = 122;
              const innerR = 76;
              const ox = 160 + outerR * Math.cos(angle);
              const oy = 160 + outerR * Math.sin(angle);
              const ix = 160 + innerR * Math.cos(angle);
              const iy = 160 + innerR * Math.sin(angle);
              const isSelected = i === selectedIndex;

              return (
                <g
                  key={k.major}
                  onClick={() => handleSelectKey(i)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={ox}
                    cy={oy}
                    r={22}
                    className={`transition-all ${
                      isSelected
                        ? 'fill-amber-500 stroke-amber-200 stroke-2'
                        : 'fill-slate-900 stroke-slate-700 group-hover:fill-slate-800'
                    }`}
                  />
                  <text
                    x={ox}
                    y={oy + 4}
                    textAnchor="middle"
                    className={`font-mono text-xs font-bold ${
                      isSelected ? 'fill-slate-950' : 'fill-slate-200'
                    }`}
                  >
                    {k.major}
                  </text>

                  <circle
                    cx={ix}
                    cy={iy}
                    r={16}
                    className={`transition-all ${
                      isSelected
                        ? 'fill-cyan-500 stroke-cyan-200 stroke-2'
                        : 'fill-slate-950 stroke-slate-800 group-hover:fill-slate-800'
                    }`}
                  />
                  <text
                    x={ix}
                    y={iy + 3.5}
                    textAnchor="middle"
                    className={`font-mono text-[10px] font-semibold ${
                      isSelected ? 'fill-slate-950' : 'fill-slate-400'
                    }`}
                  >
                    {k.minor}
                  </text>
                </g>
              );
            })}
            <circle cx="160" cy="160" r="42" className="fill-[#0b0c10] stroke-slate-800" />
            <text x="160" y="156" textAnchor="middle" className="fill-amber-400 font-mono text-lg font-bold">
              {activeKey.major}
            </text>
            <text x="160" y="174" textAnchor="middle" className="fill-slate-400 font-mono text-[11px]">
              {activeKey.accidentals === '0' ? 'No # / b' : activeKey.accidentals}
            </text>
          </svg>
        </div>

        {/* Harmonic Palette for Selected Key */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-xl border border-slate-800 bg-[#13151c] p-4">
            <h3 className="text-sm font-semibold text-slate-100">
              Diatonic Harmony in {activeKey.major} Major (Relative Minor: {activeKey.minor})
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Click any chord to audition its 7th voicing. Adjacent keys on the Circle (
              {CIRCLE_OF_FIFTHS[(selectedIndex + 11) % 12].major} and{' '}
              {CIRCLE_OF_FIFTHS[(selectedIndex + 1) % 12].major}) share 6 of 7 notes—ideal for smooth modulations.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {MAJOR_SCALE_SEMIS.map((semi, idx) => {
                const chordPc = (activeKey.pc + semi) % 12;
                const name = getNoteName(chordPc, activeKey.preferFlat);
                const qual = DIATONIC_7THS[idx];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => playChordQuality(chordPc, qual)}
                    className="rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-left transition-all hover:border-amber-500/50 hover:bg-slate-800"
                  >
                    <div className="font-mono text-[10px] text-slate-400">{ROMANS[idx]}</div>
                    <div className="mt-0.5 font-mono text-sm font-bold text-slate-100">
                      {name}
                      <span className="text-amber-400">{qual}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Dominants & Tritone Subs */}
          <div className="rounded-xl border border-slate-800 bg-[#13151c] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <ArrowRightLeft className="h-4 w-4" />
              <span>Secondary Dominants & Tritone Substitutions</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Move beyond diatonic chords: precede any diatonic target with a Dominant 7th a 5th above it (or a half-step above it for a Tritone Sub).
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {secondaryDominants.map((sd) => {
                const targetPc = (activeKey.pc + MAJOR_SCALE_SEMIS[sd.targetDegree]) % 12;
                const secDomPc = (targetPc + 7) % 12; // 5th above target
                const tritonePc = (targetPc + 1) % 12; // bII7 above target
                const secDomName = `${getNoteName(secDomPc, activeKey.preferFlat)}7`;
                const tritoneName = `${getNoteName(tritonePc, true)}7`;
                return (
                  <div
                    key={sd.label}
                    className="rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-cyan-300">{sd.label}</span>
                      <button
                        type="button"
                        onClick={() => playChordQuality(secDomPc, '7')}
                        className="flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-amber-300 hover:bg-slate-700"
                      >
                        <Volume2 className="h-3 w-3" /> {secDomName}
                      </button>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">{sd.desc}</div>
                    <div className="mt-1 font-mono text-[10px] text-slate-500">
                      Tritone Sub: <span className="text-slate-300">{tritoneName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Fretboard Geometry & B-String Warp */}
      <div className="rounded-xl border border-slate-800 bg-[#13151c] p-4">
        <h3 className="text-sm font-semibold text-amber-300">
          Fretboard Geometry: Overcoming the B-String Tuning Warp
        </h3>
        <div className="mt-3 grid gap-4 md:grid-cols-3 text-xs text-slate-300 leading-relaxed">
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
            <div className="font-semibold text-slate-100">1. Why Shapes Shift on String 2</div>
            <p className="mt-1 text-slate-400">
              Strings 6→5→4→3 are tuned in Perfect 4ths (5 semitones). Between String 3 (G) and String 2 (B) is a Major 3rd (4 semitones). Any shape crossing from G to B must shift <strong>+1 fret higher</strong> on the B & E strings to preserve the exact interval.
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
            <div className="font-semibold text-slate-100">2. Octave Anchor Maps</div>
            <p className="mt-1 text-slate-400">
              • <strong>6th → 4th / 5th → 3rd:</strong> +2 frets, skip 1 string.<br />
              • <strong>4th → 2nd / 3rd → 1st:</strong> +3 frets, skip 1 string (B-string warp!).<br />
              • <strong>6th → 1st:</strong> Same fret (2 octaves).
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
            <div className="font-semibold text-slate-100">3. Classical vs. Hybrid Navigation</div>
            <p className="mt-1 text-slate-400">
              Classical players navigate vertically in 4-fret positions (Segovia/CAGED) to preserve open-string resonance. Polyphia/modern players combine <strong>3NPS horizontal slides</strong> with <strong>string-skipping octaves</strong> for wide vocal leaps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

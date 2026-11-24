import React, { useEffect, useRef, useState } from 'react';
import { Play, Square, Sparkles } from 'lucide-react';
import { PROGRESSIONS, ProgressionDef, SCALES, Tuning } from '../lib/theory';
import { audio, GuitarTone } from '../lib/audio';
import { Fretboard } from './Fretboard';

interface ProgressionsViewProps {
  tuning: Tuning;
  tone: GuitarTone;
}

const STYLES: ('All' | ProgressionDef['style'])[] = [
  'All',
  'Classical & Acoustic',
  'Jazz & Bossa',
  'Modern / Polyphia / Neo-Soul',
  'Band Signatures (Unearth / Deftones / HORSE)',
];

export const ProgressionsView: React.FC<ProgressionsViewProps> = ({ tuning, tone }) => {
  const [styleFilter, setStyleFilter] = useState<'All' | ProgressionDef['style']>('All');
  const [progId, setProgId] = useState<string>('polyphia_neosoul');
  const [activeChordIdx, setActiveChordIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState<number>(110);
  const [arpMode, setArpMode] = useState<boolean>(true);
  const intervalRef = useRef<number | null>(null);

  const visibleProgs =
    styleFilter === 'All'
      ? PROGRESSIONS
      : PROGRESSIONS.filter((p) => p.style === styleFilter);

  const prog = PROGRESSIONS.find((p) => p.id === progId) ?? PROGRESSIONS[0];
  const currentChord = prog.chords[activeChordIdx] ?? prog.chords[0];
  const targetScale = SCALES.find((s) => s.id === currentChord.scaleId) ?? SCALES[0];

  const stopLoop = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => stopLoop();
  }, []);

  useEffect(() => {
    setBpm(prog.bpm);
    setActiveChordIdx(0);
    stopLoop();
  }, [progId]);

  const startLoop = () => {
    stopLoop();
    setIsPlaying(true);
    let idx = 0;
    const playStep = (stepIdx: number) => {
      const ch = prog.chords[stepIdx];
      setActiveChordIdx(stepIdx);
      audio.playChord(ch.midiNotes, tone, arpMode ? 110 : 28, (60 / bpm) * 3.6);
    };
    playStep(0);
    const barMs = (60 / bpm) * 4 * 1000;
    intervalRef.current = window.setInterval(() => {
      idx = (idx + 1) % prog.chords.length;
      playStep(idx);
    }, barMs);
  };

  return (
    <div className="space-y-6">
      {/* Style Filter */}
      <div className="flex flex-wrap gap-2">
        {STYLES.map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStyleFilter(st)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              styleFilter === st
                ? 'border border-cyan-500/40 bg-cyan-500/20 text-cyan-300'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Progression Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {visibleProgs.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setProgId(p.id)}
            className={`rounded-xl border p-3.5 text-left transition-all ${
              prog.id === p.id
                ? 'border-amber-500/60 bg-amber-500/10'
                : 'border-slate-800 bg-[#13151c] hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-cyan-400">
              <span>{p.style}</span>
              <span>{p.keyLabel}</span>
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-100">{p.title}</div>
            <div className="mt-2 flex flex-wrap gap-1.5 font-mono text-xs">
              {p.chords.map((c, idx) => (
                <span key={idx} className="rounded bg-slate-900 px-2 py-0.5 text-amber-300">
                  {c.symbol}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Active Sequencer & Controls */}
      <div className="rounded-xl border border-slate-800 bg-[#13151c] p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">{prog.title}</h3>
            <p className="mt-0.5 text-xs text-slate-400">{prog.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs">
              <span className="text-slate-400">BPM</span>
              <input
                type="range"
                min={60}
                max={160}
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-20 accent-amber-500"
              />
              <span className="w-7 font-mono font-semibold text-amber-300">{bpm}</span>
            </div>

            <button
              type="button"
              onClick={() => setArpMode(!arpMode)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300"
            >
              Feel: {arpMode ? 'Arpeggiated' : 'Block Strum'}
            </button>

            <button
              type="button"
              onClick={() => (isPlaying ? stopLoop() : startLoop())}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold ${
                isPlaying
                  ? 'bg-rose-500 text-white hover:bg-rose-400'
                  : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
              }`}
            >
              {isPlaying ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isPlaying ? 'Stop Loop' : 'Play Loop'}
            </button>
          </div>
        </div>

        {/* Chord Timeline */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {prog.chords.map((c, idx) => {
            const active = idx === activeChordIdx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveChordIdx(idx);
                  audio.playChord(c.midiNotes, tone, arpMode ? 110 : 28, 1.8);
                }}
                className={`rounded-xl border p-3 text-left transition-all ${
                  active
                    ? 'border-amber-400 bg-amber-500/15 shadow-lg shadow-amber-500/10'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-slate-400">{c.roman}</span>
                  <span className="text-cyan-400">{c.scaleId.replace('_', ' ')}</span>
                </div>
                <div className="mt-1 font-mono text-lg font-bold text-slate-100">{c.symbol}</div>
                <div className="mt-1 text-[11px] text-slate-400">{c.functionNote}</div>
              </button>
            );
          })}
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs text-cyan-200">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
          <div>
            <span className="font-semibold">Voice Leading & Target Scale: </span>
            {prog.voiceLeadingTip} — Fretboard below shows{' '}
            <strong className="text-amber-300">{currentChord.symbol}</strong> target scale (
            {targetScale.name}).
          </div>
        </div>
      </div>

      {/* Live Target Scale Fretboard */}
      <Fretboard
        tuning={tuning}
        tone={tone}
        rootPc={currentChord.rootPc}
        scaleIntervals={targetScale.intervals}
        characteristicIntervals={targetScale.characteristicIntervals}
        useSharpFour={targetScale.useSharpFour}
        labelMode="intervals"
      />
    </div>
  );
};

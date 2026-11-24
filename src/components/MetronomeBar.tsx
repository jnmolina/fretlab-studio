import React, { useEffect, useRef, useState } from 'react';
import { Play, Square } from 'lucide-react';
import { audio } from '../lib/audio';

export const MetronomeBar: React.FC = () => {
  const [bpm, setBpm] = useState(100);
  const [running, setRunning] = useState(false);
  const [beat, setBeat] = useState(0);
  const tapTimesRef = useRef<number[]>([]);
  const timerRef = useRef<number | null>(null);

  const stop = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
    setBeat(0);
  };

  useEffect(() => {
    if (!running) return;
    let b = 0;
    audio.playClick(true);
    setBeat(1);
    timerRef.current = window.setInterval(() => {
      b = (b + 1) % 4;
      setBeat(b + 1);
      audio.playClick(b === 0);
    }, (60 / bpm) * 1000);

    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, [running, bpm]);

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

  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 text-xs">
      <button
        type="button"
        onClick={() => (running ? stop() : setRunning(true))}
        className={`flex h-6 w-6 items-center justify-center rounded ${
          running ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'
        }`}
        title="Toggle Metronome"
      >
        {running ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
      </button>

      <input
        type="number"
        min={40}
        max={220}
        value={bpm}
        onChange={(e) => setBpm(Math.min(220, Math.max(40, Number(e.target.value) || 40)))}
        className="w-12 rounded bg-slate-950 px-1.5 py-0.5 text-center font-mono text-xs text-amber-300 focus:outline-none"
      />
      <span className="font-mono text-[10px] text-slate-400">BPM</span>

      <button
        type="button"
        onClick={handleTap}
        className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300 hover:border-cyan-500/50"
      >
        Tap
      </button>

      <div className="hidden items-center gap-1 sm:flex">
        {[1, 2, 3, 4].map((b) => (
          <span
            key={b}
            className={`h-2 w-2 rounded-full transition-all ${
              running && beat === b
                ? b === 1
                  ? 'bg-amber-400 scale-125'
                  : 'bg-cyan-400 scale-110'
                : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

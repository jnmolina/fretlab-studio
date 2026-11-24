import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Square,
  Save,
  Plus,
  Minus,
  Trash2,
  RotateCcw,
  Check,
  Gauge,
} from 'lucide-react';
import { audio, GuitarTone } from '../lib/audio';
import { Tuning } from '../lib/theory';
import { LessonStage, TabColumn, TabLesson } from '../lib/tabStore';

interface TabStaffEditorProps {
  lesson: TabLesson;
  tuning: Tuning;
  tone: GuitarTone;
  onSaveCustomLesson: (saved: TabLesson) => void;
  onDeleteCustomLesson?: (id: string) => void;
}

const RH_MARKERS = ['↓', '↑', 'p', 'i', 'm', 'a', 'Pick', 'M', 'R', 'PM', 'Sweep', 'Tap', 'Harm', 'H/O'];

export const TabStaffEditor: React.FC<TabStaffEditorProps> = ({
  lesson,
  tuning,
  tone,
  onSaveCustomLesson,
  onDeleteCustomLesson,
}) => {
  const [columns, setColumns] = useState<TabColumn[]>(() =>
    lesson.columns.map((c) => ({ ...c, frets: [...c.frets] }))
  );
  const [title, setTitle] = useState(lesson.title);
  const [bandTag, setBandTag] = useState(lesson.bandTag);
  const [stage, setStage] = useState<LessonStage>(lesson.stage);
  const [description, setDescription] = useState(lesson.description);
  const [bpm, setBpm] = useState(lesson.bpm);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1); // 0.5, 0.75, 1.0 (Guitar Pro Speed Trainer!)
  const [useLessonTone, setUseLessonTone] = useState<boolean>(true);

  // Selected cell on the 6-string staff: { colIdx, strIdx (0=low E .. 5=high e) }
  const [selectedCell, setSelectedCell] = useState<{ colIdx: number; strIdx: number }>({
    colIdx: 0,
    strIdx: 5,
  });
  const [activePlayCol, setActivePlayCol] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const timerRef = useRef<number | null>(null);
  const lastDigitRef = useRef<{ digit: number; time: number } | null>(null);

  const effectiveTone = useLessonTone ? lesson.tone : tone;
  const effectiveBpm = Math.round(bpm * speedMultiplier);

  // Sync state when a different lesson is selected
  useEffect(() => {
    stopPlayback();
    setColumns(lesson.columns.map((c) => ({ ...c, frets: [...c.frets] })));
    setTitle(lesson.title);
    setBandTag(lesson.bandTag);
    setStage(lesson.stage);
    setDescription(lesson.description);
    setBpm(lesson.bpm);
    setSelectedCell({ colIdx: 0, strIdx: 5 });
  }, [lesson.id]);

  const stopPlayback = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setActivePlayCol(null);
  };

  useEffect(() => {
    return () => stopPlayback();
  }, []);

  const playColumnAudio = (col: TabColumn) => {
    const dur = col.rh === 'PM' ? 0.18 : 0.85;
    const vel = col.rh === 'H/O' ? 0.68 : 0.85;
    const activeMidis: number[] = [];
    col.frets.forEach((fret, strIdx) => {
      if (fret !== null) {
        activeMidis.push(tuning.notes[strIdx] + fret);
      }
    });
    if (activeMidis.length === 1) {
      audio.playNote(activeMidis[0], effectiveTone, dur, 0, vel, col.isHarmonic);
    } else if (activeMidis.length > 1) {
      activeMidis.forEach((m, i) => {
        audio.playNote(m, effectiveTone, dur * 1.3, i * 0.018, vel, col.isHarmonic);
      });
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }
    setIsPlaying(true);
    let idx = 0;
    setActivePlayCol(0);
    playColumnAudio(columns[0]);

    const stepMs = (60 / effectiveBpm / 2) * 1000;
    timerRef.current = window.setInterval(() => {
      idx = (idx + 1) % columns.length;
      setActivePlayCol(idx);
      playColumnAudio(columns[idx]);
    }, stepMs);
  };

  const setCellFret = (colIdx: number, strIdx: number, fretVal: number | null) => {
    setColumns((prev) => {
      const next = prev.map((c) => ({ ...c, frets: [...c.frets] }));
      next[colIdx].frets[strIdx] = fretVal;
      if (fretVal !== null) {
        audio.playNote(
          tuning.notes[strIdx] + fretVal,
          effectiveTone,
          0.7,
          0,
          0.8,
          next[colIdx].isHarmonic
        );
      }
      return next;
    });
  };

  const setColumnRh = (colIdx: number, rh: string) => {
    setColumns((prev) => {
      const next = prev.map((c) => ({ ...c, frets: [...c.frets] }));
      next[colIdx].rh = rh;
      next[colIdx].isHarmonic = rh === 'Harm';
      return next;
    });
  };

  // Guitar Pro / TuxGuitar style keyboard navigation & 2-digit fret entry
  const handleStaffKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const { colIdx, strIdx } = selectedCell;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSelectedCell({ colIdx: (colIdx + 1) % columns.length, strIdx });
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSelectedCell({ colIdx: (colIdx - 1 + columns.length) % columns.length, strIdx });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedCell({ colIdx, strIdx: Math.min(5, strIdx + 1) });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedCell({ colIdx, strIdx: Math.max(0, strIdx - 1) });
    } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'x') {
      e.preventDefault();
      setCellFret(colIdx, strIdx, null);
    } else if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      const digit = Number(e.key);
      const now = performance.now();
      let newFret = digit;
      if (
        lastDigitRef.current &&
        now - lastDigitRef.current.time < 550 &&
        (lastDigitRef.current.digit === 1 || lastDigitRef.current.digit === 2)
      ) {
        const candidate = lastDigitRef.current.digit * 10 + digit;
        if (candidate <= 24) newFret = candidate;
      }
      lastDigitRef.current = { digit, time: now };
      setCellFret(colIdx, strIdx, newFret);
    } else if (e.key === ' ') {
      e.preventDefault();
      togglePlayback();
    }
  };

  const addFourSteps = () => {
    setColumns((prev) => [
      ...prev,
      { frets: [null, null, null, null, null, null], rh: '↓' },
      { frets: [null, null, null, null, null, null], rh: '↑' },
      { frets: [null, null, null, null, null, null], rh: '↓' },
      { frets: [null, null, null, null, null, null], rh: '↑' },
    ]);
  };

  const trimFourSteps = () => {
    if (columns.length <= 4) return;
    setColumns((prev) => prev.slice(0, prev.length - 4));
    setSelectedCell((prev) => ({
      ...prev,
      colIdx: Math.min(prev.colIdx, columns.length - 5),
    }));
  };

  const handleSaveCustom = () => {
    const customId = lesson.isCustom ? lesson.id : `custom_${Date.now()}`;
    const saved: TabLesson = {
      ...lesson,
      id: customId,
      title: title.trim() || 'Custom Tab Lesson',
      bandTag: bandTag.trim() || 'Custom',
      stage,
      description,
      bpm,
      isCustom: true,
      columns: columns.map((c) => ({ ...c, frets: [...c.frets] })),
    };
    onSaveCustomLesson(saved);
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 2200);
  };

  // Top-to-bottom strings in Tab Staff: 1st string (index 5) down to 6th string (index 0)
  const displayStrIndices = [5, 4, 3, 2, 1, 0];

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#12141c] p-4 sm:p-5 shadow-xl space-y-4">
      {/* Top Transport & Title Bar (Guitar Pro Style) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex-1 min-w-[220px]">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg border border-transparent bg-transparent px-1.5 py-0.5 text-base font-bold text-slate-100 hover:border-slate-700 focus:border-amber-500 focus:bg-slate-900 focus:outline-none sm:text-lg"
              title="Click to rename lesson before saving"
            />
            <span className="rounded-md bg-cyan-500/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-cyan-300">
              {bandTag}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">{description}</p>
        </div>

        {/* Transport Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Play / Stop */}
          <button
            type="button"
            onClick={togglePlayback}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              isPlaying
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/15'
            }`}
          >
            {isPlaying ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isPlaying ? 'Stop Tab' : 'Play Tab'}</span>
          </button>

          {/* Guitar Pro Speed Trainer (50% / 75% / 100%) */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1 text-xs">
            <Gauge className="ml-1.5 h-3.5 w-3.5 text-cyan-400" />
            {[0.5, 0.75, 1].map((mult) => (
              <button
                key={mult}
                type="button"
                onClick={() => setSpeedMultiplier(mult)}
                className={`rounded-lg px-2 py-1 font-mono text-[11px] font-semibold transition-all ${
                  speedMultiplier === mult
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Speed Trainer Tempo Multiplier"
              >
                {Math.round(mult * 100)}%
              </button>
            ))}
          </div>

          {/* BPM Control */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs">
            <input
              type="number"
              min={40}
              max={220}
              value={bpm}
              onChange={(e) => setBpm(Math.max(40, Math.min(220, Number(e.target.value) || 80)))}
              className="w-11 bg-transparent text-center font-mono font-bold text-amber-300 focus:outline-none"
            />
            <span className="font-mono text-[10px] text-slate-400">BPM</span>
          </div>

          {/* Tone Auto vs Header */}
          <button
            type="button"
            onClick={() => setUseLessonTone(!useLessonTone)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 font-mono text-[11px] text-slate-300 hover:border-slate-700"
          >
            Tone: {effectiveTone}
          </button>
        </div>
      </div>

      {/* TuxGuitar / Guitar Pro 6-Line Tab Staff */}
      <div
        tabIndex={0}
        onKeyDown={handleStaffKeyDown}
        className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0b0d13] p-3 focus:border-amber-500/60 focus:outline-none"
      >
        <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            <strong className="text-amber-300">TuxGuitar / Guitar Pro Staff:</strong> Click any cell &amp; type fret numbers (<code className="text-slate-200">0–24</code>), arrow keys to move, <code className="text-slate-200">Backspace</code> to clear, or use the keypad below.
          </span>
          <span className="font-mono text-[10px] text-slate-500">
            Effective Tempo: {effectiveBpm} BPM
          </span>
        </div>

        <div className="min-w-[640px] select-none py-1">
          {/* Beat Numbers & Measure Bars */}
          <div className="mb-1 flex items-center">
            <div className="w-10 shrink-0 text-center font-mono text-[10px] font-bold text-amber-400">
              TAB
            </div>
            {columns.map((_, colIdx) => (
              <div
                key={colIdx}
                className={`flex-1 text-center font-mono text-[10px] ${
                  colIdx % 4 === 0 ? 'font-bold text-slate-300' : 'text-slate-600'
                }`}
              >
                {colIdx % 4 === 0 ? `M${Math.floor(colIdx / 4) + 1}` : `·`}
              </div>
            ))}
          </div>

          {/* 6 Tab Lines */}
          <div className="relative rounded-lg border border-slate-800/80 bg-[#0f121a] py-2">
            {displayStrIndices.map((strIdx) => {
              const strLabel = tuning.labels[strIdx];
              return (
                <div key={strIdx} className="relative flex h-7 items-center">
                  {/* String Tuning Label */}
                  <div className="w-10 shrink-0 text-center font-mono text-xs font-bold text-slate-400">
                    {strLabel}
                  </div>

                  {/* Horizontal Staff Line */}
                  <div className="pointer-events-none absolute left-10 right-0 top-1/2 h-[1px] -translate-y-1/2 bg-slate-700/70" />

                  {/* Beat Cells */}
                  {columns.map((col, colIdx) => {
                    const fretVal = col.frets[strIdx];
                    const isSelected =
                      selectedCell.colIdx === colIdx && selectedCell.strIdx === strIdx;
                    const isPlayhead = activePlayCol === colIdx;
                    const isBarStart = colIdx > 0 && colIdx % 4 === 0;

                    return (
                      <button
                        key={colIdx}
                        type="button"
                        onClick={() => {
                          setSelectedCell({ colIdx, strIdx });
                          if (fretVal !== null) {
                            audio.playNote(
                              tuning.notes[strIdx] + fretVal,
                              effectiveTone,
                              0.75,
                              0,
                              0.85,
                              col.isHarmonic
                            );
                          }
                        }}
                        className={`relative z-10 flex h-7 flex-1 items-center justify-center font-mono text-xs transition-all focus:outline-none ${
                          isBarStart ? 'border-l border-slate-700/80' : ''
                        } ${isPlayhead ? 'bg-amber-500/15' : ''}`}
                      >
                        <span
                          className={`flex h-6 min-w-[24px] items-center justify-center rounded px-1 font-mono text-xs transition-all ${
                            isSelected
                              ? 'border-2 border-amber-400 bg-amber-500/25 font-bold text-amber-200 shadow-sm'
                              : fretVal !== null
                              ? isPlayhead
                                ? 'bg-amber-400 font-bold text-slate-950 scale-110'
                                : 'bg-[#0f121a] font-bold text-cyan-300'
                              : 'text-transparent hover:bg-slate-800/60 hover:text-slate-500'
                          }`}
                        >
                          {fretVal !== null
                            ? col.isHarmonic
                              ? `<${fretVal}>`
                              : fretVal
                            : '·'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}

            {/* Right-Hand Picking / Articulation Row Below Staff */}
            <div className="mt-1.5 flex items-center border-t border-slate-800/80 pt-1.5">
              <div className="w-10 shrink-0 text-center font-mono text-[10px] text-slate-500">
                RH
              </div>
              {columns.map((col, colIdx) => {
                const isSelectedCol = selectedCell.colIdx === colIdx;
                return (
                  <button
                    key={colIdx}
                    type="button"
                    onClick={() => setSelectedCell((prev) => ({ ...prev, colIdx }))}
                    className={`flex-1 text-center font-mono text-[10px] font-bold py-0.5 rounded transition-colors ${
                      isSelectedCol
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Right-hand picking or articulation"
                  >
                    {col.rh || '·'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Fret Keypad & Articulation Toolbar (Touch / Mobile & Mouse Friendly) */}
      <div className="space-y-2.5 rounded-xl border border-slate-800/90 bg-slate-900/60 p-3">
        {/* Fret Numbers Row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-mono text-[11px] font-semibold text-slate-400">
            Set Fret (Str {6 - selectedCell.strIdx}, Step {selectedCell.colIdx + 1}):
          </span>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setCellFret(selectedCell.colIdx, selectedCell.strIdx, f)}
              className="h-7 min-w-[28px] rounded-lg border border-slate-700/80 bg-slate-800 px-1.5 font-mono text-xs font-semibold text-slate-200 hover:border-amber-400 hover:bg-amber-500/20 active:scale-95"
            >
              {f}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCellFret(selectedCell.colIdx, selectedCell.strIdx, null)}
            className="flex h-7 items-center gap-1 rounded-lg border border-rose-500/40 bg-rose-500/15 px-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/25"
          >
            <Trash2 className="h-3 w-3" /> Clear Note
          </button>
        </div>

        {/* Picking / Articulation Row + Step Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1">
            <span className="mr-1 font-mono text-[11px] font-semibold text-slate-400">
              Picking / Tech:
            </span>
            {RH_MARKERS.map((marker) => (
              <button
                key={marker}
                type="button"
                onClick={() => setColumnRh(selectedCell.colIdx, marker)}
                className={`rounded-md border px-2 py-1 font-mono text-[11px] font-semibold transition-all ${
                  columns[selectedCell.colIdx]?.rh === marker
                    ? 'border-cyan-400 bg-cyan-500/25 text-cyan-200'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                {marker}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={addFourSteps}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-200 hover:border-slate-500"
            >
              <Plus className="h-3 w-3" /> 4 Steps
            </button>
            <button
              type="button"
              onClick={trimFourSteps}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-200 hover:border-slate-500"
            >
              <Minus className="h-3 w-3" /> 4 Steps
            </button>
            <button
              type="button"
              onClick={() =>
                setColumns(lesson.columns.map((c) => ({ ...c, frets: [...c.frets] })))
              }
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
              title="Reset tab to original"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Save Custom Lesson Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-amber-300">Save Edited Tab:</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Lesson Title..."
            className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
          />
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as LessonStage)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 focus:outline-none"
          >
            <option value="warmups">1. Warm-Ups</option>
            <option value="chords_arps">2. Chords &amp; Arpeggios</option>
            <option value="fingerstyle">3. Fingerstyle (P-I-M-A)</option>
            <option value="pick_hybrid">4. Pick &amp; Hybrid / Bands</option>
            <option value="custom">My Custom Lessons</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {lesson.isCustom && onDeleteCustomLesson && (
            <button
              type="button"
              onClick={() => onDeleteCustomLesson(lesson.id)}
              className="flex items-center gap-1 rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/25"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Custom
            </button>
          )}
          <button
            type="button"
            onClick={handleSaveCustom}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400"
          >
            {savedToast ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            <span>{savedToast ? 'Saved to Custom Lessons!' : 'Save as Custom Lesson'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

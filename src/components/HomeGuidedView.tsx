import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Bookmark,
  Flame,
  Layers,
  Hand,
  Zap,
  PenTool,
  Volume2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ArrowUpDown,
  Music,
  Grid,
  ListChecks,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { audio, GuitarTone } from '../lib/audio';
import {
  CHORD_VOICINGS,
  getIntervalName,
  getNoteName,
  SCALES,
  Tuning,
} from '../lib/theory';
import { BackingTrackBar, GrooveId } from './BackingTrackBar';
import {
  BUILTIN_TAB_LESSONS,
  LessonStage,
  loadCustomLessons,
  saveCustomLessons,
  TabColumn,
  TabLesson,
} from '../lib/tabStore';
import { TabStaffEditor } from './TabStaffEditor';
import { Fretboard, FretNoteOverride } from './Fretboard';

interface HomeGuidedViewProps {
  tuning: Tuning;
  tone: GuitarTone;
  rootPc: number;
  preferFlat?: boolean;
  grooveId: GrooveId;
  bpm: number;
  setTone: (t: GuitarTone) => void;
  setRootPc: (pc: number) => void;
  setGrooveId: (g: GrooveId) => void;
  setBpm: (b: number) => void;
}

const STAGES: {
  id: LessonStage;
  stepNum: string;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'warmups',
    stepNum: 'Step 1',
    label: 'Warm-Ups',
    subtitle: 'Spider independence & slurs',
    icon: Flame,
  },
  {
    id: 'chords_arps',
    stepNum: 'Step 2',
    label: 'Chords & Arpeggios',
    subtitle: 'Triads, Maj9 & Dim7 climbs',
    icon: Layers,
  },
  {
    id: 'fingerstyle',
    stepNum: 'Step 3',
    label: 'Fingerstyle (P-I-M-A)',
    subtitle: 'Classical planting & tremolo',
    icon: Hand,
  },
  {
    id: 'pick_hybrid',
    stepNum: 'Step 4',
    label: 'Pick & Hybrid',
    subtitle: 'String-skips, sweeps & dynamics',
    icon: Zap,
  },
  {
    id: 'custom',
    stepNum: 'Saved',
    label: 'My Custom Lessons',
    subtitle: 'Edited & saved tabs',
    icon: Bookmark,
  },
];

export const HomeGuidedView: React.FC<HomeGuidedViewProps> = ({
  tuning,
  tone,
  rootPc,
  preferFlat = false,
  grooveId,
  bpm,
  setTone,
  setRootPc,
  setGrooveId,
  setBpm,
}) => {
  const [activeStage, setActiveStage] = useState<LessonStage>('warmups');
  const [customLessons, setCustomLessons] = useState<TabLesson[]>(() =>
    loadCustomLessons()
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    BUILTIN_TAB_LESSONS[0].id
  );
  const [doneIds, setDoneIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('fretlab_done_lessons_v2');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Live Fretboard Sync state
  const [neckClickWritesTab, setNeckClickWritesTab] = useState<boolean>(true);
  const [backdropScaleId, setBackdropScaleId] = useState<string>('aeolian');
  const [syncedColumn, setSyncedColumn] = useState<TabColumn | null>(null);
  const [externalFretInput, setExternalFretInput] = useState<{
    fret: number;
    stringIdx: number;
    timestamp: number;
  } | null>(null);

  // Coach Flow (D) View Mode ('neck_top' | 'tab_top' | 'zen_tab' | 'zen_neck')
  const [coachViewMode, setCoachViewMode] = useState<
    'neck_top' | 'tab_top' | 'zen_neck' | 'zen_tab'
  >('neck_top');

  // Bento Cockpit (C) Collapsible Side Inspector ('lessons' | 'chords' | 'scales')
  const [showBentoInspector, setShowBentoInspector] = useState<boolean>(true);
  const [bentoLens, setBentoLens] = useState<'lessons' | 'chords' | 'scales'>('lessons');
  const [previewVoicingId, setPreviewVoicingId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('fretlab_done_lessons_v2', JSON.stringify(doneIds));
  }, [doneIds]);

  const allLessons = [...BUILTIN_TAB_LESSONS, ...customLessons];

  const stageLessons =
    activeStage === 'custom'
      ? customLessons
      : allLessons.filter((l) => l.stage === activeStage);

  const activeLesson =
    allLessons.find((l) => l.id === selectedLessonId) ??
    stageLessons[0] ??
    BUILTIN_TAB_LESSONS[0];

  const currentLessonGlobalIndex = Math.max(
    0,
    allLessons.findIndex((l) => l.id === activeLesson.id)
  );

  const handleSelectStage = (st: LessonStage) => {
    setActiveStage(st);
    setPreviewVoicingId(null);
    const list =
      st === 'custom'
        ? customLessons
        : allLessons.filter((l) => l.stage === st);
    if (list.length > 0) {
      handleSelectLesson(list[0]);
    }
  };

  const handleSelectLesson = (l: TabLesson) => {
    setPreviewVoicingId(null);
    setSelectedLessonId(l.id);
    setActiveStage(l.stage);
    setTone(l.tone);
    setRootPc(l.rootPc);
    setGrooveId(l.grooveId);
    setBpm(l.bpm);
  };

  const handleStepLesson = (delta: number) => {
    const nextIdx =
      (currentLessonGlobalIndex + delta + allLessons.length) % allLessons.length;
    handleSelectLesson(allLessons[nextIdx]);
  };

  const toggleDone = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDoneIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSaveCustomLesson = (saved: TabLesson) => {
    setCustomLessons((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      const next = exists
        ? prev.map((p) => (p.id === saved.id ? saved : p))
        : [saved, ...prev];
      saveCustomLessons(next);
      return next;
    });
    setSelectedLessonId(saved.id);
  };

  const handleDeleteCustomLesson = (id: string) => {
    setCustomLessons((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveCustomLessons(next);
      return next;
    });
    setSelectedLessonId(BUILTIN_TAB_LESSONS[0].id);
  };

  const handleCreateBlankTab = () => {
    const blank: TabLesson = {
      id: `custom_${Date.now()}`,
      title: 'New Custom Tab Lesson',
      stage: 'custom',
      bandTag: 'Custom',
      bpm: 100,
      tone: 'electric',
      grooveId: 'basic_rock',
      rootPc: 4,
      harmonyMode: 'minor',
      description:
        'Click any fret on the Live Guitar Neck (or type 0–24 on the staff) to compose your own tab.',
      isCustom: true,
      columns: Array.from({ length: 16 }, (_, i) => ({
        frets: [null, null, null, null, null, null],
        rh: i % 2 === 0 ? '↓' : '↑',
      })),
    };
    handleSaveCustomLesson(blank);
    setActiveStage('custom');
  };

  // Convert active/playing TabColumn OR previewed Chord Voicing into FretNoteOverride[]
  const liveNeckOverrides: FretNoteOverride[] | undefined = useMemo(() => {
    if (previewVoicingId) {
      const v = CHORD_VOICINGS.find((c) => c.id === previewVoicingId);
      if (v) {
        const rootStrOpenMidi = tuning.notes[v.rootString];
        const rootOffset = v.offsets[v.rootString] ?? 0;
        const targetRootFret = (rootPc - (rootStrOpenMidi % 12) + 12) % 12;
        let anchor = targetRootFret - rootOffset;
        if (anchor < 0) anchor += 12;
        return v.offsets.map((off, strIdx) =>
          off === null
            ? { stringIdx: strIdx, fret: null }
            : {
                stringIdx: strIdx,
                fret: anchor + off,
                finger: v.fingers[strIdx],
                isRoot: strIdx === v.rootString,
              }
        );
      }
    }

    if (!syncedColumn) return undefined;
    const hasAnyNote = syncedColumn.frets.some((f) => f !== null);
    if (!hasAnyNote) return undefined;
    const overrides: FretNoteOverride[] = [];
    syncedColumn.frets.forEach((fret, strIdx) => {
      if (fret !== null) {
        overrides.push({
          stringIdx: strIdx,
          fret,
          finger: syncedColumn.rh || String(fret),
          isRoot: (tuning.notes[strIdx] + fret) % 12 === rootPc,
        });
      }
    });
    return overrides;
  }, [syncedColumn, previewVoicingId, tuning, rootPc]);

  // Live Note & Interval Telemetry (from C)
  const activeTelemetry = useMemo(() => {
    if (!syncedColumn) return null;
    const notes: { strNum: number; fret: number; note: string; interval: string }[] = [];
    syncedColumn.frets.forEach((fret, strIdx) => {
      if (fret !== null) {
        const midi = tuning.notes[strIdx] + fret;
        const pc = midi % 12;
        const semi = (pc - rootPc + 12) % 12;
        notes.push({
          strNum: 6 - strIdx,
          fret,
          note: getNoteName(pc, preferFlat),
          interval: getIntervalName(semi),
        });
      }
    });
    return notes;
  }, [syncedColumn, tuning, rootPc, preferFlat]);

  const backdropScale = SCALES.find((s) => s.id === backdropScaleId);
  const isCurrentDone = doneIds.includes(activeLesson.id);
  const completedCount = doneIds.length;

  const neckSection = (coachViewMode === 'neck_top' ||
    coachViewMode === 'tab_top' ||
    coachViewMode === 'zen_neck') && (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0e111a]/95 p-4 shadow-2xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-cyan-500/15 px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
            Live Guitar Neck
          </span>
          {previewVoicingId ? (
            <button
              type="button"
              onClick={() => setPreviewVoicingId(null)}
              className="rounded-lg bg-rose-500/20 px-2.5 py-1 font-mono text-xs font-bold text-rose-200 hover:bg-rose-500/30"
            >
              Showing Chord Voicing · Click to Resume Tab Sync ✕
            </button>
          ) : activeTelemetry && activeTelemetry.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {activeTelemetry.map((t, i) => (
                <span
                  key={i}
                  className="rounded-lg border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-200"
                >
                  Target: {t.note} (Degree {t.interval}) · Str {t.strNum} Fret {t.fret}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-slate-400">
              Click any beat or press Play Tab to track live fretted notes
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setNeckClickWritesTab(!neckClickWritesTab)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-semibold transition-all ${
              neckClickWritesTab
                ? 'border-amber-500/50 bg-amber-500/15 text-amber-200'
                : 'border-white/10 bg-[#07090e] text-slate-300'
            }`}
            title="Toggle whether clicking a fret on the guitar neck writes that note directly into the selected tab beat"
          >
            {neckClickWritesTab ? (
              <>
                <PenTool className="h-3 w-3 text-amber-400" />
                <span>Click Neck → Writes to Tab</span>
              </>
            ) : (
              <>
                <Volume2 className="h-3 w-3 text-cyan-400" />
                <span>Click Neck → Audition Only</span>
              </>
            )}
          </button>

          <select
            value={backdropScaleId}
            onChange={(e) => setBackdropScaleId(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#07090e] px-2.5 py-1 text-xs font-medium text-slate-200 focus:border-cyan-400 focus:outline-none"
          >
            <option value="none">Backdrop: Tab Notes Only</option>
            {SCALES.map((s) => (
              <option key={s.id} value={s.id}>
                Scale Guide: {getNoteName(rootPc, preferFlat)} {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Fretboard
        tuning={tuning}
        tone={tone}
        rootPc={rootPc}
        preferFlat={preferFlat}
        maxFrets={15}
        fretWindow={[0, 15]}
        scaleIntervals={backdropScale?.intervals ?? []}
        characteristicIntervals={backdropScale?.characteristicIntervals ?? []}
        useSharpFour={backdropScale?.useSharpFour}
        labelMode="notes"
        chordOverride={liveNeckOverrides}
        onNoteClick={(_midi, stringIdx, fret) => {
          if (neckClickWritesTab) {
            setPreviewVoicingId(null);
            setExternalFretInput({ fret, stringIdx, timestamp: performance.now() });
          }
        }}
      />
    </div>
  );

  const tabSection = (coachViewMode === 'neck_top' ||
    coachViewMode === 'tab_top' ||
    coachViewMode === 'zen_tab') && (
    <TabStaffEditor
      lesson={activeLesson}
      tuning={tuning}
      tone={tone}
      onSaveCustomLesson={handleSaveCustomLesson}
      onDeleteCustomLesson={handleDeleteCustomLesson}
      onActiveColumnChange={(col) => setSyncedColumn(col)}
      externalFretInput={externalFretInput}
    />
  );

  return (
    <div className="space-y-4">
      {/* 1. ANCHORED COACH FLOW DECK (from D): Guided Stepper, Tempo Challenge, View Flipper & Inline Backing */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-[#0f131f] via-[#131827] to-[#0f131f] p-4 shadow-2xl space-y-3.5">
        {/* Top Row: 5-Stage Progress Rail + Bento Dock Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {STAGES.map((st) => {
              const Icon = st.icon;
              const active = activeStage === st.id;
              const count =
                st.id === 'custom'
                  ? customLessons.length
                  : allLessons.filter((l) => l.stage === st.id).length;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleSelectStage(st.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    active
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'border border-white/[0.06] bg-white/[0.03] text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>
                    {st.stepNum}: {st.label}
                  </span>
                  <span
                    className={`rounded-full px-1.5 font-mono text-[10px] ${
                      active ? 'bg-slate-950/20 text-slate-950' : 'bg-white/[0.06] text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden font-mono text-xs text-slate-300 sm:inline">
              Mastered: <strong className="text-emerald-400">{completedCount}</strong> /{' '}
              {allLessons.length}
            </span>
            <button
              type="button"
              onClick={() => setShowBentoInspector(!showBentoInspector)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                showBentoInspector
                  ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-200'
                  : 'border-white/10 bg-[#07090e] text-slate-300 hover:border-white/25'
              }`}
              title="Toggle Bento Side Inspector (Practice Plan / Quick Chords / Scale Radar)"
            >
              {showBentoInspector ? (
                <PanelLeftClose className="h-3.5 w-3.5 text-cyan-400" />
              ) : (
                <PanelLeftOpen className="h-3.5 w-3.5 text-cyan-400" />
              )}
              <span>{showBentoInspector ? 'Hide Side Inspector' : 'Open Bento Inspector'}</span>
            </button>
          </div>
        </div>

        {/* Middle Row: Coach Prev / Active Lesson Title / Mark Complete / Tempo Challenge / View Flipper / Next */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => handleStepLesson(-1)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#07090e] text-slate-200 hover:border-amber-400 hover:text-amber-300"
              title="Previous Lesson"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="font-bold text-amber-400">
                  LESSON {currentLessonGlobalIndex + 1} OF {allLessons.length}
                </span>
                <span className="text-slate-500">·</span>
                <span className="truncate text-cyan-300">{activeLesson.bandTag}</span>
              </div>
              <h2 className="truncate text-base font-extrabold text-white sm:text-xl">
                {activeLesson.title}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => toggleDone(activeLesson.id)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                isCurrentDone
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                  : 'border-white/15 bg-white/[0.05] text-slate-200 hover:border-emerald-400'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isCurrentDone ? 'Completed' : 'Mark Complete'}</span>
            </button>

            <button
              type="button"
              onClick={() => setBpm(Math.min(220, bpm + 5))}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-bold text-cyan-200 transition-all hover:bg-cyan-400 hover:text-slate-950"
              title="Bump tempo up by +5 BPM for progressive speed training"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+5 BPM ({bpm + 5})</span>
            </button>

            {/* View Order Flipper */}
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#07090e] p-1 text-xs">
              <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-amber-400" />
              {(
                [
                  { id: 'neck_top', label: 'Neck → Tab' },
                  { id: 'tab_top', label: 'Tab → Neck' },
                  { id: 'zen_tab', label: 'Tab Only' },
                  { id: 'zen_neck', label: 'Neck Only' },
                ] as const
              ).map((vm) => (
                <button
                  key={vm.id}
                  type="button"
                  onClick={() => setCoachViewMode(vm.id)}
                  className={`rounded-lg px-2 py-1 text-[11px] font-bold transition-all ${
                    coachViewMode === vm.id
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {vm.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleStepLesson(1)}
              className="flex items-center gap-1 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400"
            >
              <span>Next Lesson</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bottom Row: Inline Drum + Root Bass + Harmony Accompaniment Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-3">
          <BackingTrackBar
            rootPc={rootPc}
            preferFlat={preferFlat}
            grooveId={grooveId}
            setGrooveId={setGrooveId}
            bpm={bpm}
            setBpm={setBpm}
          />
          <button
            type="button"
            onClick={handleCreateBlankTab}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-400 hover:text-slate-950"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Custom Tab</span>
          </button>
        </div>
      </div>

      {/* 2. WORKSPACE BODY: C's Bento Side Inspector (when open) + D's Coach Stage */}
      <div className="grid gap-4 lg:grid-cols-12">
        {showBentoInspector && (
          <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-[#0e111a]/95 p-3.5 shadow-2xl lg:col-span-4">
            {/* C's 3-Lens Segmented Switcher */}
            <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/[0.06] bg-[#07090e] p-1">
              <button
                type="button"
                onClick={() => {
                  setBentoLens('lessons');
                  setPreviewVoicingId(null);
                }}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all ${
                  bentoLens === 'lessons'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListChecks className="h-3.5 w-3.5" />
                <span>Lessons</span>
              </button>
              <button
                type="button"
                onClick={() => setBentoLens('chords')}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all ${
                  bentoLens === 'chords'
                    ? 'bg-cyan-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
                <span>Chords</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setBentoLens('scales');
                  setPreviewVoicingId(null);
                }}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all ${
                  bentoLens === 'scales'
                    ? 'bg-emerald-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Music className="h-3.5 w-3.5" />
                <span>Scales</span>
              </button>
            </div>

            {/* LENS 1: Stage Lessons List */}
            {bentoLens === 'lessons' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {STAGES.find((s) => s.id === activeStage)?.label} ({stageLessons.length})
                  </span>
                </div>
                {stageLessons.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-800 bg-[#07090e] p-4 text-center text-xs text-slate-400">
                    No saved custom tabs yet. Edit any tab on the right and click{' '}
                    <strong className="text-amber-300">Save as Custom Lesson</strong>.
                  </div>
                ) : (
                  <div className="max-h-[520px] space-y-1.5 overflow-y-auto pr-1">
                    {stageLessons.map((item) => {
                      const isSelected = activeLesson.id === item.id;
                      const isDone = doneIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectLesson(item)}
                          className={`cursor-pointer rounded-xl border p-2.5 transition-all ${
                            isSelected
                              ? 'border-amber-400/70 bg-gradient-to-r from-amber-500/15 to-cyan-500/10'
                              : 'border-white/[0.05] bg-[#07090e]/90 hover:border-white/15'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <button
                              type="button"
                              onClick={(e) => toggleDone(item.id, e)}
                              className="mt-0.5 text-slate-500 hover:text-emerald-400"
                            >
                              {isDone ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <Circle className="h-4 w-4" />
                              )}
                            </button>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between font-mono text-[10px]">
                                <span className="text-cyan-400">{item.bandTag}</span>
                                <span className="text-amber-300">{item.bpm} BPM</span>
                              </div>
                              <div
                                className={`mt-0.5 text-xs font-bold leading-snug ${
                                  isDone ? 'line-through text-slate-500' : 'text-slate-100'
                                }`}
                              >
                                {item.title}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* LENS 2: Quick Chord Overlay */}
            {bentoLens === 'chords' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Tap to audition &amp; project onto Live Neck ({getNoteName(rootPc, preferFlat)}):
                  </span>
                  {previewVoicingId && (
                    <button
                      type="button"
                      onClick={() => setPreviewVoicingId(null)}
                      className="rounded bg-rose-500/20 px-2 py-0.5 font-mono text-[10px] text-rose-300"
                    >
                      Resume Tab
                    </button>
                  )}
                </div>
                <div className="max-h-[520px] space-y-1.5 overflow-y-auto pr-1">
                  {CHORD_VOICINGS.map((v) => {
                    const active = previewVoicingId === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setPreviewVoicingId(v.id);
                          const rootStrOpenMidi = tuning.notes[v.rootString];
                          const rootOffset = v.offsets[v.rootString] ?? 0;
                          const targetRootFret = (rootPc - (rootStrOpenMidi % 12) + 12) % 12;
                          let anchor = targetRootFret - rootOffset;
                          if (anchor < 0) anchor += 12;
                          const midis: number[] = [];
                          v.offsets.forEach((off, sIdx) => {
                            if (off !== null) midis.push(tuning.notes[sIdx] + anchor + off);
                          });
                          audio.playChord(midis, tone, 45, 1.8);
                        }}
                        className={`w-full rounded-xl border p-2.5 text-left transition-all ${
                          active
                            ? 'border-cyan-400 bg-cyan-500/15'
                            : 'border-white/[0.06] bg-[#07090e] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-amber-300">
                            {getNoteName(rootPc, preferFlat)}
                            {v.symbol}
                          </span>
                          <span className="font-mono text-[10px] text-cyan-400">{v.formula}</span>
                        </div>
                        <div className="mt-0.5 text-xs font-semibold text-slate-200">{v.name}</div>
                        <div className="mt-0.5 text-[10px] text-slate-400 line-clamp-1">
                          {v.pickingHint}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LENS 3: Quick Scale Radar */}
            {bentoLens === 'scales' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400">
                  Scale backdrop for <strong className="text-amber-300">{getNoteName(rootPc, preferFlat)}</strong> on the Live Neck:
                </div>
                <div className="max-h-[380px] space-y-1.5 overflow-y-auto pr-1">
                  {SCALES.map((s) => {
                    const active = backdropScaleId === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setBackdropScaleId(s.id)}
                        className={`w-full rounded-xl border p-2.5 text-left transition-all ${
                          active
                            ? 'border-emerald-400 bg-emerald-500/15'
                            : 'border-white/[0.06] bg-[#07090e] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-100">{s.name}</span>
                          <span className="font-mono text-[10px] text-emerald-300">
                            {s.formula}
                          </span>
                        </div>
                        <div className="mt-0.5 text-[10px] text-slate-400 line-clamp-1">
                          {s.modernUse}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {backdropScale && (
                  <div className="rounded-xl border border-white/[0.06] bg-[#07090e] p-2.5">
                    <div className="font-mono text-[10px] uppercase text-slate-400">
                      Notes in {getNoteName(rootPc, preferFlat)} {backdropScale.name}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {backdropScale.intervals.map((semi) => (
                        <span
                          key={semi}
                          className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-xs font-bold text-amber-300"
                        >
                          {getNoteName(rootPc + semi, preferFlat)}{' '}
                          <span className="text-[10px] font-normal text-slate-400">
                            ({getIntervalName(semi, backdropScale.useSharpFour)})
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Right / Main Coach Stage (8 cols when Bento Inspector open, 12 cols when collapsed) */}
        <div
          className={`space-y-4 ${
            showBentoInspector ? 'lg:col-span-8' : 'lg:col-span-12'
          }`}
        >
          {coachViewMode === 'tab_top' ? (
            <>
              {tabSection}
              {neckSection}
            </>
          ) : (
            <>
              {neckSection}
              {tabSection}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

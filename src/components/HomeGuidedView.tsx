import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Bookmark,
  Flame,
  Layers,
  Hand,
  Zap,
  Drum,
  Search,
  Sparkles,
} from 'lucide-react';
import { GuitarTone } from '../lib/audio';
import { Tuning } from '../lib/theory';
import { GrooveId } from './BackingTrackBar';
import {
  BUILTIN_TAB_LESSONS,
  LessonStage,
  loadCustomLessons,
  saveCustomLessons,
  TabLesson,
} from '../lib/tabStore';
import { TabStaffEditor } from './TabStaffEditor';

interface HomeGuidedViewProps {
  tuning: Tuning;
  tone: GuitarTone;
  setTone: (t: GuitarTone) => void;
  setRootPc: (pc: number) => void;
  setGrooveId: (g: GrooveId) => void;
  setBpm: (b: number) => void;
  onOpenSearch: () => void;
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
    label: 'Pick & Hybrid (Bands)',
    subtitle: 'Polyphia · Unearth · Deftones · HORSE',
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
  setTone,
  setRootPc,
  setGrooveId,
  setBpm,
  onOpenSearch,
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

  const handleSelectStage = (st: LessonStage) => {
    setActiveStage(st);
    const list =
      st === 'custom'
        ? customLessons
        : allLessons.filter((l) => l.stage === st);
    if (list.length > 0) {
      handleSelectLesson(list[0]);
    }
  };

  const handleSelectLesson = (l: TabLesson) => {
    setSelectedLessonId(l.id);
    setTone(l.tone);
    setRootPc(l.rootPc);
    setGrooveId(l.grooveId);
    setBpm(l.bpm);
  };

  const toggleDone = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
      description: 'Click any string/beat cell below and type fret numbers (0–24) to write your own tab.',
      isCustom: true,
      columns: Array.from({ length: 16 }, (_, i) => ({
        frets: [null, null, null, null, null, null],
        rh: i % 2 === 0 ? '↓' : '↑',
      })),
    };
    handleSaveCustomLesson(blank);
    setActiveStage('custom');
  };

  return (
    <div className="space-y-5">
      {/* Prominent Home Search & AI Guitar Coach Bar */}
      <button
        type="button"
        onClick={onOpenSearch}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-[#12141c] via-cyan-950/20 to-[#12141c] px-4 py-3 text-left shadow-lg transition-all hover:border-cyan-400 hover:shadow-cyan-500/10"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
            <Search className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100 sm:text-sm">
              <span>Search Tabs, Scales, Chords or Ask the AI Guitar Coach</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            </div>
            <div className="truncate text-[11px] text-slate-400">
              Try: &ldquo;Notes &amp; chords in D Harmonic Minor&rdquo;, &ldquo;Maj9 voicing&rdquo;, &ldquo;Hybrid picking&rdquo;, &ldquo;Sweep tap&rdquo;...
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950">
            Open Search / AI
          </span>
          <kbd className="hidden rounded-md border border-slate-700 bg-slate-900 px-2 py-1 font-mono text-[10px] text-slate-300 sm:inline-block">
            Ctrl+K
          </kbd>
        </div>
      </button>

      {/* 4-Stage Learning Plan Stepper */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
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
              className={`flex flex-col justify-between rounded-2xl border p-3.5 text-left transition-all ${
                active
                  ? 'border-amber-500/70 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                  : 'border-slate-800/90 bg-[#12141c] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-mono text-[10px] font-bold uppercase ${
                    active ? 'text-amber-400' : 'text-slate-500'
                  }`}
                >
                  {st.stepNum} · {count} {count === 1 ? 'Tab' : 'Tabs'}
                </span>
                <Icon
                  className={`h-4 w-4 ${
                    active ? 'text-amber-400' : 'text-slate-500'
                  }`}
                />
              </div>
              <div className="mt-2">
                <div className="text-sm font-bold text-slate-100">{st.label}</div>
                <div className="mt-0.5 text-[11px] text-slate-400 truncate">
                  {st.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Workspace: Left Lesson List (4 cols) + Right Tab Staff Editor (8 cols) */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left Sidebar: Lessons in Current Stage */}
        <div className="space-y-3 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {activeStage === 'custom'
                ? 'My Custom Lessons'
                : `${STAGES.find((s) => s.id === activeStage)?.label} Lessons`}
            </h2>
            <button
              type="button"
              onClick={handleCreateBlankTab}
              className="flex items-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20"
            >
              <Plus className="h-3.5 w-3.5" /> New Blank Tab
            </button>
          </div>

          {stageLessons.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-[#12141c] p-6 text-center space-y-2">
              <p className="text-xs text-slate-400">
                You haven’t saved any custom lessons yet. Edit any tab on the right and click{' '}
                <strong className="text-amber-300">Save as Custom Lesson</strong>, or start a blank tab!
              </p>
              <button
                type="button"
                onClick={handleCreateBlankTab}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950"
              >
                <Plus className="h-3.5 w-3.5" /> Create Blank Tab
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {stageLessons.map((item) => {
                const isSelected = activeLesson.id === item.id;
                const isDone = doneIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectLesson(item)}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                      isSelected
                        ? 'border-amber-500/60 bg-amber-500/10 shadow-md'
                        : 'border-slate-800/90 bg-[#12141c] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => toggleDone(item.id, e)}
                        className="mt-0.5 text-slate-500 hover:text-emerald-400 focus:outline-none"
                        title="Mark practiced"
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] font-semibold uppercase text-cyan-400">
                            {item.bandTag}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {item.bpm} BPM
                          </span>
                        </div>
                        <div
                          className={`mt-0.5 text-xs font-bold sm:text-sm ${
                            isDone ? 'line-through text-slate-400' : 'text-slate-100'
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

          {/* Quick Tip Box for Drums + Bass/Harmony */}
          <div className="rounded-xl border border-slate-800/90 bg-[#12141c] p-3.5 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Drum className="h-3.5 w-3.5 text-amber-400" />
              <span>Practice with Drums + Root Bass/Harmony</span>
            </div>
            <p className="leading-relaxed">
              Selecting any lesson automatically loads its recommended <strong>Drum Beat</strong>,{' '}
              <strong>Root Bass Note</strong>, and <strong>BPM</strong> in the top bar. Hit{' '}
              <strong className="text-amber-300">Play Drums + Bass</strong> at the top to jam along!
            </p>
          </div>
        </div>

        {/* Right Area: Guitar Pro / TuxGuitar Interactive Tab Editor */}
        <div className="lg:col-span-8">
          <TabStaffEditor
            lesson={activeLesson}
            tuning={tuning}
            tone={tone}
            onSaveCustomLesson={handleSaveCustomLesson}
            onDeleteCustomLesson={handleDeleteCustomLesson}
          />
        </div>
      </div>
    </div>
  );
};

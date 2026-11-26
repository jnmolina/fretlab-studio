import { useEffect, useState } from 'react';
import {
  Home,
  Music,
  Grid,
  Compass,
  BookOpen,
  Sliders,
  Search,
  Command,
  Columns,
} from 'lucide-react';
import { CHROMATIC_FLAT, CHROMATIC_SHARP, TUNINGS, TuningId } from './lib/theory';
import { GuitarTone } from './lib/audio';
import { BackingTrackBar, GrooveId } from './components/BackingTrackBar';
import { HomeGuidedView } from './components/HomeGuidedView';
import { LessonPlanView } from './components/LessonPlanView';
import { ScalesView } from './components/ScalesView';
import { ChordsView } from './components/ChordsView';
import { TheoryView } from './components/TheoryView';
import { ProgressionsView } from './components/ProgressionsView';
import { PracticeView } from './components/PracticeView';
import { SearchAssistantModal } from './components/SearchAssistantModal';

export type MainTabId =
  | 'home'
  | 'scales'
  | 'chords'
  | 'theory_prog'
  | 'roadmap';

export type LayoutVariant = 'A' | 'B' | 'C' | 'D';

const TABS: {
  id: MainTabId;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'home', label: 'Coach & Tab Studio', shortLabel: 'Coach', icon: Home },
  { id: 'scales', label: 'Scales & Modes', shortLabel: 'Scales', icon: Music },
  { id: 'chords', label: 'Chords & Voicings', shortLabel: 'Chords', icon: Grid },
  { id: 'theory_prog', label: 'Progressions & Circle', shortLabel: 'Harmony', icon: Compass },
  { id: 'roadmap', label: '12-Step Roadmap & Ear Lab', shortLabel: 'Roadmap', icon: BookOpen },
];

const TONE_OPTIONS: { id: GuitarTone; label: string }[] = [
  { id: 'classical', label: 'Nylon' },
  { id: 'acoustic', label: 'Steel' },
  { id: 'electric', label: 'Clean Elec' },
  { id: 'highgain', label: 'High-Gain' },
  { id: 'chiptune', label: '8-Bit' },
];

export function App() {
  const [activeTab, setActiveTab] = useState<MainTabId>('home');
  // Global Views support C's Bento Side-by-Side Split OR Single Focus!
  const [theoryBentoSplit, setTheoryBentoSplit] = useState<boolean>(true);
  const [theorySubTab, setTheorySubTab] = useState<'progressions' | 'circle'>('progressions');
  const [roadmapBentoSplit, setRoadmapBentoSplit] = useState<boolean>(true);
  const [roadmapSubTab, setRoadmapSubTab] = useState<'plan' | 'ear'>('plan');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const [tone, setTone] = useState<GuitarTone>('classical');
  const [tuningId, setTuningId] = useState<TuningId>('standard');
  const [rootPc, setRootPc] = useState<number>(4); // E
  const [preferFlat, setPreferFlat] = useState<boolean>(false);
  const [grooveId, setGrooveId] = useState<GrooveId>('basic_rock');
  const [bpm, setBpm] = useState<number>(96);

  const tuning = TUNINGS[tuningId];
  const noteNames = preferFlat ? CHROMATIC_FLAT : CHROMATIC_SHARP;

  // Global Ctrl+K / Cmd+K shortcut to open Search & AI Coach
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleApplyPreset = (preset: {
    tone: GuitarTone;
    tuningId: TuningId;
    rootPc: number;
    grooveId: GrooveId;
  }) => {
    setTone(preset.tone);
    setTuningId(preset.tuningId);
    setRootPc(preset.rootPc);
    setGrooveId(preset.grooveId);
  };

  return (
    <div className="min-h-screen bg-[#07080d] pb-20 text-slate-100 selection:bg-cyan-500/30 sm:pb-10">
      <div className="pointer-events-none fixed inset-x-0 -top-44 z-0 mx-auto h-80 max-w-5xl rounded-full bg-gradient-to-r from-amber-500/10 via-cyan-500/12 to-indigo-500/10 blur-3xl" />

      {/* 1. GLOBAL BENTO COCKPIT HEADER (Navbar Gallery Glass Bar + Musical Control Ribbon) */}
      <div className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#0a0c14]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1460px] flex-wrap items-center justify-between gap-2.5 px-3 py-2.5 sm:px-5">
          {/* Brand + Global View Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="group flex items-center gap-2 text-left focus:outline-none"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-cyan-400 font-mono text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 transition-transform group-hover:scale-105">
                FL
              </div>
              <span className="text-sm font-extrabold tracking-tight text-white">
                FretLab
              </span>
            </button>

            <nav className="hidden items-center gap-1 rounded-2xl border border-white/[0.08] bg-[#111420] p-1 sm:flex">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      active
                        ? 'bg-gradient-to-r from-cyan-400 to-amber-400 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Omnibox Search & AI Trigger */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="group flex items-center gap-2.5 rounded-xl border border-cyan-500/35 bg-cyan-500/10 px-3.5 py-1.5 text-xs text-cyan-100 transition-all hover:border-cyan-400 hover:bg-cyan-500/20"
            >
              <Search className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden md:inline">
                Search tabs, scales, chords, or ask AI Coach...
              </span>
              <span className="md:hidden font-semibold">Search / Ask AI</span>
              <kbd className="hidden items-center gap-0.5 rounded border border-white/10 bg-slate-950/80 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300 sm:inline-flex">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>
          </div>
        </div>

        {/* Dynamic Musical Control Ribbon (1-Tap Key Wheel + 1-Tap Tone Pills + Tuning + Global Backing when outside Home) */}
        <div className="border-t border-white/[0.05] bg-[#0d1019]/90">
          <div className="mx-auto flex max-w-[1460px] flex-wrap items-center justify-between gap-2.5 px-3 py-1.5 sm:px-5">
            {/* 1-Tap Chromatic Root Key Wheel */}
            <div className="flex items-center gap-1 overflow-x-auto py-0.5">
              <span className="mr-1 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Key:
              </span>
              {noteNames.map((n, pc) => {
                const active = rootPc === pc;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRootPc(pc)}
                    className={`h-6 min-w-[26px] rounded-lg px-1.5 font-mono text-xs font-bold transition-all ${
                      active
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 scale-105'
                        : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.1] hover:text-white'
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>

            {/* 1-Tap Tone Pills + Tuning + Inline Backing Bar on Global Views */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl border border-white/[0.07] bg-[#07080d] p-0.5">
                {TONE_OPTIONS.map((t) => {
                  const active = tone === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id)}
                      className={`rounded-lg px-2 py-0.5 text-[11px] font-bold transition-all ${
                        active
                          ? 'bg-cyan-400 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#07080d] px-2.5 py-1 text-xs">
                <Sliders className="h-3 w-3 text-amber-400" />
                <select
                  value={tuningId}
                  onChange={(e) => setTuningId(e.target.value as TuningId)}
                  className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none"
                >
                  {Object.values(TUNINGS).map((tun) => (
                    <option key={tun.id} value={tun.id} className="bg-slate-900">
                      {tun.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* When viewing Scales, Chords, Harmony, or Roadmap, dock the Drum+Bass bar right in the global ribbon */}
              {activeTab !== 'home' && (
                <BackingTrackBar
                  rootPc={rootPc}
                  preferFlat={preferFlat}
                  grooveId={grooveId}
                  setGrooveId={setGrooveId}
                  bpm={bpm}
                  setBpm={setBpm}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE */}
      <main className="relative z-10 mx-auto max-w-[1460px] px-3 py-4 sm:px-5">
        {/* HOME: Anchored on D's Coach Flow + C's Collapsible Bento Side Inspector */}
        {activeTab === 'home' && (
          <HomeGuidedView
            tuning={tuning}
            tone={tone}
            rootPc={rootPc}
            preferFlat={preferFlat}
            grooveId={grooveId}
            bpm={bpm}
            setTone={setTone}
            setRootPc={setRootPc}
            setGrooveId={setGrooveId}
            setBpm={setBpm}
          />
        )}

        {/* GLOBAL VIEW: SCALES & MODES */}
        {activeTab === 'scales' && (
          <ScalesView
            tuning={tuning}
            tone={tone}
            rootPc={rootPc}
            setRootPc={setRootPc}
            preferFlat={preferFlat}
            setPreferFlat={setPreferFlat}
          />
        )}

        {/* GLOBAL VIEW: CHORDS & VOICINGS */}
        {activeTab === 'chords' && (
          <ChordsView
            tuning={tuning}
            tone={tone}
            rootPc={rootPc}
            setRootPc={setRootPc}
            preferFlat={preferFlat}
          />
        )}

        {/* GLOBAL VIEW: PROGRESSIONS & CIRCLE OF FIFTHS (With C-Style Bento Cockpit Split Option) */}
        {activeTab === 'theory_prog' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/[0.08] bg-[#0e111a] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTheoryBentoSplit(false);
                    setTheorySubTab('progressions');
                  }}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    !theoryBentoSplit && theorySubTab === 'progressions'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  Progressions &amp; Loops
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTheoryBentoSplit(false);
                    setTheorySubTab('circle');
                  }}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    !theoryBentoSplit && theorySubTab === 'circle'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  Circle of Fifths &amp; Geometry
                </button>
              </div>

              <button
                type="button"
                onClick={() => setTheoryBentoSplit(!theoryBentoSplit)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                  theoryBentoSplit
                    ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-200'
                    : 'border-white/10 bg-[#07090e] text-slate-400'
                }`}
              >
                <Columns className="h-3.5 w-3.5" />
                <span>Bento Split View: {theoryBentoSplit ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {theoryBentoSplit ? (
              <div className="grid gap-5 xl:grid-cols-12">
                <div className="rounded-2xl border border-white/[0.08] bg-[#0e111a]/80 p-4 xl:col-span-7">
                  <div className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                    Chord Progressions &amp; Target Scale Sequencer
                  </div>
                  <ProgressionsView tuning={tuning} tone={tone} />
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-[#0e111a]/80 p-4 xl:col-span-5">
                  <div className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Circle of Fifths &amp; Secondary Dominants
                  </div>
                  <TheoryView
                    tone={tone}
                    rootPc={rootPc}
                    setRootPc={setRootPc}
                    setPreferFlat={setPreferFlat}
                  />
                </div>
              </div>
            ) : theorySubTab === 'progressions' ? (
              <ProgressionsView tuning={tuning} tone={tone} />
            ) : (
              <TheoryView
                tone={tone}
                rootPc={rootPc}
                setRootPc={setRootPc}
                setPreferFlat={setPreferFlat}
              />
            )}
          </div>
        )}

        {/* GLOBAL VIEW: 12-STEP ROADMAP & EAR LAB (With C-Style Bento Cockpit Split Option) */}
        {activeTab === 'roadmap' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/[0.08] bg-[#0e111a] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRoadmapBentoSplit(false);
                    setRoadmapSubTab('plan');
                  }}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    !roadmapBentoSplit && roadmapSubTab === 'plan'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  Style Customizer &amp; 12-Step Roadmap
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRoadmapBentoSplit(false);
                    setRoadmapSubTab('ear');
                  }}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    !roadmapBentoSplit && roadmapSubTab === 'ear'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  Ear Training &amp; Daily Routine Timer
                </button>
              </div>

              <button
                type="button"
                onClick={() => setRoadmapBentoSplit(!roadmapBentoSplit)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                  roadmapBentoSplit
                    ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-200'
                    : 'border-white/10 bg-[#07090e] text-slate-400'
                }`}
              >
                <Columns className="h-3.5 w-3.5" />
                <span>Bento Split View: {roadmapBentoSplit ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {roadmapBentoSplit ? (
              <div className="space-y-6">
                <LessonPlanView
                  onApplyPreset={handleApplyPreset}
                  onNavigateTab={(t) => {
                    if (t === 'techniques') setActiveTab('home');
                    else if (t === 'scales') setActiveTab('scales');
                    else if (t === 'chords') setActiveTab('chords');
                    else if (t === 'progressions' || t === 'theory') {
                      setActiveTab('theory_prog');
                    }
                  }}
                />
                <div className="rounded-2xl border border-white/[0.08] bg-[#0e111a]/80 p-4">
                  <div className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Ear Recognition Lab &amp; 60-Minute Daily Routine Checklist
                  </div>
                  <PracticeView tone={tone} />
                </div>
              </div>
            ) : roadmapSubTab === 'plan' ? (
              <LessonPlanView
                onApplyPreset={handleApplyPreset}
                onNavigateTab={(t) => {
                  if (t === 'techniques') setActiveTab('home');
                  else if (t === 'scales') setActiveTab('scales');
                  else if (t === 'chords') setActiveTab('chords');
                  else if (t === 'progressions' || t === 'theory') {
                    setActiveTab('theory_prog');
                  } else if (t === 'practice') {
                    setRoadmapSubTab('ear');
                  }
                }}
              />
            ) : (
              <PracticeView tone={tone} />
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-white/10 bg-[#07080d]/95 px-2 py-1.5 backdrop-blur-md sm:hidden">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                active ? 'text-cyan-400' : 'text-slate-400'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.shortLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* Search Command Palette + AI Guitar Coach Modal */}
      <SearchAssistantModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateTab={(t) => setActiveTab(t)}
        onApplyPreset={handleApplyPreset}
        setRootPc={setRootPc}
        setGrooveId={setGrooveId}
        setTone={setTone}
      />
    </div>
  );
}

export default App;

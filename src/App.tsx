import { useEffect, useState } from 'react';
import {
  Home,
  Music,
  Grid,
  Compass,
  BookOpen,
  Sliders,
  Search,
  Sparkles,
} from 'lucide-react';
import { TUNINGS, TuningId } from './lib/theory';
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

const TABS: {
  id: MainTabId;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'home', label: 'Home & Tab Studio', shortLabel: 'Home / Tab', icon: Home },
  { id: 'scales', label: 'Scales & Fretboard', shortLabel: 'Scales', icon: Music },
  { id: 'chords', label: 'Chords & Arpeggios', shortLabel: 'Chords', icon: Grid },
  { id: 'theory_prog', label: 'Progressions & Theory', shortLabel: 'Theory', icon: Compass },
  { id: 'roadmap', label: 'Band Roadmap & Ear Lab', shortLabel: 'Bands', icon: BookOpen },
];

export function App() {
  const [activeTab, setActiveTab] = useState<MainTabId>('home');
  const [theorySubTab, setTheorySubTab] = useState<'progressions' | 'circle'>('progressions');
  const [roadmapSubTab, setRoadmapSubTab] = useState<'plan' | 'ear'>('plan');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const [tone, setTone] = useState<GuitarTone>('classical');
  const [tuningId, setTuningId] = useState<TuningId>('standard');
  const [rootPc, setRootPc] = useState<number>(4); // E
  const [preferFlat, setPreferFlat] = useState<boolean>(false);
  const [grooveId, setGrooveId] = useState<GrooveId>('basic_rock');
  const [bpm, setBpm] = useState<number>(96);

  const tuning = TUNINGS[tuningId];

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
    <div className="min-h-screen bg-[#0b0c10] pb-20 text-slate-100 sm:pb-8">
      {/* Minimal Top Studio Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0b0c10]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2.5 px-3 py-2.5 sm:px-4">
          {/* Brand + Desktop Navigation */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-cyan-500 font-mono text-xs font-black text-slate-950 shadow-md shadow-amber-500/20">
                FL
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-slate-100">
                  FretLab
                </h1>
                <p className="hidden text-[10px] text-slate-400 xl:block">
                  Tab Studio &amp; Guitar Mastery
                </p>
              </div>
            </button>

            {/* Clean Desktop Pill Nav */}
            <nav className="hidden items-center gap-1 rounded-xl border border-slate-800/90 bg-[#12141c] p-1 sm:flex">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                      active
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Search & AI Guitar Coach Trigger Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition-all hover:border-cyan-400 hover:bg-cyan-500/20"
              title="Quick Search & AI Guitar Coach (Ctrl+K)"
            >
              <Search className="h-3.5 w-3.5 text-cyan-400" />
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>Search / Ask AI</span>
              <kbd className="hidden rounded bg-slate-900/90 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 md:inline-block">
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Compact Tone, Tuning & Drum+Bass/Harmony Bar */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Guitar Tone Selector */}
            <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900 px-2 py-1 text-xs">
              <span className="mr-1.5 text-[10px] font-mono uppercase text-slate-400">Tone</span>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as GuitarTone)}
                className="bg-transparent font-medium text-amber-300 focus:outline-none"
              >
                <option value="classical" className="bg-slate-900">Classical Nylon</option>
                <option value="acoustic" className="bg-slate-900">Acoustic Steel</option>
                <option value="electric" className="bg-slate-900">Clean Electric</option>
                <option value="highgain" className="bg-slate-900">High-Gain Metal</option>
                <option value="chiptune" className="bg-slate-900">8-Bit Chiptune</option>
              </select>
            </div>

            {/* Tuning Selector */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-2 py-1 text-xs">
              <Sliders className="h-3 w-3 text-cyan-400" />
              <select
                value={tuningId}
                onChange={(e) => setTuningId(e.target.value as TuningId)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none"
              >
                {Object.values(TUNINGS).map((tun) => (
                  <option key={tun.id} value={tun.id} className="bg-slate-900">
                    {tun.name}
                  </option>
                ))}
              </select>
            </div>

            <BackingTrackBar
              rootPc={rootPc}
              preferFlat={preferFlat}
              grooveId={grooveId}
              setGrooveId={setGrooveId}
              bpm={bpm}
              setBpm={setBpm}
            />
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-7xl px-3 py-5 sm:px-4">
        {activeTab === 'home' && (
          <HomeGuidedView
            tuning={tuning}
            tone={tone}
            setTone={setTone}
            setRootPc={setRootPc}
            setGrooveId={setGrooveId}
            setBpm={setBpm}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        )}

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

        {activeTab === 'chords' && (
          <ChordsView
            tuning={tuning}
            tone={tone}
            rootPc={rootPc}
            setRootPc={setRootPc}
            preferFlat={preferFlat}
          />
        )}

        {activeTab === 'theory_prog' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTheorySubTab('progressions')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  theorySubTab === 'progressions'
                    ? 'bg-amber-500 text-slate-950'
                    : 'border border-slate-800 bg-[#12141c] text-slate-300'
                }`}
              >
                Chord Progressions &amp; Loops
              </button>
              <button
                type="button"
                onClick={() => setTheorySubTab('circle')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  theorySubTab === 'circle'
                    ? 'bg-amber-500 text-slate-950'
                    : 'border border-slate-800 bg-[#12141c] text-slate-300'
                }`}
              >
                Circle of Fifths &amp; Fretboard Geometry
              </button>
            </div>
            {theorySubTab === 'progressions' ? (
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

        {activeTab === 'roadmap' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRoadmapSubTab('plan')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  roadmapSubTab === 'plan'
                    ? 'bg-amber-500 text-slate-950'
                    : 'border border-slate-800 bg-[#12141c] text-slate-300'
                }`}
              >
                Band Style Customizer &amp; 12-Step Roadmap
              </button>
              <button
                type="button"
                onClick={() => setRoadmapSubTab('ear')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  roadmapSubTab === 'ear'
                    ? 'bg-amber-500 text-slate-950'
                    : 'border border-slate-800 bg-[#12141c] text-slate-300'
                }`}
              >
                Ear Training &amp; Daily Routine Timer
              </button>
            </div>
            {roadmapSubTab === 'plan' ? (
              <LessonPlanView
                onApplyPreset={handleApplyPreset}
                onNavigateTab={(t) => {
                  if (t === 'techniques') setActiveTab('home');
                  else if (t === 'scales') setActiveTab('scales');
                  else if (t === 'chords') setActiveTab('chords');
                  else if (t === 'progressions' || t === 'theory') {
                    setActiveTab('theory_prog');
                    setTheorySubTab(t === 'progressions' ? 'progressions' : 'circle');
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

      {/* Mobile Bottom Navigation Bar (Visible on Phone/Small Screens) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-800 bg-[#0b0c10]/95 px-2 py-2 backdrop-blur-md sm:hidden">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                active ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default App;

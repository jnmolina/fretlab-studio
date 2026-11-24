import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Sparkles,
  X,
  ArrowRight,
  Music,
  Grid,
  Repeat,
  Drum,
  FileMusic,
  Send,
  KeyRound,
} from 'lucide-react';
import {
  CHORD_VOICINGS,
  getIntervalName,
  getNoteName,
  PROGRESSIONS,
  SCALES,
  TuningId,
} from '../lib/theory';
import { audio, GuitarTone } from '../lib/audio';
import { GROOVES, GrooveId } from './BackingTrackBar';
import { BUILTIN_TAB_LESSONS, loadCustomLessons } from '../lib/tabStore';
import { MainTabId } from '../App';

export interface AppAction {
  label: string;
  run: () => void;
}

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Tab Lesson' | 'Scale / Mode' | 'Chord Voicing' | 'Progression' | 'Drum Groove' | 'Band Preset';
  keywords: string;
  actionLabel: string;
  onSelect: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  actions?: AppAction[];
}

interface SearchAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: MainTabId) => void;
  onApplyPreset: (preset: {
    tone: GuitarTone;
    tuningId: TuningId;
    rootPc: number;
    grooveId: GrooveId;
  }) => void;
  setRootPc: (pc: number) => void;
  setGrooveId: (g: GrooveId) => void;
  setTone: (t: GuitarTone) => void;
}

const NOTE_LOOKUP: Record<string, { pc: number; flat: boolean }> = {
  c: { pc: 0, flat: false },
  'c#': { pc: 1, flat: false },
  db: { pc: 1, flat: true },
  d: { pc: 2, flat: false },
  'd#': { pc: 3, flat: false },
  eb: { pc: 3, flat: true },
  e: { pc: 4, flat: false },
  f: { pc: 5, flat: true },
  'f#': { pc: 6, flat: false },
  gb: { pc: 6, flat: true },
  g: { pc: 7, flat: false },
  'g#': { pc: 8, flat: false },
  ab: { pc: 8, flat: true },
  a: { pc: 9, flat: false },
  'a#': { pc: 10, flat: false },
  bb: { pc: 10, flat: true },
  b: { pc: 11, flat: false },
};

const QUICK_PROMPTS = [
  'Notes & chords in D Harmonic Minor',
  'How to play like Unearth?',
  'Deftones shoegaze chords & tuning',
  'HORSE the band 8-bit arpeggios',
  'Bridge Classical PIMA to Polyphia hybrid',
  'What order should I practice?',
];

export const SearchAssistantModal: React.FC<SearchAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onApplyPreset,
  setRootPc,
  setGrooveId,
  setTone,
}) => {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Ask me any music theory question (e.g. "notes in D harmonic minor", "B-string warp", "how to play like Unearth/Deftones/Polyphia/HORSE") or type above to search every tab, scale, chord, and drum loop in FretLab.',
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [geminiKey, setGeminiKey] = useState<string>(
    () => localStorage.getItem('fretlab_gemini_key') || ''
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSaveKey = (val: string) => {
    setGeminiKey(val);
    if (val.trim()) localStorage.setItem('fretlab_gemini_key', val.trim());
    else localStorage.removeItem('fretlab_gemini_key');
  };

  // Build searchable catalog of the entire app
  const catalog: SearchItem[] = useMemo(() => {
    const items: SearchItem[] = [];
    const allTabs = [...BUILTIN_TAB_LESSONS, ...loadCustomLessons()];

    // 1. Tab Lessons
    allTabs.forEach((t) => {
      items.push({
        id: `tab_${t.id}`,
        title: t.title,
        subtitle: `${t.bandTag} · ${t.bpm} BPM (${t.stage})`,
        category: 'Tab Lesson',
        keywords: `${t.title} ${t.bandTag} ${t.description} ${t.stage} tab lesson`,
        actionLabel: 'Open Tab',
        onSelect: () => {
          setTone(t.tone);
          setRootPc(t.rootPc);
          setGrooveId(t.grooveId);
          onNavigateTab('home');
          onClose();
        },
      });
    });

    // 2. Band Presets
    const bandPresets: {
      name: string;
      desc: string;
      kw: string;
      preset: { tone: GuitarTone; tuningId: TuningId; rootPc: number; grooveId: GrooveId };
    }[] = [
      {
        name: 'Unearth (Buz McGrath & Ken Susi Rig)',
        desc: 'High-Gain · Drop C · D Harmonic Minor · Double-Kick Gallop',
        kw: 'unearth metalcore harmonic minor sweep tap buz mcgrath ken susi',
        preset: { tone: 'highgain', tuningId: 'drop_c', rootPc: 2, grooveId: 'unearth_metalcore' },
      },
      {
        name: 'Deftones (Stephen Carpenter Shoegaze Rig)',
        desc: 'High-Gain · Drop D · Sus2/Add9/Maj7 · Half-Time Boom-Groove',
        kw: 'deftones stephen carpenter chino moreno shoegaze drop d add9 maj7',
        preset: { tone: 'highgain', tuningId: 'drop_d', rootPc: 2, grooveId: 'deftones_shoegaze' },
      },
      {
        name: 'HORSE the band (Nintendocore Rig)',
        desc: '8-Bit Chiptune · E Harmonic Minor / Diminished · Fast Nintendocore Beat',
        kw: 'horse the band nintendocore 8-bit chiptune david isen erik engstrom',
        preset: { tone: 'chiptune', tuningId: 'standard', rootPc: 4, grooveId: 'horse_nintendocore' },
      },
      {
        name: 'Polyphia (Tim Henson Hybrid Rig)',
        desc: 'Clean Electric · Standard · E Minor / Maj9 · Trap-Math Pocket',
        kw: 'polyphia tim henson scott lepage hybrid picking maj9 m11 trap math',
        preset: { tone: 'electric', tuningId: 'standard', rootPc: 4, grooveId: 'polyphia_trap' },
      },
      {
        name: 'Classical & Acoustic P-I-M-A Rig',
        desc: 'Classical Nylon · Standard · A Minor · Acoustic / Fingerstyle Pulse',
        kw: 'classical acoustic nylon pima giuliani tremolo fingerstyle',
        preset: { tone: 'classical', tuningId: 'standard', rootPc: 9, grooveId: 'acoustic_bossa' },
      },
    ];

    bandPresets.forEach((bp) => {
      items.push({
        id: `band_${bp.name}`,
        title: bp.name,
        subtitle: bp.desc,
        category: 'Band Preset',
        keywords: bp.kw,
        actionLabel: 'Load Rig',
        onSelect: () => {
          onApplyPreset(bp.preset);
          onNavigateTab('roadmap');
          onClose();
        },
      });
    });

    // 3. Scales
    SCALES.forEach((s) => {
      items.push({
        id: `scale_${s.id}`,
        title: `${s.name} Scale`,
        subtitle: `Formula: ${s.formula} · ${s.category}`,
        category: 'Scale / Mode',
        keywords: `${s.name} ${s.formula} ${s.category} ${s.classicalUse} ${s.modernUse} scale mode`,
        actionLabel: 'View Scale',
        onSelect: () => {
          onNavigateTab('scales');
          onClose();
        },
      });
    });

    // 4. Chord Voicings
    CHORD_VOICINGS.forEach((v) => {
      items.push({
        id: `chord_${v.id}`,
        title: v.name,
        subtitle: `${v.category} · Formula: ${v.formula}`,
        category: 'Chord Voicing',
        keywords: `${v.name} ${v.symbol} ${v.category} ${v.description} ${v.pickingHint} chord voicing`,
        actionLabel: 'View Chord',
        onSelect: () => {
          onNavigateTab('chords');
          onClose();
        },
      });
    });

    // 5. Progressions
    PROGRESSIONS.forEach((p) => {
      items.push({
        id: `prog_${p.id}`,
        title: p.title,
        subtitle: `${p.style} · ${p.keyLabel} (${p.bpm} BPM)`,
        category: 'Progression',
        keywords: `${p.title} ${p.style} ${p.keyLabel} ${p.description} progression`,
        actionLabel: 'Open Loop',
        onSelect: () => {
          onNavigateTab('theory_prog');
          onClose();
        },
      });
    });

    // 6. Drum Grooves
    GROOVES.forEach((g) => {
      items.push({
        id: `groove_${g.id}`,
        title: g.name,
        subtitle: `Default ${g.defaultBpm} BPM · Bass: ${g.bassStyle}`,
        category: 'Drum Groove',
        keywords: `${g.name} drum loop beat groove backing bass`,
        actionLabel: 'Select Beat',
        onSelect: () => {
          setGrooveId(g.id);
          onClose();
        },
      });
    });

    return items;
  }, [ isOpen ]);

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog.slice(0, 6);
    const tokens = q.split(/\s+/);
    return catalog
      .filter((item) => {
        const hay = `${item.title} ${item.subtitle} ${item.keywords}`.toLowerCase();
        return tokens.every((tok) => hay.includes(tok));
      })
      .slice(0, 7);
  }, [query, catalog]);

  // Built-in Local Music Theory & Guitar Coach Agent
  const generateLocalCoachAnswer = (rawQuestion: string): ChatMessage => {
    const q = rawQuestion.trim().toLowerCase();

    // 1. Check if asking for notes/chords in a specific key + scale (e.g., "D harmonic minor", "E dorian", "F# lydian")
    const keyMatch = q.match(/\b([a-g][#b]?)\s+(major|ionian|dorian|phrygian\s+dominant|phrygian|lydian\s+dominant|lydian|mixolydian|aeolian|natural\s+minor|harmonic\s+minor|melodic\s+minor|locrian|altered|minor\s+pentatonic|major\s+pentatonic|blues|hirajoshi|diminished)/i);
    if (keyMatch) {
      const noteKey = keyMatch[1].toLowerCase();
      const scaleNameQuery = keyMatch[2].toLowerCase();
      const noteInfo = NOTE_LOOKUP[noteKey] ?? { pc: 4, flat: false };
      const matchedScale =
        SCALES.find((s) => s.name.toLowerCase().includes(scaleNameQuery)) ??
        (scaleNameQuery.includes('natural minor')
          ? SCALES.find((s) => s.id === 'aeolian')
          : SCALES[0])!;

      const rootName = getNoteName(noteInfo.pc, noteInfo.flat);
      const scaleNotes = matchedScale.intervals.map((semi) =>
        getNoteName(noteInfo.pc + semi, noteInfo.flat)
      );
      const charNotes = matchedScale.characteristicIntervals.map(
        (semi) =>
          `${getNoteName(noteInfo.pc + semi, noteInfo.flat)} (${getIntervalName(
            semi,
            matchedScale.useSharpFour
          )})`
      );
      const diatonicList = matchedScale.diatonicQualities
        ? matchedScale.diatonicQualities
            .map((qual, idx) => `${getNoteName(noteInfo.pc + matchedScale.intervals[idx], noteInfo.flat)}${qual}`)
            .join(' · ')
        : 'Used primarily for melodic/riff phrasing over static or power-chord harmony.';

      return {
        role: 'assistant',
        text: `${rootName} ${matchedScale.name}\n• Notes: ${scaleNotes.join(' – ')}\n• Formula: ${matchedScale.formula} (Color tones: ${charNotes.join(', ')})\n• Diatonic 7th Chords: ${diatonicList}\n• Application: ${matchedScale.classicalUse} → ${matchedScale.modernUse}`,
        actions: [
          {
            label: `Set Root to ${rootName} & Open Scales`,
            run: () => {
              setRootPc(noteInfo.pc);
              onNavigateTab('scales');
              onClose();
            },
          },
          {
            label: `Audition ${rootName} ${matchedScale.name}`,
            run: () => {
              const base = 48 + noteInfo.pc;
              [...matchedScale.intervals, 12].forEach((semi, idx) => {
                audio.playNote(base + semi, 'classical', 0.6, idx * 0.18, 0.85);
              });
            },
          },
        ],
      };
    }

    // 2. Band-specific coaching: Unearth
    if (q.includes('unearth') || q.includes('metalcore') || q.includes('sweep')) {
      return {
        role: 'assistant',
        text: `Unearth Style (Buz McGrath & Ken Susi):\n• Scales: D or E Harmonic Minor (1 2 b3 4 5 b6 7), Phrygian Dominant (1 b2 3 4 5 b6 b7), and Symmetrical Diminished 7th runs.\n• Techniques: Tight 16th-note palm-muted low-root pedal points (5-7-8 Gothenburg phrasing) transitioning into 3-string sweep-picked arpeggios with a tapped apex.\n• Recommended Practice: Start with "Unearth 5-7-8 Pedal-Point Gallop & Sweep-Tap Apex" at 50% or 75% speed in Tab Studio.`,
        actions: [
          {
            label: 'Load Unearth Rig (Drop C + Double-Kick)',
            run: () => {
              onApplyPreset({
                tone: 'highgain',
                tuningId: 'drop_c',
                rootPc: 2,
                grooveId: 'unearth_metalcore',
              });
              onNavigateTab('home');
              onClose();
            },
          },
        ],
      };
    }

    // 3. Band-specific coaching: Deftones
    if (q.includes('deftones') || q.includes('shoegaze') || q.includes('carpenter')) {
      return {
        role: 'assistant',
        text: `Deftones Style (Stephen Carpenter & Chino Moreno):\n• Tunings & Chords: Drop D or Drop C. Instead of plain power chords, stack lush extensions—Sus2(add9), Maj7#11 (Lydian float), and m(add9)—letting high open strings drone against moving lower shapes.\n• Dynamics: Contrast tight, syncopated staccato palm-muted chugs with wide, unmuted shoegaze chord blooms over a half-time boom-bap groove.`,
        actions: [
          {
            label: 'Load Deftones Rig & Shoegaze Groove',
            run: () => {
              onApplyPreset({
                tone: 'highgain',
                tuningId: 'drop_d',
                rootPc: 2,
                grooveId: 'deftones_shoegaze',
              });
              onNavigateTab('home');
              onClose();
            },
          },
          {
            label: 'View Deftones Sus2(add9) Voicing',
            run: () => {
              onNavigateTab('chords');
              onClose();
            },
          },
        ],
      };
    }

    // 4. Band-specific coaching: HORSE the band
    if (q.includes('horse') || q.includes('nintendocore') || q.includes('8-bit') || q.includes('chiptune')) {
      return {
        role: 'assistant',
        text: `HORSE the band Style (David Isen & Erik Engstrom — Nintendocore):\n• Scales & Harmony: Dramatic Harmonic Minor ("Castlevania boss-fight" raised 7th) colliding with symmetrical Diminished/tritone panic stabs (dim(b9)) and sudden bright major triads.\n• Technique: Use hybrid picking (Pick + M + R) and tapping to double wide-interval 8-bit synth arpeggios cleanly at 135+ BPM.`,
        actions: [
          {
            label: 'Load HORSE 8-Bit Rig & Nintendocore Beat',
            run: () => {
              onApplyPreset({
                tone: 'chiptune',
                tuningId: 'standard',
                rootPc: 4,
                grooveId: 'horse_nintendocore',
              });
              onNavigateTab('home');
              onClose();
            },
          },
        ],
      };
    }

    // 5. Classical -> Polyphia Hybrid Picking Bridge
    if (q.includes('polyphia') || q.includes('hybrid') || q.includes('pima') || q.includes('tim henson')) {
      return {
        role: 'assistant',
        text: `Classical P-I-M-A → Polyphia Hybrid Picking Bridge:\n• On Classical/Acoustic, you train p (thumb), i (index), m (middle), and a (ring) with sequential planting.\n• On Electric, your thumb + index hold the flatpick (replacing p & i on bass strings), while Middle (M) and Ring (R) pluck treble strings 3, 2, and 1.\n• This lets you leap across wide Maj9 and m11 string-skip voicings at 115+ BPM with zero flatpick travel, plus add 12th/7th fret natural & artificial harmonics.`,
        actions: [
          {
            label: 'Load Polyphia Hybrid Rig & Open Tab Studio',
            run: () => {
              onApplyPreset({
                tone: 'electric',
                tuningId: 'standard',
                rootPc: 4,
                grooveId: 'polyphia_trap',
              });
              onNavigateTab('home');
              onClose();
            },
          },
        ],
      };
    }

    // 6. Practice Order / Lesson Plan
    if (q.includes('order') || q.includes('plan') || q.includes('practice') || q.includes('start') || q.includes('routine')) {
      return {
        role: 'assistant',
        text: `Recommended Practice Order (Home 4-Stage Flow):\n1. Step 1 — Warm-Ups (10m): 1-2-3-4 Chromatic Spider & Left-Hand Slurs (clean tone, strict alternation).\n2. Step 2 — Chords & Arpeggios (15m): Triad inversions up the neck, Lush Add9/Maj9 rolls, and Dim7/Harmonic Minor climbs.\n3. Step 3 — Fingerstyle P-I-M-A (15m): Giuliani sequential planting & p-a-m-i tremolo.\n4. Step 4 — Pick & Hybrid Band Application (20m): Turn on the Drum + Root-Bass/Harmony backing loop and practice Polyphia hybrid skips, Unearth sweep-taps, Deftones blooms, or HORSE 8-bit arpeggios.`,
        actions: [
          {
            label: 'Go to 4-Stage Home Practice',
            run: () => {
              onNavigateTab('home');
              onClose();
            },
          },
          {
            label: 'View Full 12-Step Band Roadmap',
            run: () => {
              onNavigateTab('roadmap');
              onClose();
            },
          },
        ],
      };
    }

    // 7. B-String Warp / Fretboard Geometry
    if (q.includes('warp') || q.includes('b-string') || q.includes('b string') || q.includes('octave') || q.includes('geometry')) {
      return {
        role: 'assistant',
        text: `The B-String Tuning Warp:\n• Strings 6→5→4→3 are tuned in Perfect 4ths (5 semitones).\n• Between String 3 (G) and String 2 (B) is a Major 3rd (4 semitones), before returning to a Perfect 4th from B→E.\n• Rule: Any interval, triad, or scale shape crossing from the G string to the B string must shift +1 fret higher on strings 2 and 1!`,
        actions: [
          {
            label: 'Open Theory & Fretboard Geometry',
            run: () => {
              onNavigateTab('theory_prog');
              onClose();
            },
          },
        ],
      };
    }

    // Fallback smart response combining top search matches
    const topMatches = filteredResults.slice(0, 3);
    const matchNames =
      topMatches.length > 0
        ? topMatches.map((m) => `• ${m.title} (${m.category})`).join('\n')
        : '• Try searching for any scale (Harmonic Minor, Lydian, Dorian), band (Unearth, Deftones, Polyphia, HORSE), or technique (Hybrid, PIMA, Sweep).';

    return {
      role: 'assistant',
      text: `Here is what I found in FretLab for "${rawQuestion}":\n${matchNames}\n\nTip: You can also ask me for any key + scale (e.g. "notes in E Phrygian Dominant" or "C# Harmonic Minor") or band style!`,
      actions: topMatches.map((m) => ({
        label: `${m.actionLabel}: ${m.title}`,
        run: m.onSelect,
      })),
    };
  };

  const handleAskAgent = async (promptText?: string) => {
    const q = (promptText ?? query).trim();
    if (!q) return;

    const userMsg: ChatMessage = { role: 'user', text: q };
    setChatHistory((prev) => [...prev, userMsg]);
    if (!promptText) setQuery('');

    // If user configured a Gemini API key, call Gemini 4 Hydrogen via Interactions REST API with local fallback
    if (geminiKey.trim()) {
      setIsThinking(true);
      try {
        const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': geminiKey.trim(),
          },
          body: JSON.stringify({
            model: 'gemini-4-hydrogen',
            system_instruction:
              'You are the FretLab Studio AI Guitar Coach for a 20-year guitarist mastering classical/acoustic PIMA, music theory, scales, chords, and bridging to Polyphia hybrid picking, Unearth melodic metalcore, Deftones shoegaze metal, and HORSE the band nintendocore. Keep answers concise (3-5 bullet points max) and practical.',
            input: q,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const localFallback = generateLocalCoachAnswer(q);
          const aiText =
            data?.output_text ||
            data?.outputs?.[0]?.text ||
            localFallback.text;
          setChatHistory((prev) => [
            ...prev,
            {
              role: 'assistant',
              text: aiText,
              actions: localFallback.actions,
            },
          ]);
          setIsThinking(false);
          return;
        }
      } catch {
        // Fall through cleanly to instant local coach
      }
      setIsThinking(false);
    }

    const reply = generateLocalCoachAnswer(q);
    setChatHistory((prev) => [...prev, reply]);
  };

  if (!isOpen) return null;

  const getCategoryIcon = (cat: SearchItem['category']) => {
    switch (cat) {
      case 'Tab Lesson':
        return <FileMusic className="h-3.5 w-3.5 text-amber-400" />;
      case 'Scale / Mode':
        return <Music className="h-3.5 w-3.5 text-cyan-400" />;
      case 'Chord Voicing':
        return <Grid className="h-3.5 w-3.5 text-emerald-400" />;
      case 'Progression':
        return <Repeat className="h-3.5 w-3.5 text-purple-400" />;
      case 'Drum Groove':
        return <Drum className="h-3.5 w-3.5 text-rose-400" />;
      default:
        return <Sparkles className="h-3.5 w-3.5 text-amber-300" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 p-3 pt-12 backdrop-blur-sm sm:p-6 sm:pt-16"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-700/90 bg-[#12141c] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search & Ask Input Bar */}
        <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-amber-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAskAgent();
              if (e.key === 'Escape') onClose();
            }}
            placeholder='Search tabs, chords, scales, or ask AI (e.g. "notes in D harmonic minor")...'
            className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none sm:text-sm"
          />
          <button
            type="button"
            onClick={() => handleAskAgent()}
            className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400"
          >
            <Send className="h-3 w-3" /> Ask AI
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body: Instant Search Results + AI Coach Chat */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Instant App Search Results */}
          <div>
            <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Instant App Finder ({filteredResults.length} matches)</span>
              <span className="font-mono text-[10px] text-slate-500">Click to jump</span>
            </div>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {filteredResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onSelect}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-800/90 bg-slate-900/75 px-3 py-2 text-left transition-all hover:border-amber-500/50 hover:bg-slate-800/90"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {getCategoryIcon(item.category)}
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-slate-100">
                        {item.title}
                      </div>
                      <div className="truncate text-[10px] text-slate-400">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <span className="shrink-0 rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-300">
                    {item.actionLabel}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Minimal AI Guitar Coach Section */}
          <div className="border-t border-slate-800/90 pt-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>FretLab AI Guitar Coach</span>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 font-mono text-[10px] text-slate-400 hover:text-slate-200"
              >
                <KeyRound className="h-3 w-3" />
                <span>{geminiKey ? 'Gemini Key: Connected' : 'Optional: Connect Gemini Key'}</span>
              </button>
            </div>

            {showKeyInput && (
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs">
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => handleSaveKey(e.target.value)}
                  placeholder="Optional: Paste Google Gemini API key (saved locally in browser)..."
                  className="flex-1 bg-transparent font-mono text-xs text-slate-200 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowKeyInput(false)}
                  className="rounded bg-cyan-500/20 px-2.5 py-1 font-semibold text-cyan-300"
                >
                  Done
                </button>
              </div>
            )}

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp}
                  type="button"
                  onClick={() => handleAskAgent(qp)}
                  className="rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-[11px] text-slate-300 transition-colors hover:border-cyan-500/50 hover:text-cyan-200"
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Chat Messages */}
            <div className="space-y-2.5">
              {chatHistory.slice(-4).map((msg, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border p-3 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'ml-8 border-amber-500/30 bg-amber-500/10 text-amber-100'
                      : 'border-slate-800 bg-slate-900/90 text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {msg.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          type="button"
                          onClick={act.run}
                          className="inline-flex items-center gap-1 rounded-lg bg-cyan-500 px-3 py-1.5 text-[11px] font-bold text-slate-950 hover:bg-cyan-400"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isThinking && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 font-mono text-xs text-cyan-300">
                  Thinking...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Sparkles,
  Sliders,
  ArrowUpRight,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { GuitarTone } from '../lib/audio';
import { TuningId } from '../lib/theory';
import { GrooveId } from './BackingTrackBar';

export type BandId = 'all' | 'classical' | 'polyphia' | 'unearth' | 'deftones' | 'horse';

interface BandProfile {
  id: BandId;
  name: string;
  artists: string;
  vibe: string;
  scales: string;
  voicingsAndTuning: string;
  techniqueFocus: string;
  preset: {
    tone: GuitarTone;
    tuningId: TuningId;
    rootPc: number;
    grooveId: GrooveId;
  };
}

const BAND_PROFILES: BandProfile[] = [
  {
    id: 'classical',
    name: 'Classical & Acoustic Foundation',
    artists: 'Giuliani · Villa-Lobos · Barrios · Segovia',
    vibe: 'Finger independence, voice separation, rest/free stroke dynamics, open-string resonance',
    scales: 'Ionian, Aeolian, Harmonic Minor, Melodic Minor, Phrygian Dominant',
    voicingsAndTuning: 'Standard & DADGAD · Close/Spread Triads, Drop-2, Add9 open extensions',
    techniqueFocus: 'P-I-M-A sequential planting, p-a-m-i tremolo, thumb bass + treble melody counterpoint',
    preset: {
      tone: 'classical',
      tuningId: 'standard',
      rootPc: 9, // A
      grooveId: 'acoustic_bossa',
    },
  },
  {
    id: 'polyphia',
    name: 'Polyphia (Modern Hybrid / Math)',
    artists: 'Tim Henson & Scott LePage',
    vibe: 'Glassy neck-pickup hybrid picking, trap-math grooves, harp harmonics, selective picking',
    scales: 'Aeolian, Lydian (#4), Dorian, Harmonic Minor, Minor/Major Pentatonic 3NPS',
    voicingsAndTuning: 'Standard / Drop D · Maj9, m11 (string-skip), 7#9 (III7#9 → vi), Quartal 4ths',
    techniqueFocus: 'Pick + M + R string-skipping arpeggios, 12th/7th/5th natural & artificial harmonics, selective hammer-on cascades',
    preset: {
      tone: 'electric',
      tuningId: 'standard',
      rootPc: 4, // E
      grooveId: 'polyphia_trap',
    },
  },
  {
    id: 'unearth',
    name: 'Unearth (Melodic Metalcore)',
    artists: 'Buz McGrath & Ken Susi',
    vibe: 'Gothenburg melodic death-metal harmonies + neoclassical sweep-tapping + tight hardcore breakdowns',
    scales: 'Harmonic Minor (raised 7th), Phrygian Dominant, Diminished (Whole-Half), Natural Minor (dual 3rds)',
    voicingsAndTuning: 'Drop C / Drop D / 7-String · Power chords, Diminished 7th arpeggio stacks, V7(b9)',
    techniqueFocus: '3- & 5-string Sweep-Picking with tapped apex, 16th-note triplet palm-mute gallops, 5-7-8 pedal-point string skips',
    preset: {
      tone: 'highgain',
      tuningId: 'drop_c',
      rootPc: 2, // D
      grooveId: 'unearth_metalcore',
    },
  },
  {
    id: 'deftones',
    name: 'Deftones (Shoegaze Alt-Metal)',
    artists: 'Stephen Carpenter & Chino Moreno',
    vibe: 'Crushing syncopated low-end grooves colliding with floating, lush shoegaze chord clouds',
    scales: 'Natural Minor (Aeolian), Lydian (#4 float), Phrygian (b2 menace), Minor Pentatonic',
    voicingsAndTuning: 'Drop C / Drop D · Sus2(add9) walls, Maj7#11, m(add9), open-string drones + movable octaves',
    techniqueFocus: 'Extreme dynamic contrast: staccato syncopated palm-muting blooming into wide unmuted extended chords',
    preset: {
      tone: 'highgain',
      tuningId: 'drop_d',
      rootPc: 2, // D
      grooveId: 'deftones_shoegaze',
    },
  },
  {
    id: 'horse',
    name: 'HORSE the band (Nintendocore)',
    artists: 'David Isen & Erik Engstrom',
    vibe: '8-bit NES chiptune square-wave arpeggios doubled on guitar + chaotic mathcore tritone breakdowns',
    scales: 'Harmonic Minor ("Castlevania" boss-fight), Symmetrical Diminished, Chromatic, Bright Major Triads',
    voicingsAndTuning: 'Standard / Drop D · Diminished b9 panic stabs, minor-2nd/tritone clusters, major Picardy triads',
    techniqueFocus: 'Hyper-fast alternate & hybrid arpeggio doubling of synth lines, octave tremolo leads, abrupt rhythmic stops',
    preset: {
      tone: 'chiptune',
      tuningId: 'standard',
      rootPc: 4, // E
      grooveId: 'horse_nintendocore',
    },
  },
];

interface LessonStep {
  id: string;
  order: string;
  phase: string;
  title: string;
  goal: string;
  practiceOrderTip: string;
  bands: BandId[];
  targetTab: 'scales' | 'chords' | 'theory' | 'progressions' | 'techniques' | 'practice';
}

const CURRICULUM: LessonStep[] = [
  // PHASE 1
  {
    id: 'step_1_1',
    order: 'Phase 1 · Step 1',
    phase: 'Phase 1: Fretboard Geometry & Classical Right-Hand Foundation',
    title: 'Master the B-String Warp & Interval Formulas Across All 6 Strings',
    goal: 'Locate any interval (b2, b3, 3, #4, 5, b6, b7, 7) from any root in < 2 seconds.',
    practiceOrderTip:
      'Start here first: after 20 years of playing shapes by muscle memory, naming intervals (instead of just box shapes) unlocks instant transposition in any tuning.',
    bands: ['classical', 'polyphia', 'unearth', 'deftones', 'horse'],
    targetTab: 'theory',
  },
  {
    id: 'step_1_2',
    order: 'Phase 1 · Step 2',
    phase: 'Phase 1: Fretboard Geometry & Classical Right-Hand Foundation',
    title: 'P-I-M-A Sequential Planting & Rest vs. Free Stroke',
    goal: 'Play Giuliani P-I-M-A arpeggios and p-a-m-i tremolo at 92 BPM with even ring-finger (a) volume.',
    practiceOrderTip:
      'Practice on Classical/Acoustic before picking up a flatpick. Training "m" and "a" independence is 80% of hybrid picking.',
    bands: ['classical', 'polyphia'],
    targetTab: 'techniques',
  },
  {
    id: 'step_1_3',
    order: 'Phase 1 · Step 3',
    phase: 'Phase 1: Fretboard Geometry & Classical Right-Hand Foundation',
    title: 'Close & Spread Triads + Drop-2 Voicings on String Sets 1–4',
    goal: 'Connect Major & Minor triads (Root, 1st Inv, 2nd Inv) and Drop-2 7ths up the neck.',
    practiceOrderTip:
      'These 3- and 4-note upper-register shapes are the exact building blocks for Deftones high-register clouds, Unearth sweeps, and Polyphia chord-melody.',
    bands: ['classical', 'polyphia', 'deftones', 'unearth'],
    targetTab: 'chords',
  },

  // PHASE 2
  {
    id: 'step_2_1',
    order: 'Phase 2 · Step 4',
    phase: 'Phase 2: Modal Color & Atmospheric Extensions (Classical → Deftones Bridge)',
    title: 'Parallel Mode Brightness Spectrum (Lydian #4 → Phrygian b2)',
    goal: 'Switch fluently between Lydian, Ionian, Dorian, Aeolian, and Phrygian over the same Root Bass drone.',
    practiceOrderTip:
      'Turn on the "Deftones Shoegaze Boom-Groove" with Root Bass ON in the header and feel how #4 (Lydian) floats while b2 (Phrygian)darkens.',
    bands: ['classical', 'deftones', 'polyphia'],
    targetTab: 'scales',
  },
  {
    id: 'step_2_2',
    order: 'Phase 2 · Step 5',
    phase: 'Phase 2: Modal Color & Atmospheric Extensions (Classical → Deftones Bridge)',
    title: 'Open-String Extensions & Shoegaze Sus2 / Add9 / Maj9 Walls',
    goal: 'Alternate tight low-string palm-mute syncopation with wide ringing Sus2(add9) and Maj9 chords.',
    practiceOrderTip:
      'Bridges acoustic DADGAD/Classical add9 resonance directly into Stephen Carpenter’s high-gain shoegaze wall of sound.',
    bands: ['classical', 'deftones', 'polyphia'],
    targetTab: 'chords',
  },
  {
    id: 'step_2_3',
    order: 'Phase 2 · Step 6',
    phase: 'Phase 2: Modal Color & Atmospheric Extensions (Classical → Deftones Bridge)',
    title: 'Voice-Leading Common-Tone Drones (Deftones & Andalusian Progressions)',
    goal: 'Loop the Deftones Shoegaze-Metal progression & Andalusian Cadence while keeping upper drone notes ringing.',
    practiceOrderTip:
      'Practice holding top-string common tones while the bass root moves underneath.',
    bands: ['classical', 'deftones'],
    targetTab: 'progressions',
  },

  // PHASE 3
  {
    id: 'step_3_1',
    order: 'Phase 3 · Step 7',
    phase: 'Phase 3: Harmonic Minor, Pedal Points & Sweep-Tapping (Classical → Unearth Bridge)',
    title: 'Harmonic Minor & Phrygian Dominant Neck Mapping',
    goal: 'Master the b6-to-7 augmented-2nd interval and V7(b9) → i resolution across 3 positions.',
    practiceOrderTip:
      'The exact same scale powers Bach/Giuliani minor cadences, Unearth’s "The Oncoming Storm" leads, and HORSE the band’s Castlevania themes.',
    bands: ['classical', 'unearth', 'horse', 'polyphia'],
    targetTab: 'scales',
  },
  {
    id: 'step_3_2',
    order: 'Phase 3 · Step 8',
    phase: 'Phase 3: Harmonic Minor, Pedal Points & Sweep-Tapping (Classical → Unearth Bridge)',
    title: 'Unearth 5-7-8 Pedal-Point Riffing & 3-String Sweep-Tap Apex',
    goal: 'Execute palm-muted pedal-point string skips into a clean 3-string sweep + tapped 12th-fret apex at 128 BPM.',
    practiceOrderTip:
      'Start at 80 BPM with the "Unearth Double-Kick Gallop" drum loop. Focus on muting unused strings with your picking-hand palm.',
    bands: ['unearth', 'horse'],
    targetTab: 'techniques',
  },
  {
    id: 'step_3_3',
    order: 'Phase 3 · Step 9',
    phase: 'Phase 3: Harmonic Minor, Pedal Points & Sweep-Tapping (Classical → Unearth Bridge)',
    title: 'Symmetrical Diminished 7th Arpeggios & Harmonized 3rds',
    goal: 'Move Diminished 7th shapes in minor-3rd (+3 fret) increments and harmonize Natural/Harmonic Minor in diatonic 3rds.',
    practiceOrderTip:
      'Unlock Buz McGrath & Ken Susi’s dual-guitar harmonies and high-tension breakdown transitions.',
    bands: ['unearth', 'horse', 'classical'],
    targetTab: 'chords',
  },

  // PHASE 4
  {
    id: 'step_4_1',
    order: 'Phase 4 · Step 10',
    phase: 'Phase 4: Hybrid Picking, 8-Bit Arpeggio Leaps & Math-Rock Mastery (HORSE → Polyphia Bridge)',
    title: 'PIMA-to-Hybrid Translation: Pick + M + R String-Skipping Maj9/m11',
    goal: 'Play the Polyphia Hybrid-Picked Maj9 String-Skip pattern cleanly at 112+ BPM.',
    practiceOrderTip:
      'Hold the pick with thumb+index and let Middle (M) and Ring (R) pluck strings 3, 2, and 1—zero wide flatpick jumps needed.',
    bands: ['polyphia', 'horse', 'classical'],
    targetTab: 'techniques',
  },
  {
    id: 'step_4_2',
    order: 'Phase 4 · Step 11',
    phase: 'Phase 4: Hybrid Picking, 8-Bit Arpeggio Leaps & Math-Rock Mastery (HORSE → Polyphia Bridge)',
    title: 'Nintendocore Synth-Doubled Arpeggios & Angular Mathcore Stabs',
    goal: 'Lock 16th-note 1-3-5-8 triad arpeggios and tritone/b9 panic stabs to the HORSE Nintendocore drum + 8-bit bass loop at 138 BPM.',
    practiceOrderTip:
      'Use hybrid picking + tapping to play keyboard-wide arpeggio leaps cleanly, then slam into the dim(b9) panic chord.',
    bands: ['horse', 'unearth', 'polyphia'],
    targetTab: 'techniques',
  },
  {
    id: 'step_4_3',
    order: 'Phase 4 · Step 12',
    phase: 'Phase 4: Hybrid Picking, 8-Bit Arpeggio Leaps & Math-Rock Mastery (HORSE → Polyphia Bridge)',
    title: 'Selective Picking, Secondary Dominants (III7#9 → vi) & Harp Harmonics',
    goal: 'Combine Pick + hammer-on cascades, natural/artificial harmonics, and the IVmaj9 – III7#9 – vi11 progression.',
    practiceOrderTip:
      'The summit of the curriculum: merges classical right-hand touch, jazz secondary dominants, and modern electric articulation.',
    bands: ['polyphia', 'classical'],
    targetTab: 'progressions',
  },
];

interface LessonPlanViewProps {
  onApplyPreset: (preset: {
    tone: GuitarTone;
    tuningId: TuningId;
    rootPc: number;
    grooveId: GrooveId;
  }) => void;
  onNavigateTab: (
    tab: 'scales' | 'chords' | 'theory' | 'progressions' | 'techniques' | 'practice'
  ) => void;
}

export const LessonPlanView: React.FC<LessonPlanViewProps> = ({
  onApplyPreset,
  onNavigateTab,
}) => {
  const [selectedBand, setSelectedBand] = useState<BandId>('all');
  const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fretlab_curriculum_done');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [customNotes, setCustomNotes] = useState<string>(() => {
    return (
      localStorage.getItem('fretlab_band_notes') ||
      'Songs to learn together:\n- Unearth: "The Oncoming Storm" / "Zombie Autopilot" (Drop C, D Harmonic Minor sweeps)\n- Deftones: "Be Quiet and Drive" / "Change" (Drop C/D, maj7 & sus2/add9 walls)\n- HORSE the band: "Cutsman" / "Bunnies" (E Harmonic Minor 8-bit arpeggio doubling)\n- Polyphia: "G.O.A.T." / "Playing God" (Hybrid picking + harp harmonics)'
    );
  });

  useEffect(() => {
    localStorage.setItem('fretlab_curriculum_done', JSON.stringify(completedSteps));
  }, [completedSteps]);

  useEffect(() => {
    localStorage.setItem('fretlab_band_notes', customNotes);
  }, [customNotes]);

  const toggleStep = (id: string) => {
    setCompletedSteps((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const visibleSteps =
    selectedBand === 'all'
      ? CURRICULUM
      : CURRICULUM.filter((s) => s.bands.includes(selectedBand));

  const activeBandProfile = BAND_PROFILES.find((b) => b.id === selectedBand);
  const progressPct = Math.round((completedSteps.length / CURRICULUM.length) * 100);

  return (
    <div className="space-y-6">
      {/* Top Band / Artist Style Lens Selector */}
      <div className="rounded-xl border border-slate-800 bg-[#13151c] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
              <Sparkles className="h-4 w-4" />
              <span>Band &amp; Style Customizer (Filter Lesson Plan &amp; Load Jam Rig)</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              Select a band influence to filter the curriculum and one-click load their tuning, tone, key, and drum + root-bass groove.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-slate-300">
              Curriculum Mastery: <strong className="text-cyan-300">{completedSteps.length}</strong> /{' '}
              {CURRICULUM.length} ({progressPct}%)
            </span>
            <button
              type="button"
              onClick={() => setCompletedSteps([])}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>
        </div>

        {/* Band Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedBand('all')}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
              selectedBand === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
            }`}
          >
            All Styles (Full 12-Step Roadmap)
          </button>
          {BAND_PROFILES.map((bp) => (
            <button
              key={bp.id}
              type="button"
              onClick={() => setSelectedBand(bp.id)}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                selectedBand === bp.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
              }`}
            >
              {bp.name}
            </button>
          ))}
        </div>

        {/* Band DNA Cards (Show selected or all 4 featured bands) */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(activeBandProfile ? [activeBandProfile] : BAND_PROFILES).map((bp) => (
            <div
              key={bp.id}
              className="flex flex-col justify-between rounded-xl border border-slate-800/90 bg-slate-900/75 p-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-100">{bp.name}</span>
                  <span className="font-mono text-[10px] text-amber-300">{bp.artists}</span>
                </div>
                <p className="text-xs text-slate-400">{bp.vibe}</p>
                <div className="space-y-1 pt-1 text-[11px] text-slate-300">
                  <div>
                    <strong className="text-cyan-400">Scales: </strong>
                    {bp.scales}
                  </div>
                  <div>
                    <strong className="text-amber-400">Voicings/Tuning: </strong>
                    {bp.voicingsAndTuning}
                  </div>
                  <div>
                    <strong className="text-emerald-400">Techniques: </strong>
                    {bp.techniqueFocus}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onApplyPreset(bp.preset)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/15 py-2 text-xs font-semibold text-cyan-200 transition-all hover:bg-cyan-500 hover:text-slate-950"
              >
                <Sliders className="h-3.5 w-3.5" />
                Load {bp.name.split(' ')[0]} Tone, Tuning &amp; Drum/Bass Groove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Ordered Progressive Lesson Plan */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-8">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
            <BookOpen className="h-4 w-4 text-amber-400" />
            <span>
              Ordered Progression Roadmap ({visibleSteps.length} Steps Shown — Practice Top to Bottom)
            </span>
          </div>

          {visibleSteps.map((step) => {
            const isDone = completedSteps.includes(step.id);
            return (
              <div
                key={step.id}
                className={`rounded-xl border p-4 transition-all ${
                  isDone
                    ? 'border-emerald-500/40 bg-emerald-500/10'
                    : 'border-slate-800 bg-[#13151c] hover:border-slate-700'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleStep(step.id)}
                      className="mt-0.5 focus:outline-none"
                      title="Mark Step Complete"
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-500 hover:text-amber-400" />
                      )}
                    </button>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                          {step.order}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {step.phase}
                        </span>
                      </div>
                      <h4
                        className={`text-sm font-bold ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {step.title}
                      </h4>
                      <div className="text-xs font-medium text-cyan-300">
                        Mastery Target: {step.goal}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {step.practiceOrderTip}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {step.bands.map((bId) => (
                          <span
                            key={bId}
                            className="rounded border border-slate-700 bg-slate-900 px-2 py-0.5 font-mono text-[10px] uppercase text-slate-300"
                          >
                            {bId}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigateTab(step.targetTab)}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-slate-700"
                  >
                    <span>Open Lab</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Friend & Band Jam Notes / Customizer */}
        <div className="space-y-4 lg:col-span-4">
          <div className="rounded-xl border border-slate-800 bg-[#13151c] p-4 space-y-3">
            <h3 className="text-sm font-bold text-amber-300">
              How to Order Each Practice Session
            </h3>
            <ol className="list-decimal space-y-2 pl-4 text-xs text-slate-300 leading-relaxed">
              <li>
                <strong>First 15 min (Acoustic/Classical Clean):</strong> Run Phase 1 intervals, P-I-M-A planting, and close/spread triads with zero distortion so you can’t hide sloppy fretting.
              </li>
              <li>
                <strong>Next 15 min (Harmonic &amp; Voicing Vocabulary):</strong> Practice Phase 2/3 voicings (Deftones Sus2/Add9, Polyphia Maj9/m11, Unearth Dim7) over the Root-Note Bass drone.
              </li>
              <li>
                <strong>Final 20 min (Electric Pick / Hybrid / Band Riffing):</strong> Turn on the Band Drum + Bass Loop (Unearth Double-Kick, Deftones Boom-Groove, HORSE Nintendocore, or Polyphia Trap) and push your hybrid picking, sweep-taps, and 8-bit arpeggio doubling.
              </li>
            </ol>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#13151c] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-cyan-300">
                Shared Band &amp; Song Target Notes
              </h3>
              <span className="font-mono text-[10px] text-slate-500">Auto-saved</span>
            </div>
            <p className="text-xs text-slate-400">
              Jot down songs, riff timestamps, or BPM benchmarks you and your friend are working on:
            </p>
            <textarea
              rows={9}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

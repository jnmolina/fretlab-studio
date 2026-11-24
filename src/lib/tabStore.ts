import { GuitarTone } from './audio';
import { GrooveId, HarmonyMode } from '../components/BackingTrackBar';

export type LessonStage =
  | 'warmups'
  | 'chords_arps'
  | 'fingerstyle'
  | 'pick_hybrid'
  | 'custom';

export interface TabColumn {
  // 6 strings: index 0 = 6th string (Low E), index 5 = 1st string (High e)
  frets: (number | null)[];
  rh?: string; // 'p','i','m','a','Pick','M','R','PM','Sweep','Tap','Harm','H/O','↓','↑'
  isHarmonic?: boolean;
}

export interface TabLesson {
  id: string;
  title: string;
  stage: LessonStage;
  bandTag: string;
  bpm: number;
  tone: GuitarTone;
  grooveId: GrooveId;
  rootPc: number;
  harmonyMode: HarmonyMode;
  description: string;
  isCustom?: boolean;
  columns: TabColumn[];
}

// Helper to build a single-note step on stringNum (6 = low E .. 1 = high e)
function singleStep(
  stringNum: number,
  fret: number,
  rh?: string,
  isHarmonic?: boolean
): TabColumn {
  const frets: (number | null)[] = [null, null, null, null, null, null];
  frets[6 - stringNum] = fret;
  return { frets, rh, isHarmonic };
}

// Helper to build a multi-string chord step (array of [stringNum, fret])
function chordStep(
  pairs: [number, number][],
  rh?: string,
  isHarmonic?: boolean
): TabColumn {
  const frets: (number | null)[] = [null, null, null, null, null, null];
  pairs.forEach(([s, f]) => {
    frets[6 - s] = f;
  });
  return { frets, rh, isHarmonic };
}

export const BUILTIN_TAB_LESSONS: TabLesson[] = [
  // 1. WARM-UPS
  {
    id: 'warmup_spider',
    title: '1-2-3-4 Chromatic Spider & String Crossing',
    stage: 'warmups',
    bandTag: 'Foundation',
    bpm: 88,
    tone: 'classical',
    grooveId: 'basic_rock',
    rootPc: 4, // E
    harmonyMode: 'off',
    description:
      'Keep all 4 fretting fingers hovering close to the fretboard. Use strict alternate picking (↓ ↑) or i-m fingerstyle alternation.',
    columns: [
      singleStep(6, 1, '↓'),
      singleStep(6, 2, '↑'),
      singleStep(6, 3, '↓'),
      singleStep(6, 4, '↑'),
      singleStep(5, 1, '↓'),
      singleStep(5, 2, '↑'),
      singleStep(5, 3, '↓'),
      singleStep(5, 4, '↑'),
      singleStep(4, 1, '↓'),
      singleStep(4, 2, '↑'),
      singleStep(4, 3, '↓'),
      singleStep(4, 4, '↑'),
      singleStep(3, 1, '↓'),
      singleStep(3, 2, '↑'),
      singleStep(3, 3, '↓'),
      singleStep(3, 4, '↑'),
    ],
  },
  {
    id: 'warmup_slurs',
    title: 'Left-Hand Stretch & Legato Slurs (Hammer / Pull)',
    stage: 'warmups',
    bandTag: 'Classical / Polyphia',
    bpm: 92,
    tone: 'acoustic',
    grooveId: 'acoustic_bossa',
    rootPc: 9, // A
    harmonyMode: 'minor',
    description:
      'Pluck only the first note of each pair and let your left-hand hammer-ons (H/O) match the exact volume of plucked notes.',
    columns: [
      singleStep(4, 5, 'p'),
      singleStep(4, 7, 'H/O'),
      singleStep(3, 4, 'i'),
      singleStep(3, 7, 'H/O'),
      singleStep(2, 5, 'm'),
      singleStep(2, 8, 'H/O'),
      singleStep(1, 5, 'a'),
      singleStep(1, 8, 'H/O'),
      singleStep(1, 7, 'a'),
      singleStep(1, 5, 'H/O'),
      singleStep(2, 8, 'm'),
      singleStep(2, 5, 'H/O'),
      singleStep(3, 7, 'i'),
      singleStep(3, 4, 'H/O'),
      singleStep(4, 7, 'p'),
      singleStep(4, 5, 'H/O'),
    ],
  },

  // 2. CHORDS & ARPEGGIOS
  {
    id: 'chords_triads_neck',
    title: 'Minor & Major Triad Inversions Up the Neck',
    stage: 'chords_arps',
    bandTag: 'Theory Core',
    bpm: 96,
    tone: 'classical',
    grooveId: 'basic_rock',
    rootPc: 9, // Am
    harmonyMode: 'minor',
    description:
      'Connect Am triad inversions on strings 1-2-3 (Root pos → 1st Inv → 2nd Inv), then arpeggiate each shape cleanly.',
    columns: [
      chordStep([[3, 2], [2, 1], [1, 0]], 'p'),
      singleStep(3, 2, 'i'),
      singleStep(2, 1, 'm'),
      singleStep(1, 0, 'a'),
      chordStep([[3, 5], [2, 5], [1, 5]], 'p'),
      singleStep(3, 5, 'i'),
      singleStep(2, 5, 'm'),
      singleStep(1, 5, 'a'),
      chordStep([[3, 9], [2, 10], [1, 8]], 'p'),
      singleStep(3, 9, 'i'),
      singleStep(2, 10, 'm'),
      singleStep(1, 8, 'a'),
      chordStep([[3, 14], [2, 13], [1, 12]], 'p'),
      singleStep(3, 14, 'i'),
      singleStep(2, 13, 'm'),
      singleStep(1, 12, 'a'),
    ],
  },
  {
    id: 'chords_maj9_shoegaze',
    title: 'Lush Add9 & Maj9 Arpeggio Clouds (Deftones / Polyphia)',
    stage: 'chords_arps',
    bandTag: 'Deftones / Polyphia',
    bpm: 92,
    tone: 'electric',
    grooveId: 'deftones_shoegaze',
    rootPc: 0, // C / Am
    harmonyMode: 'maj7',
    description:
      'Wide-interval Cmaj9 and Am(add9) voicings. Let the open high strings ring over the fretted bass notes.',
    columns: [
      singleStep(5, 3, 'Pick'),
      singleStep(4, 2, 'Pick'),
      singleStep(3, 4, 'M'),
      singleStep(2, 3, 'R'),
      singleStep(1, 0, 'R'),
      singleStep(2, 3, 'M'),
      singleStep(3, 4, 'Pick'),
      singleStep(4, 2, 'Pick'),
      singleStep(5, 0, 'Pick'),
      singleStep(4, 7, 'Pick'),
      singleStep(3, 5, 'M'),
      singleStep(2, 0, 'R'),
      singleStep(1, 0, 'R'),
      singleStep(2, 0, 'M'),
      singleStep(3, 5, 'Pick'),
      singleStep(4, 7, 'Pick'),
    ],
  },
  {
    id: 'chords_dim_harm_minor',
    title: 'Harmonic Minor & Diminished 7th Arpeggio Climb',
    stage: 'chords_arps',
    bandTag: 'Classical / Unearth / HORSE',
    bpm: 112,
    tone: 'highgain',
    grooveId: 'unearth_metalcore',
    rootPc: 4, // E Harmonic Minor
    harmonyMode: 'minor',
    description:
      'Symmetrical D#dim7 arpeggio climbing in minor 3rds (+3 frets) resolving to Em. Core vocabulary for Bach, Unearth, and HORSE the band.',
    columns: [
      singleStep(4, 1, '↓'),
      singleStep(3, 2, '↓'),
      singleStep(2, 1, '↓'),
      singleStep(1, 2, '↑'),
      singleStep(1, 5, 'H/O'),
      singleStep(2, 4, '↑'),
      singleStep(3, 5, '↑'),
      singleStep(4, 4, '↓'),
      singleStep(4, 7, '↓'),
      singleStep(3, 8, '↓'),
      singleStep(2, 7, '↓'),
      singleStep(1, 8, '↑'),
      singleStep(1, 11, 'Tap'),
      singleStep(1, 12, '↓'),
      chordStep([[6, 0], [5, 2], [4, 2]], '↓'),
      chordStep([[6, 0], [5, 2], [4, 2]], '↓'),
    ],
  },

  // 3. FINGERSTYLE TECHNIQUES
  {
    id: 'fingerstyle_pima_giuliani',
    title: 'Giuliani P-I-M-A Arpeggio & Thumb-Bass Separation',
    stage: 'fingerstyle',
    bandTag: 'Classical & Acoustic',
    bpm: 92,
    tone: 'classical',
    grooveId: 'acoustic_bossa',
    rootPc: 9, // A
    harmonyMode: 'minor',
    description:
      'Sequential planting study: keep thumb (p) driving the moving bassline on strings 5-4-6 while i-m-a articulate the upper chords.',
    columns: [
      singleStep(5, 0, 'p'),
      singleStep(3, 2, 'i'),
      singleStep(2, 1, 'm'),
      singleStep(1, 0, 'a'),
      singleStep(4, 2, 'p'),
      singleStep(3, 2, 'i'),
      singleStep(2, 1, 'm'),
      singleStep(1, 3, 'a'),
      singleStep(6, 1, 'p'),
      singleStep(3, 2, 'i'),
      singleStep(2, 1, 'm'),
      singleStep(1, 0, 'a'),
      singleStep(6, 0, 'p'),
      singleStep(3, 1, 'i'),
      singleStep(2, 0, 'm'),
      singleStep(1, 0, 'a'),
    ],
  },
  {
    id: 'fingerstyle_tremolo_harmonics',
    title: 'Classical Tremolo (p-a-m-i) into Harp Harmonics',
    stage: 'fingerstyle',
    bandTag: 'Classical → Polyphia',
    bpm: 84,
    tone: 'classical',
    grooveId: 'acoustic_bossa',
    rootPc: 4, // E
    harmonyMode: 'minor',
    description:
      'First 8 steps train even p-a-m-i ring-finger lead; final 8 steps cascade across 12th and 7th fret natural harmonics.',
    columns: [
      singleStep(6, 0, 'p'),
      singleStep(1, 0, 'a'),
      singleStep(1, 0, 'm'),
      singleStep(1, 0, 'i'),
      singleStep(4, 2, 'p'),
      singleStep(1, 3, 'a'),
      singleStep(1, 3, 'm'),
      singleStep(1, 3, 'i'),
      singleStep(6, 12, 'Harm', true),
      singleStep(4, 12, 'Harm', true),
      singleStep(3, 12, 'Harm', true),
      singleStep(2, 12, 'Harm', true),
      singleStep(1, 7, 'Harm', true),
      singleStep(2, 7, 'Harm', true),
      singleStep(3, 7, 'Harm', true),
      singleStep(1, 12, 'Harm', true),
    ],
  },

  // 4. PICK & HYBRID TECHNIQUES (Polyphia, Unearth, Deftones, HORSE)
  {
    id: 'pick_polyphia_hybrid',
    title: 'Polyphia Hybrid-Picked String-Skip & Legato Cascade',
    stage: 'pick_hybrid',
    bandTag: 'Polyphia',
    bpm: 116,
    tone: 'electric',
    grooveId: 'polyphia_trap',
    rootPc: 4, // Em11 / Cmaj9
    harmonyMode: 'minor',
    description:
      'Use Pick on strings 6/5/4 while Middle (M) and Ring (R) snap wide string-skips on strings 3/2/1, finishing with a 12th-fret harmonic chime.',
    columns: [
      singleStep(5, 3, 'Pick'),
      singleStep(3, 4, 'M'),
      singleStep(2, 3, 'R'),
      singleStep(4, 2, 'Pick'),
      singleStep(1, 3, 'R'),
      singleStep(2, 5, 'M'),
      singleStep(3, 4, 'Pick'),
      singleStep(1, 7, 'R'),
      singleStep(6, 0, 'Pick'),
      singleStep(5, 2, 'H/O'),
      singleStep(5, 5, 'H/O'),
      singleStep(4, 2, 'Pick'),
      singleStep(4, 5, 'H/O'),
      singleStep(3, 4, 'M'),
      singleStep(2, 12, 'Harm', true),
      singleStep(1, 12, 'Harm', true),
    ],
  },
  {
    id: 'pick_unearth_sweeptap',
    title: 'Unearth 5-7-8 Pedal-Point Gallop & Sweep-Tap Apex',
    stage: 'pick_hybrid',
    bandTag: 'Unearth',
    bpm: 128,
    tone: 'highgain',
    grooveId: 'unearth_metalcore',
    rootPc: 2, // D Harmonic Minor
    harmonyMode: 'power',
    description:
      'Buz McGrath & Ken Susi signature: tight palm-muted low root alternating with Harmonic Minor melody notes into a 3-string sweep + tapped 12th-fret apex.',
    columns: [
      singleStep(6, 0, 'PM'),
      singleStep(6, 0, 'PM'),
      singleStep(5, 5, '↓'),
      singleStep(6, 0, 'PM'),
      singleStep(5, 7, '↓'),
      singleStep(6, 0, 'PM'),
      singleStep(5, 8, '↓'),
      singleStep(4, 7, '↑'),
      singleStep(3, 7, 'Sweep'),
      singleStep(2, 6, 'Sweep'),
      singleStep(1, 5, 'Sweep'),
      singleStep(1, 10, 'Tap'),
      singleStep(1, 5, 'H/O'),
      singleStep(2, 6, '↑'),
      singleStep(3, 7, '↑'),
      singleStep(4, 7, '↓'),
    ],
  },
  {
    id: 'pick_deftones_contrast',
    title: 'Deftones Syncopated PM Groove → Shoegaze Wall',
    stage: 'pick_hybrid',
    bandTag: 'Deftones',
    bpm: 88,
    tone: 'highgain',
    grooveId: 'deftones_shoegaze',
    rootPc: 2, // D
    harmonyMode: 'maj7',
    description:
      'Stephen Carpenter dynamic contrast: heavy staccato low-string chugs opening into full unmuted Sus2(add9) and Maj7 chords.',
    columns: [
      singleStep(6, 0, 'PM'),
      singleStep(6, 0, 'PM'),
      chordStep([[6, 0], [5, 0], [4, 2]], '↓'),
      singleStep(6, 0, 'PM'),
      chordStep([[4, 4], [3, 2], [2, 2], [1, 0]], '↓'),
      singleStep(3, 2, 'M'),
      singleStep(2, 2, 'R'),
      singleStep(1, 0, 'R'),
      singleStep(6, 5, 'PM'),
      singleStep(6, 5, 'PM'),
      chordStep([[4, 9], [3, 7], [2, 7], [1, 0]], '↓'),
      singleStep(3, 7, 'M'),
      singleStep(2, 7, 'R'),
      singleStep(1, 0, 'R'),
      chordStep([[4, 7], [3, 6], [2, 5], [1, 0]], '↓'),
      singleStep(1, 0, 'R'),
    ],
  },
  {
    id: 'pick_horse_nintendocore',
    title: 'HORSE the band 8-Bit Synth Arpeggio & Mathcore Panic Stab',
    stage: 'pick_hybrid',
    bandTag: 'HORSE the band',
    bpm: 138,
    tone: 'chiptune',
    grooveId: 'horse_nintendocore',
    rootPc: 4, // E
    harmonyMode: 'minor',
    description:
      'David Isen & Erik Engstrom Nintendocore drill: rapid hybrid-picked 8-bit triad arpeggios colliding with dissonant tritone/b9 panic stabs.',
    columns: [
      singleStep(4, 2, 'Pick'),
      singleStep(3, 0, 'M'),
      singleStep(2, 0, 'R'),
      singleStep(1, 0, 'R'),
      singleStep(1, 7, 'Tap'),
      singleStep(2, 0, 'M'),
      singleStep(3, 0, 'Pick'),
      singleStep(4, 2, 'Pick'),
      singleStep(4, 3, 'Pick'),
      singleStep(3, 2, 'M'),
      singleStep(2, 1, 'R'),
      singleStep(1, 8, 'Tap'),
      chordStep([[4, 1], [3, 2], [2, 1]], '↓'),
      chordStep([[4, 1], [3, 2], [2, 1]], '↓'),
      chordStep([[6, 0], [5, 2], [4, 2]], '↓'),
      singleStep(1, 12, 'Harm', true),
    ],
  },
];

const STORAGE_KEY = 'fretlab_custom_tabs_v2';

export function loadCustomLessons(): TabLesson[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomLessons(lessons: TabLesson[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
}

export const CHROMATIC_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const CHROMATIC_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

export const INTERVAL_LABELS = ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'] as const;

export const FLAT_KEYS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm']);

export type TuningId = 'standard' | 'drop_d' | 'drop_c' | 'dadgad';

export interface Tuning {
  id: TuningId;
  name: string;
  notes: number[]; // MIDI from string 6 (low) to string 1 (high)
  labels: string[];
}

export const TUNINGS: Record<TuningId, Tuning> = {
  standard: {
    id: 'standard',
    name: 'Standard (E A D G B E)',
    notes: [40, 45, 50, 55, 59, 64],
    labels: ['E', 'A', 'D', 'G', 'B', 'E'],
  },
  drop_d: {
    id: 'drop_d',
    name: 'Drop D (D A D G B E)',
    notes: [38, 45, 50, 55, 59, 64],
    labels: ['D', 'A', 'D', 'G', 'B', 'E'],
  },
  drop_c: {
    id: 'drop_c',
    name: 'Drop C (C G C F A D — Deftones/Unearth)',
    notes: [36, 43, 48, 53, 57, 62],
    labels: ['C', 'G', 'C', 'F', 'A', 'D'],
  },
  dadgad: {
    id: 'dadgad',
    name: 'DADGAD (Acoustic Modal)',
    notes: [38, 45, 50, 55, 57, 62],
    labels: ['D', 'A', 'D', 'G', 'A', 'D'],
  },
};

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function getNoteName(midiOrPc: number, preferFlat = false): string {
  const pc = ((midiOrPc % 12) + 12) % 12;
  return preferFlat ? CHROMATIC_FLAT[pc] : CHROMATIC_SHARP[pc];
}

export function getIntervalName(semitones: number, useSharpFour = false): string {
  const pc = ((semitones % 12) + 12) % 12;
  if (useSharpFour && pc === 6) return '#4';
  return INTERVAL_LABELS[pc];
}

export type ScaleCategory =
  | 'Diatonic & Modes'
  | 'Harmonic & Melodic Minor'
  | 'Pentatonic & Blues'
  | 'Symmetrical & Exotic';

export interface ScaleDef {
  id: string;
  name: string;
  category: ScaleCategory;
  intervals: number[];
  formula: string;
  characteristicIntervals: number[]; // semitones from root that define its color
  useSharpFour?: boolean;
  brightness?: number; // 1 (darkest) to 7 (brightest) for modes
  classicalUse: string;
  modernUse: string;
  diatonicQualities?: string[]; // 7th chord qualities on each degree
}

export const SCALES: ScaleDef[] = [
  {
    id: 'major',
    name: 'Major (Ionian)',
    category: 'Diatonic & Modes',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    formula: '1 2 3 4 5 6 7',
    characteristicIntervals: [4, 11],
    brightness: 6,
    classicalUse: 'Foundation of tonal harmony, Giuliani/Sor studies, major-key counterpoint.',
    modernUse: 'Clean math-rock & Polyphia-style maj9/add9 cascades and tapped diatonic arpeggios.',
    diatonicQualities: ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5'],
  },
  {
    id: 'dorian',
    name: 'Dorian',
    category: 'Diatonic & Modes',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    formula: '1 2 b3 4 5 6 b7',
    characteristicIntervals: [9], // natural 6
    brightness: 4,
    classicalUse: 'Renaissance & Celtic acoustic arrangements; modal minor without the bleakness of b6.',
    modernUse: 'Neo-soul, fusion, and hybrid-picked m11 vamps (i7 - IV7 groove).',
    diatonicQualities: ['m7', 'm7', 'maj7', '7', 'm7', 'm7b5', 'maj7'],
  },
  {
    id: 'phrygian',
    name: 'Phrygian',
    category: 'Diatonic & Modes',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    formula: '1 b2 b3 4 5 b6 b7',
    characteristicIntervals: [1], // b2
    brightness: 2,
    classicalUse: 'Core of Spanish/Flamenco guitar (Andalusian cadence, rasgueado, picado).',
    modernUse: 'Aggressive prog-metal & dark Polyphia riffs using b2-to-1 half-step tension.',
    diatonicQualities: ['m7', 'maj7', '7', 'm7', 'm7b5', 'maj7', 'm7'],
  },
  {
    id: 'lydian',
    name: 'Lydian',
    category: 'Diatonic & Modes',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    formula: '1 2 3 #4 5 6 7',
    characteristicIntervals: [6], // #4
    useSharpFour: true,
    brightness: 7,
    classicalUse: 'Impressionist classical guitar (Villa-Lobos, Brouwer) for dreamy floating harmony.',
    modernUse: 'Signature Polyphia / Ichika Nito / Joe Satriani bright, weightless maj7#11 arpeggios.',
    diatonicQualities: ['maj7', '7', 'm7', 'm7b5', 'maj7', 'm7', 'm7'],
  },
  {
    id: 'mixolydian',
    name: 'Mixolydian',
    category: 'Diatonic & Modes',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    formula: '1 2 3 4 5 6 b7',
    characteristicIntervals: [10], // b7
    brightness: 5,
    classicalUse: 'Folk/baroque dominant pedal passages and open-string acoustic drones.',
    modernUse: 'Hybrid-picked country/rock/fusion dominant licks and major-blues phrasing.',
    diatonicQualities: ['7', 'm7', 'm7b5', 'maj7', 'm7', 'm7', 'maj7'],
  },
  {
    id: 'aeolian',
    name: 'Natural Minor (Aeolian)',
    category: 'Diatonic & Modes',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    formula: '1 2 b3 4 5 b6 b7',
    characteristicIntervals: [8, 10], // b6, b7
    brightness: 3,
    classicalUse: 'Minor-key classical repertoire (Tarrega, Barrios) before raising the 7th for V7.',
    modernUse: 'Melodic minor-key progressions (i - bVI - bVII) and wide-interval arpeggio runs.',
    diatonicQualities: ['m7', 'm7b5', 'maj7', 'm7', 'm7', 'maj7', '7'],
  },
  {
    id: 'locrian',
    name: 'Locrian',
    category: 'Diatonic & Modes',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    formula: '1 b2 b3 4 b5 b6 b7',
    characteristicIntervals: [1, 6],
    brightness: 1,
    classicalUse: 'Half-diminished (iiø7) passing sonorities in minor-key cadences.',
    modernUse: 'Unstable dissonant tension over m7b5 chords in prog & modern jazz.',
    diatonicQualities: ['m7b5', 'maj7', 'm7', 'm7', 'maj7', '7', 'm7'],
  },
  {
    id: 'harmonic_minor',
    name: 'Harmonic Minor',
    category: 'Harmonic & Melodic Minor',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    formula: '1 2 b3 4 5 b6 7',
    characteristicIntervals: [8, 11], // aug 2nd between b6 and 7
    classicalUse: 'Essential classical minor: creates the V7 -> i leading tone (Bach, Paganini, Giuliani).',
    modernUse: 'Neo-classical sweep/economy runs & dramatic Tim Henson classical-trap crossovers.',
    diatonicQualities: ['m(maj7)', 'm7b5', 'maj7#5', 'm7', '7', 'maj7', 'dim7'],
  },
  {
    id: 'phrygian_dominant',
    name: 'Phrygian Dominant',
    category: 'Harmonic & Melodic Minor',
    intervals: [0, 1, 4, 5, 7, 8, 10],
    formula: '1 b2 3 4 5 b6 b7',
    characteristicIntervals: [1, 4], // b2 + major 3rd
    classicalUse: '5th mode of Harmonic Minor — quintessential Flamenco & Spanish classical cadence (V7 -> i).',
    modernUse: 'Exotic hybrid-picked runs over dominant 7(b9, b13) chords.',
    diatonicQualities: ['7', 'maj7', 'dim7', 'm(maj7)', 'm7b5', 'maj7#5', 'm7'],
  },
  {
    id: 'melodic_minor',
    name: 'Melodic Minor (Jazz)',
    category: 'Harmonic & Melodic Minor',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    formula: '1 2 b3 4 5 6 7',
    characteristicIntervals: [3, 9, 11],
    classicalUse: 'Ascending minor scale smoothing the augmented 2nd between b6 and 7.',
    modernUse: 'Modern jazz/fusion tonic minor (mMaj7) and source of Lydian Dominant & Altered scales.',
    diatonicQualities: ['m(maj7)', 'm7', 'maj7#5', '7', '7', 'm7b5', 'm7b5'],
  },
  {
    id: 'lydian_dominant',
    name: 'Lydian Dominant',
    category: 'Harmonic & Melodic Minor',
    intervals: [0, 2, 4, 6, 7, 9, 10],
    formula: '1 2 3 #4 5 6 b7',
    characteristicIntervals: [6, 10],
    useSharpFour: true,
    classicalUse: '4th mode of Melodic Minor; acoustic overtone scale used in 20th-century classical.',
    modernUse: 'Non-resolving dominant 7#11 chords, tritone substitutions, and fusion solos.',
  },
  {
    id: 'altered',
    name: 'Altered (Super Locrian)',
    category: 'Harmonic & Melodic Minor',
    intervals: [0, 1, 3, 4, 6, 8, 10],
    formula: '1 b9 #9 3 b5 #5 b7',
    characteristicIntervals: [1, 3, 6, 8],
    classicalUse: '7th mode of Melodic Minor; intense chromatic voice leading into a tonic.',
    modernUse: 'Maximum tension over V7alt chords before resolving to I or i.',
  },
  {
    id: 'minor_pentatonic',
    name: 'Minor Pentatonic',
    category: 'Pentatonic & Blues',
    intervals: [0, 3, 5, 7, 10],
    formula: '1 b3 4 5 b7',
    characteristicIntervals: [3, 10],
    classicalUse: 'Folk/modal melodies and clean acoustic fingerpicking motifs.',
    modernUse: 'Box-breaking 3NPS/2-1-2 hybrid-picked wide-interval cascades (Polyphia signature!).',
  },
  {
    id: 'major_pentatonic',
    name: 'Major Pentatonic',
    category: 'Pentatonic & Blues',
    intervals: [0, 2, 4, 7, 9],
    formula: '1 2 3 5 6',
    characteristicIntervals: [4, 9],
    classicalUse: 'Pastoral acoustic themes and open-string harp-like cascading harmonics.',
    modernUse: 'Gospel/neo-soul double-stops, country hybrid-picking, and clean math-rock hooks.',
  },
  {
    id: 'blues',
    name: 'Blues Scale',
    category: 'Pentatonic & Blues',
    intervals: [0, 3, 5, 6, 7, 10],
    formula: '1 b3 4 b5 5 b7',
    characteristicIntervals: [6],
    classicalUse: 'Chromatic passing tone (#4/b5) between 4 and 5.',
    modernUse: 'Expressive bends, micro-slides, and rhythmic hybrid-picked stabs.',
  },
  {
    id: 'dim_wh',
    name: 'Whole-Half Diminished',
    category: 'Symmetrical & Exotic',
    intervals: [0, 2, 3, 5, 6, 8, 9, 11],
    formula: '1 2 b3 4 b5 b6 6 7',
    characteristicIntervals: [6, 9],
    classicalUse: 'Symmetrical diminished 7th arpeggio embellishments (Barrios, Bach).',
    modernUse: 'Repeating 3-fret symmetrical sequences across strings.',
  },
  {
    id: 'hirajoshi',
    name: 'Hirajoshi (Japanese Pentatonic)',
    category: 'Symmetrical & Exotic',
    intervals: [0, 2, 3, 7, 8],
    formula: '1 2 b3 5 b6',
    characteristicIntervals: [3, 8],
    classicalUse: 'Koto-inspired nylon-string arpeggios with wide 4th/5th leaps.',
    modernUse: 'Ichika Nito / Tim Henson crystalline clean arpeggios and tap-harmonics.',
  },
];

export interface ChordVoicing {
  id: string;
  name: string;
  symbol: string;
  category:
    | 'Triads'
    | '7th & Shell'
    | 'Classical Extensions'
    | 'Modern / Polyphia'
    | 'Band Signatures (Deftones / Unearth / HORSE)';
  intervals: number[]; // semitones in chord
  formula: string;
  offsets: (number | null)[];
  rootString: number; // 0 = 6th string .. 5 = 1st string
  fingers: (string | null)[]; // '1','2','3','4','T'
  description: string;
  pickingHint: string;
}

export const CHORD_VOICINGS: ChordVoicing[] = [
  {
    id: 'triad_maj_top3_root',
    name: 'Major Triad (Strings 1-3, Root Pos)',
    symbol: '',
    category: 'Triads',
    intervals: [0, 4, 7],
    formula: '1 3 5',
    offsets: [null, null, null, 2, 2, 0], // e.g., at fret 5: x-x-x-7-7-5? Wait: G(5+2)=A? No: on 3rd string (G), 2nd string (B), 1st string (E): E shape top 3: G+2=A(root?), wait: let's make root on string 3 (index 3)
    // Let's verify exact intervals for Standard Tuning [E, A, D, G, B, E] = [40, 45, 50, 55, 59, 64]
    // String 3 (G=55), String 2 (B=59, +4), String 1 (E=64, +9)
    // Root on String 3 at fret F -> pitch 55+F. 3rd (+4) on String 2 needs 55+F+4 = 59+F -> offset 0! 5th (+7) on String 1 needs 55+F+7 = 62+F -> 64 + (F-2) -> offset -2!
    // Wait: let's use relative to lowest fret in shape (anchorFret) so all offsets >= 0!
    // Root on String 3 = +2, String 2 = +2, String 1 = 0 -> pitches: (55+F+2)=root, (59+F+2)=root+4 (M3), (64+F)=root+7 (P5)!
    // Yes! E.g. F=3 -> x-x-x-5-5-3 = C major (C, E, G)!
    rootString: 3,
    fingers: [null, null, null, '2', '3', '1'],
    description: 'Essential upper-register triad. Moveable across the neck for melodic chord-melody.',
    pickingHint: 'Classical: i-m-a block | Hybrid: Pick(3) + M(2) + R(1)',
  },
  {
    id: 'triad_min_top3_root',
    name: 'Minor Triad (Strings 1-3, Root Pos)',
    symbol: 'm',
    category: 'Triads',
    intervals: [0, 3, 7],
    formula: '1 b3 5',
    offsets: [null, null, null, 2, 1, 0], // String 3=+2 (root), String 2=+1 (b3), String 1=0 (5) -> e.g. x-x-x-5-4-3 = Cm
    rootString: 3,
    fingers: [null, null, null, '3', '2', '1'],
    description: 'Compact minor triad on the top 3 strings. Lower the 2nd string by 1 fret from Major.',
    pickingHint: 'Classical: i-m-a | Hybrid: Pick + M + R',
  },
  {
    id: 'triad_maj_mid_1stinv',
    name: 'Major Triad (Strings 2-4, 1st Inv)',
    symbol: '/3',
    category: 'Triads',
    intervals: [0, 4, 7],
    formula: '3 5 1',
    // String 4 (D=50), String 3 (G=55), String 2 (B=59)
    // 1st inv: bass is 3rd on str 4. Let str 4 = +2 (52+F = E if F=0), str 3 = 0 (55+F = G = +3 from bass = P5 of C!), str 2 = +1 (60+F = C = root!)
    // Check: F=3 -> str4=5(G), str3=3(Bb? no G+3=Bb). Wait: 50+5=55(G), 55+3=58(Bb), 59+4=63(Eb) -> Eb major! Root is String 2 (+1)!
    offsets: [null, null, 2, 0, 1, null],
    rootString: 4,
    fingers: [null, null, '3', '1', '2', null],
    description: 'First inversion triad with the 3rd in the bass—smooth classical bassline voice leading.',
    pickingHint: 'Classical: p-i-m | Hybrid: Pick(4) + M(3) + R(2)',
  },
  {
    id: 'shell_maj7_6',
    name: 'Major 7 Shell Voicing (6th Str Root)',
    symbol: 'maj7',
    category: '7th & Shell',
    intervals: [0, 4, 11],
    formula: '1 3 7',
    // Str 6 (40+F) = root. Str 4 (50+F+1) = 7th (+11). Str 3 (55+F+1) = 3rd (+16 = +4).
    // Check F=5 (A): str6=5(A), str4=6(G#), str3=6(C#). Clean!
    offsets: [0, null, 1, 1, null, null],
    rootString: 0,
    fingers: ['1', null, '2', '3', null, null],
    description: 'Zero-clutter 3-note shell (Root-7-3). Leaves the 5th out for maximum harmonic clarity.',
    pickingHint: 'Classical: p-i-m | Hybrid: Pick(6) + M(4) + R(3)',
  },
  {
    id: 'shell_m7_6',
    name: 'Minor 7 Shell Voicing (6th Str Root)',
    symbol: 'm7',
    category: '7th & Shell',
    intervals: [0, 3, 10],
    formula: '1 b3 b7',
    // Str 6 (0) = root, Str 4 (0) = b7 (+10), Str 3 (0) = b3 (+15 = +3)
    offsets: [0, null, 0, 0, null, null],
    rootString: 0,
    fingers: ['1', null, '2', '3', null, null],
    description: 'Classic jazz/neo-soul m7 shell. Fret all three on the same fret with 1-2-3 or mini-barre.',
    pickingHint: 'Classical: p-i-m | Hybrid: Pick(6) + M(4) + R(3)',
  },
  {
    id: 'drop2_maj7',
    name: 'Drop-2 Maj7 (Strings 1-4)',
    symbol: 'maj7',
    category: '7th & Shell',
    intervals: [0, 4, 7, 11],
    formula: '1 5 7 3',
    // Root on Str 4: Str 4 (50+F), Str 3 (55+F+2 = +7), Str 2 (59+F+2 = +11), Str 1 (64+F+2 = +16 = +4)
    // Wait: F=5 (G): 5-7-7-7? Check: D+5=G(55), G+7=D(62,+7), B+7=F#(66,+11), E+7=B(71,+16). Yes!
    offsets: [null, null, 0, 2, 2, 2],
    rootString: 2,
    fingers: [null, null, '1', '2', '3', '4'],
    description: 'Lush Drop-2 voicing. Notice how the 2nd highest voice is dropped an octave to the bass.',
    pickingHint: 'Classical: p-i-m-a | Hybrid: Pick(4) + M(3) + R(2) + Pinky(1) or Pick sweep',
  },
  {
    id: 'drop2_m7',
    name: 'Drop-2 m7 (Strings 1-4)',
    symbol: 'm7',
    category: '7th & Shell',
    intervals: [0, 3, 7, 10],
    formula: '1 5 b7 b3',
    // Str 4=0, Str 3=+2, Str 2=+1, Str 1=+1
    offsets: [null, null, 0, 2, 1, 1],
    rootString: 2,
    fingers: [null, null, '1', '4', '2', '3'],
    description: 'Smooth Drop-2 minor 7th. Pairs effortlessly with Drop-2 Maj7 and Dom7 on strings 1-4.',
    pickingHint: 'Classical: p-i-m-a | Hybrid: Pick(4) + M/R/Pinky',
  },
  {
    id: 'classical_add9',
    name: 'Spread Add9 (5th Str Root)',
    symbol: 'add9',
    category: 'Classical Extensions',
    intervals: [0, 4, 7, 14],
    formula: '1 5 9 3',
    // Str 5 (45+F)=root. Str 4 (50+F+2)=+7 (5th). Str 3 (55+F+4)=+14 (9th). Str 2 (59+F)=+14? Wait: 59+F - (45+F) = 14 (9th)!
    // Let's do: Str 5 = 0 (root), Str 4 = +2 (5th), Str 3 = +4 (9th), Str 2 = +2 (M3: 59+2 - 45 = 16 = +4)!
    // Check C (F=3): x-3-5-7-5-x -> C(48), G(55), D(62), E(64)! Classic Andy Summers / Classical spread!
    offsets: [null, 0, 2, 4, 2, null],
    rootString: 1,
    fingers: [null, '1', '2', '4', '3', null],
    description: 'Wide-interval add9 chord. Builds left-hand stretch and produces harp-like acoustic resonance.',
    pickingHint: 'Classical: p-i-m-a roll | Hybrid: Pick(5)-Pick(4)-M(3)-R(2)',
  },
  {
    id: 'polyphia_maj9',
    name: 'Polyphia-Style Maj9 (5th Str Root)',
    symbol: 'maj9',
    category: 'Modern / Polyphia',
    intervals: [0, 4, 7, 11, 14],
    formula: '1 3 7 9',
    // Str 5=1(F+1? Let's make min offset 0):
    // Classic neo-soul / Polyphia maj9: x-3-2-4-3-x (Cmaj9) -> offsets relative to F=2: Str5=+1, Str4=0, Str3=+2, Str2=+1
    // Root is Str 5 (+1)! Check: C(48), E(52,+4), B(59,+11), D(62,+14).
    offsets: [null, 1, 0, 2, 1, null],
    rootString: 1,
    fingers: [null, '2', '1', '4', '3', null],
    description: 'The quintessential modern math-rock / neo-soul Maj9 shape. Crisp, vocal, and percussive.',
    pickingHint: 'Hybrid: Pick(5) + M(4) + R(3) or arpeggiated Pick-Pick-M-R with a slide into +1!',
  },
  {
    id: 'polyphia_m11',
    name: 'Modern m11 (6th Str Root, String-Skip)',
    symbol: 'm11',
    category: 'Modern / Polyphia',
    intervals: [0, 3, 7, 10, 17],
    formula: '1 b7 b3 11',
    // Str 6=0 (40+F), Str 4=0 (50+F = +10 b7), Str 3=0 (55+F = +15 b3), Str 2=0 (59+F = +19 = 5th? Wait: 59-40=19 = P5!)
    // For 11th (+17) on Str 2: need 40+F+17 = 57+F -> 59+(F-2)! So Str 6=+2, Str 4=+2, Str 3=+2, Str 2=0!
    // Check A (F=5 -> shape at 5,x,5,5,3,x): A(45), G(55), C(60), D(62)! Yes! A-G-C-D = Am11!
    offsets: [2, null, 2, 2, 0, null],
    rootString: 0,
    fingers: ['2', null, '3', '4', '1', null],
    description: 'Glassy m11 voicing skipping the 5th string. Ideal for hybrid-picked plucks and hammer-on embellishments.',
    pickingHint: 'Hybrid: Pick(6) slap/pluck + M(4) + R(3) + Pinky(2) or thumb+fingers',
  },
  {
    id: 'polyphia_7alt',
    name: 'Dominant 7#9 (Hendrix / Neo-Soul)',
    symbol: '7#9',
    category: 'Modern / Polyphia',
    intervals: [0, 4, 10, 15],
    formula: '1 3 b7 #9',
    // x-3-2-3-4-x -> Str5=+1, Str4=0, Str3=+1, Str2=+2
    offsets: [null, 1, 0, 1, 2, null],
    rootString: 1,
    fingers: [null, '2', '1', '3', '4', null],
    description: 'Spicy dominant tension chord used as V/vi or III7#9 in gospel, neo-soul, and Polyphia turnarounds.',
    pickingHint: 'Hybrid: Pick bass + snap upper 3 notes simultaneously',
  },
  {
    id: 'quartal_4ths',
    name: 'Quartal Voicing (Stacked 4ths)',
    symbol: 'sus4(9)',
    category: 'Modern / Polyphia',
    intervals: [0, 5, 10, 15],
    formula: '1 4 b7 b3',
    offsets: [null, 0, 0, 0, 1, null],
    rootString: 1,
    fingers: [null, '1', '1', '1', '2', null],
    description: 'McCoy Tyner / modern fusion quartal stack. Ambiguous, open, and great for modal vamps.',
    pickingHint: 'Classical: p-i-m-a | Hybrid: Pick(5) + M(4) + R(3) + Pinky(2)',
  },
  {
    id: 'deftones_sus2_wall',
    name: 'Deftones Shoegaze Sus2/Add9 Wall',
    symbol: 'sus2(add9)',
    category: 'Band Signatures (Deftones / Unearth / HORSE)',
    intervals: [0, 7, 12, 14, 16],
    formula: '1 5 1 9 3',
    offsets: [0, 2, 4, 1, 0, 0],
    rootString: 0,
    fingers: ['1', '2', '4', '1', '1', '1'],
    description: 'Stephen Carpenter (Deftones) lush wall-of-sound chord: heavy low 5th/9th stacked with shimmering upper major 3rd & 7th extensions.',
    pickingHint: 'High-Gain Strum: Wide unmuted down/up strokes after tight staccato low-string chugs',
  },
  {
    id: 'unearth_dim_harmony',
    name: 'Unearth Melodic Metalcore Diminished 7th',
    symbol: 'dim7',
    category: 'Band Signatures (Deftones / Unearth / HORSE)',
    intervals: [0, 3, 6, 9],
    formula: '1 b3 b5 bb7',
    offsets: [null, null, 0, 1, 0, 1],
    rootString: 2,
    fingers: [null, null, '1', '3', '2', '4'],
    description: 'Buz McGrath & Ken Susi (Unearth) symmetrical diminished shape: move up/down in minor 3rds (3 frets) for neoclassical sweep-tap leads and vii°7 tension.',
    pickingHint: 'Economy / Sweep Pick across strings 4→1 + tap +3 frets higher on string 1',
  },
  {
    id: 'horse_panic_tritone',
    name: 'HORSE the band Mathcore Panic Stab',
    symbol: 'dim(b9)',
    category: 'Band Signatures (Deftones / Unearth / HORSE)',
    intervals: [0, 6, 13, 19],
    formula: '1 b5 b9 5',
    offsets: [null, null, 0, 1, 0, 0],
    rootString: 2,
    fingers: [null, null, '1', '2', '1', '1'],
    description: 'David Isen (HORSE the band) angular mathcore cluster: stacks a tritone and minor 9th for jarring boss-fight breakdowns.',
    pickingHint: 'Staccato downstroke stab or hybrid-picked dissonant pluck',
  },
];

export interface CircleKey {
  major: string;
  minor: string;
  pc: number;
  accidentals: string;
  preferFlat: boolean;
}

export const CIRCLE_OF_FIFTHS: CircleKey[] = [
  { major: 'C', minor: 'Am', pc: 0, accidentals: '0', preferFlat: false },
  { major: 'G', minor: 'Em', pc: 7, accidentals: '1#', preferFlat: false },
  { major: 'D', minor: 'Bm', pc: 2, accidentals: '2#', preferFlat: false },
  { major: 'A', minor: 'F#m', pc: 9, accidentals: '3#', preferFlat: false },
  { major: 'E', minor: 'C#m', pc: 4, accidentals: '4#', preferFlat: false },
  { major: 'B', minor: 'G#m', pc: 11, accidentals: '5#', preferFlat: false },
  { major: 'Gb', minor: 'Ebm', pc: 6, accidentals: '6b', preferFlat: true },
  { major: 'Db', minor: 'Bbm', pc: 1, accidentals: '5b', preferFlat: true },
  { major: 'Ab', minor: 'Fm', pc: 8, accidentals: '4b', preferFlat: true },
  { major: 'Eb', minor: 'Cm', pc: 3, accidentals: '3b', preferFlat: true },
  { major: 'Bb', minor: 'Gm', pc: 10, accidentals: '2b', preferFlat: true },
  { major: 'F', minor: 'Dm', pc: 5, accidentals: '1b', preferFlat: true },
];

export interface ProgressionChord {
  roman: string;
  symbol: string;
  rootPc: number;
  scaleId: string;
  midiNotes: number[]; // actual voiced MIDI notes for playback
  functionNote: string;
}

export interface ProgressionDef {
  id: string;
  title: string;
  style:
    | 'Classical & Acoustic'
    | 'Jazz & Bossa'
    | 'Modern / Polyphia / Neo-Soul'
    | 'Band Signatures (Unearth / Deftones / HORSE)';
  keyLabel: string;
  bpm: number;
  description: string;
  voiceLeadingTip: string;
  chords: ProgressionChord[];
}

export const PROGRESSIONS: ProgressionDef[] = [
  {
    id: 'andalusian',
    title: 'Andalusian Cadence (Flamenco / Classical)',
    style: 'Classical & Acoustic',
    keyLabel: 'A Minor / E Phrygian',
    bpm: 96,
    description: 'Descending stepwise bassline (A → G → F → E) resolving to a fiery E7 dominant.',
    voiceLeadingTip: 'Notice the chromatic pull from F (b6) down to E (5) and G# leading tone in E7.',
    chords: [
      { roman: 'i', symbol: 'Am', rootPc: 9, scaleId: 'aeolian', midiNotes: [45, 52, 57, 60, 64], functionNote: 'Tonic minor' },
      { roman: 'bVII', symbol: 'G', rootPc: 7, scaleId: 'mixolydian', midiNotes: [43, 50, 55, 59, 62], functionNote: 'Stepwise descent' },
      { roman: 'bVI', symbol: 'Fmaj7', rootPc: 5, scaleId: 'lydian', midiNotes: [41, 48, 53, 57, 64], functionNote: 'Open high E adds maj7 shimmer' },
      { roman: 'V7', symbol: 'E7', rootPc: 4, scaleId: 'phrygian_dominant', midiNotes: [40, 47, 52, 56, 62], functionNote: 'Phrygian Dominant resolution' },
    ],
  },
  {
    id: 'bach_minor',
    title: 'Baroque Minor Cadence (with Inversions)',
    style: 'Classical & Acoustic',
    keyLabel: 'E Minor',
    bpm: 84,
    description: 'Classical voice-leading using 1st inversion (G/B) and diminished passing tension.',
    voiceLeadingTip: 'Keep the bass moving smoothly by step: E → F# → G → A → B.',
    chords: [
      { roman: 'i', symbol: 'Em', rootPc: 4, scaleId: 'aeolian', midiNotes: [40, 47, 52, 55, 59], functionNote: 'Tonic' },
      { roman: 'ii°6', symbol: 'F#m7b5/A', rootPc: 6, scaleId: 'locrian', midiNotes: [45, 50, 54, 57, 60], functionNote: 'Pre-dominant inversion' },
      { roman: 'V7', symbol: 'B7', rootPc: 11, scaleId: 'harmonic_minor', midiNotes: [47, 54, 57, 63, 66], functionNote: 'Harmonic minor leading tone (D#)' },
      { roman: 'i', symbol: 'Em9', rootPc: 4, scaleId: 'aeolian', midiNotes: [40, 47, 54, 55, 59], functionNote: 'Color resolution' },
    ],
  },
  {
    id: 'bossa_251',
    title: 'Bossa Nova ii9 – V13 – Imaj9',
    style: 'Jazz & Bossa',
    keyLabel: 'C Major',
    bpm: 112,
    description: 'Classic acoustic fingerstyle jazz turnaround with smooth guide-tone voice leading (3rds & 7ths).',
    voiceLeadingTip: 'Watch the 7th of Dm9 (C) drop a half-step to the 3rd of G13 (B), while F drops to E in Cmaj9.',
    chords: [
      { roman: 'ii9', symbol: 'Dm9', rootPc: 2, scaleId: 'dorian', midiNotes: [50, 53, 57, 60, 64], functionNote: 'Dorian color' },
      { roman: 'V13', symbol: 'G13', rootPc: 7, scaleId: 'mixolydian', midiNotes: [43, 53, 59, 64], functionNote: 'Guide tones F & B + 13th (E)' },
      { roman: 'Imaj9', symbol: 'Cmaj9', rootPc: 0, scaleId: 'major', midiNotes: [48, 52, 59, 62], functionNote: 'Lush tonic' },
      { roman: 'VI7alt', symbol: 'A7b13', rootPc: 9, scaleId: 'altered', midiNotes: [45, 55, 61, 65], functionNote: 'Turnaround back to ii' },
    ],
  },
  {
    id: 'polyphia_neosoul',
    title: 'Polyphia / Neo-Soul IVmaj9 – III7#9 – vi11 – V/IV',
    style: 'Modern / Polyphia / Neo-Soul',
    keyLabel: 'G Major / E Minor',
    bpm: 120,
    description: 'The signature modern hybrid-picking progression: bright IVmaj9 into a spicy secondary dominant III7#9.',
    voiceLeadingTip: 'Over III7#9 (B7#9), target Harmonic Minor or Phrygian Dominant before landing on Em11.',
    chords: [
      { roman: 'IVmaj9', symbol: 'Cmaj9', rootPc: 0, scaleId: 'lydian', midiNotes: [48, 52, 59, 62, 67], functionNote: 'Lydian shimmer' },
      { roman: 'III7#9', symbol: 'B7#9', rootPc: 11, scaleId: 'phrygian_dominant', midiNotes: [47, 51, 57, 62], functionNote: 'Secondary dominant V/vi' },
      { roman: 'vi11', symbol: 'Em11', rootPc: 4, scaleId: 'aeolian', midiNotes: [40, 50, 55, 57, 62], functionNote: 'Open glassy minor' },
      { roman: 'V7/IV', symbol: 'G13sus4', rootPc: 7, scaleId: 'mixolydian', midiNotes: [43, 53, 57, 60, 64], functionNote: 'Pulls back to Cmaj9' },
    ],
  },
  {
    id: 'mathrock_twinkle',
    title: 'Math-Rock IVmaj9 – V6 – iii7 – vi9',
    style: 'Modern / Polyphia / Neo-Soul',
    keyLabel: 'E Major',
    bpm: 126,
    description: 'Never-resolving major-key progression avoiding the I chord to keep momentum floating.',
    voiceLeadingTip: 'Use Major Pentatonic + Lydian (over IV) with hybrid-picked string skips and hammer-ons.',
    chords: [
      { roman: 'IVmaj9', symbol: 'Amaj9', rootPc: 9, scaleId: 'lydian', midiNotes: [45, 52, 56, 61, 64], functionNote: 'Lydian anchor' },
      { roman: 'V6', symbol: 'B6', rootPc: 11, scaleId: 'mixolydian', midiNotes: [47, 54, 56, 63], functionNote: 'Warm 6th color' },
      { roman: 'iii7', symbol: 'G#m7', rootPc: 8, scaleId: 'phrygian', midiNotes: [44, 54, 59, 63], functionNote: 'Passing mediant' },
      { roman: 'vi9', symbol: 'C#m9', rootPc: 1, scaleId: 'aeolian', midiNotes: [49, 52, 59, 63], functionNote: 'Relative minor lift' },
    ],
  },
  {
    id: 'deftones_shoegaze_prog',
    title: 'Deftones Shoegaze-Metal (Imaj9 – vi(add9) – IVmaj7#11 – V6)',
    style: 'Band Signatures (Unearth / Deftones / HORSE)',
    keyLabel: 'D Major / B Minor',
    bpm: 88,
    description: 'Stephen Carpenter & Chino Moreno contrast: heavy drop-tuned anchors blooming into floating maj9 and Lydian #11 clouds.',
    voiceLeadingTip: 'Keep the top A and F# notes ringing as a common-tone drone across all four chords.',
    chords: [
      { roman: 'Imaj9', symbol: 'Dmaj9', rootPc: 2, scaleId: 'major', midiNotes: [38, 45, 54, 57, 61, 64], functionNote: 'Lush open-drone tonic' },
      { roman: 'vi(add9)', symbol: 'Bm(add9)', rootPc: 11, scaleId: 'aeolian', midiNotes: [47, 54, 59, 61, 66], functionNote: 'Melancholic 9th rub' },
      { roman: 'IVmaj7#11', symbol: 'Gmaj7#11', rootPc: 7, scaleId: 'lydian', midiNotes: [43, 50, 54, 59, 61], functionNote: 'Weightless Lydian float' },
      { roman: 'V6', symbol: 'A6sus2', rootPc: 9, scaleId: 'mixolydian', midiNotes: [45, 52, 57, 59, 66], functionNote: 'Suspended return' },
    ],
  },
  {
    id: 'unearth_oncoming_storm',
    title: 'Unearth Melodic Metalcore (i – bVI – iv – V7b9)',
    style: 'Band Signatures (Unearth / Deftones / HORSE)',
    keyLabel: 'D Harmonic Minor',
    bpm: 132,
    description: 'Buz McGrath & Ken Susi blueprint: Gothenburg minor harmony driving into a neoclassical Harmonic Minor V7(b9) sweep-tap turnaround.',
    voiceLeadingTip: 'On A7b9 (V7), use D Harmonic Minor (C# leading tone) or C#dim7 sweep arpeggios.',
    chords: [
      { roman: 'i', symbol: 'Dm', rootPc: 2, scaleId: 'harmonic_minor', midiNotes: [38, 45, 50, 53, 57], functionNote: 'Pedal-point riff anchor' },
      { roman: 'bVI', symbol: 'Bbmaj7', rootPc: 10, scaleId: 'lydian', midiNotes: [46, 53, 58, 62, 65], functionNote: 'Epic harmonized 3rds lift' },
      { roman: 'iv', symbol: 'Gm', rootPc: 7, scaleId: 'dorian', midiNotes: [43, 50, 55, 58, 62], functionNote: 'Pre-dominant weight' },
      { roman: 'V7b9', symbol: 'A7b9 (C#dim7)', rootPc: 9, scaleId: 'phrygian_dominant', midiNotes: [45, 52, 55, 58, 61], functionNote: 'Harmonic minor sweep-tap apex' },
    ],
  },
  {
    id: 'horse_nintendocore_boss',
    title: 'HORSE the band Nintendocore (i – bII – vii°7 – I)',
    style: 'Band Signatures (Unearth / Deftones / HORSE)',
    keyLabel: 'E Harmonic Minor / Phrygian',
    bpm: 142,
    description: 'David Isen & Erik Engstrom 8-bit boss-fight cadence: dark Phrygian/Harmonic Minor urgency colliding with a triumphant Picardy-third major arpeggio.',
    voiceLeadingTip: 'Double the chords as rapid 16th-note 1-3-5-8 arpeggios using Chiptune or High-Gain tone!',
    chords: [
      { roman: 'i', symbol: 'Em', rootPc: 4, scaleId: 'harmonic_minor', midiNotes: [40, 47, 52, 55, 59, 64], functionNote: '8-bit castle theme minor' },
      { roman: 'bII', symbol: 'Fmaj7#11', rootPc: 5, scaleId: 'lydian', midiNotes: [41, 48, 52, 57, 59, 64], functionNote: 'Phrygian b2 urgency' },
      { roman: 'vii°7', symbol: 'D#dim7', rootPc: 3, scaleId: 'dim_wh', midiNotes: [51, 54, 57, 60, 63], functionNote: 'Symmetrical glitch panic' },
      { roman: 'I', symbol: 'E (Picardy)', rootPc: 4, scaleId: 'phrygian_dominant', midiNotes: [40, 47, 52, 56, 59, 64], functionNote: 'Bright major chiptune triumph' },
    ],
  },
];

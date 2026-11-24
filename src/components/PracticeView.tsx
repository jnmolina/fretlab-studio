import React, { useEffect, useState } from 'react';
import { Volume2, CheckCircle2, Circle, RotateCcw, Award } from 'lucide-react';
import { audio, GuitarTone } from '../lib/audio';

interface PracticeViewProps {
  tone: GuitarTone;
}

type QuizType = 'intervals' | 'chords' | 'modes';

interface QuizQuestion {
  prompt: string;
  play: () => void;
  options: string[];
  answer: string;
}

const INTERVAL_QS = [
  { name: 'Minor 3rd (b3)', semis: 3 },
  { name: 'Major 3rd (3)', semis: 4 },
  { name: 'Perfect 4th (4)', semis: 5 },
  { name: 'Tritone (#4/b5)', semis: 6 },
  { name: 'Perfect 5th (5)', semis: 7 },
  { name: 'Minor 6th (b6)', semis: 8 },
  { name: 'Major 7th (7)', semis: 11 },
];

const CHORD_QS = [
  { name: 'Maj7', semis: [0, 4, 7, 11] },
  { name: 'm7', semis: [0, 3, 7, 10] },
  { name: 'Dominant 7', semis: [0, 4, 7, 10] },
  { name: 'm7b5 (Half-Dim)', semis: [0, 3, 6, 10] },
  { name: 'Maj9 (Polyphia)', semis: [0, 4, 11, 14] },
  { name: '7#9 (Altered)', semis: [0, 4, 10, 15] },
];

const MODE_QS = [
  { name: 'Lydian (#4)', semis: [0, 2, 4, 6, 7, 9, 11] },
  { name: 'Ionian (Major)', semis: [0, 2, 4, 5, 7, 9, 11] },
  { name: 'Mixolydian (b7)', semis: [0, 2, 4, 5, 7, 9, 10] },
  { name: 'Dorian (b3, 6)', semis: [0, 2, 3, 5, 7, 9, 10] },
  { name: 'Phrygian (b2)', semis: [0, 1, 3, 5, 7, 8, 10] },
  { name: 'Harmonic Minor', semis: [0, 2, 3, 5, 7, 8, 11] },
];

interface RoutineItem {
  id: string;
  label: string;
  minutes: number;
  track: 'Classical/Acoustic' | 'Theory/Fretboard' | 'Electric Hybrid';
}

const DEFAULT_ROUTINE: RoutineItem[] = [
  { id: 'r1', label: 'Giuliani P-I-M-A & Rest-Stroke Warmup (Metronome 80→100 BPM)', minutes: 10, track: 'Classical/Acoustic' },
  { id: 'r2', label: 'Scale Modes & 3NPS / CAGED Neck Connection (Say note names aloud)', minutes: 10, track: 'Theory/Fretboard' },
  { id: 'r3', label: 'Triads & Drop-2 / Shell Voicings across String Sets 1-4', minutes: 10, track: 'Theory/Fretboard' },
  { id: 'r4', label: 'Classical Repertoire / Polyphonic Bass + Melody Study', minutes: 15, track: 'Classical/Acoustic' },
  { id: 'r5', label: 'Hybrid Picking String-Skips (Maj9/m11) & Harp Harmonics', minutes: 15, track: 'Electric Hybrid' },
];

export const PracticeView: React.FC<PracticeViewProps> = ({ tone }) => {
  const [quizType, setQuizType] = useState<QuizType>('chords');
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAns, setSelectedAns] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fretlab_routine_done');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('fretlab_routine_done', JSON.stringify(completedIds));
  }, [completedIds]);

  const generateQuestion = (type: QuizType) => {
    setSelectedAns(null);
    const rootMidi = 48 + Math.floor(Math.random() * 7);

    if (type === 'intervals') {
      const target = INTERVAL_QS[Math.floor(Math.random() * INTERVAL_QS.length)];
      setQuestion({
        prompt: 'Listen to the two-note interval and identify it:',
        play: () => {
          audio.playNote(rootMidi, tone, 1.0, 0, 0.85);
          audio.playNote(rootMidi + target.semis, tone, 1.2, 0.45, 0.85);
        },
        options: INTERVAL_QS.map((q) => q.name),
        answer: target.name,
      });
    } else if (type === 'chords') {
      const target = CHORD_QS[Math.floor(Math.random() * CHORD_QS.length)];
      setQuestion({
        prompt: 'Identify the chord quality (arpeggiated):',
        play: () => {
          audio.playChord(
            target.semis.map((s) => rootMidi + s),
            tone,
            90,
            1.8
          );
        },
        options: CHORD_QS.map((q) => q.name),
        answer: target.name,
      });
    } else {
      const target = MODE_QS[Math.floor(Math.random() * MODE_QS.length)];
      setQuestion({
        prompt: 'Identify the scale / mode played ascending:',
        play: () => {
          [...target.semis, 12].forEach((s, idx) => {
            audio.playNote(rootMidi + s, tone, 0.65, idx * 0.22, 0.85);
          });
        },
        options: MODE_QS.map((q) => q.name),
        answer: target.name,
      });
    }
  };

  useEffect(() => {
    generateQuestion(quizType);
  }, [quizType]);

  const handleAnswer = (opt: string) => {
    if (selectedAns || !question) return;
    setSelectedAns(opt);
    setScore((prev) => ({
      correct: prev.correct + (opt === question.answer ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const toggleRoutine = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const totalMinutes = DEFAULT_ROUTINE.reduce((acc, r) => acc + r.minutes, 0);
  const doneMinutes = DEFAULT_ROUTINE.filter((r) => completedIds.includes(r.id)).reduce(
    (acc, r) => acc + r.minutes,
    0
  );

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Ear & Theory Quiz */}
      <div className="rounded-xl border border-slate-800 bg-[#13151c] p-5 space-y-4 lg:col-span-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
            <Award className="h-4 w-4" />
            <span>Ear & Harmonic Recognition Lab</span>
          </div>
          <span className="font-mono text-xs text-slate-400">
            Score: <strong className="text-cyan-300">{score.correct}</strong> / {score.total}
          </span>
        </div>

        <div className="flex gap-2">
          {(['intervals', 'chords', 'modes'] as QuizType[]).map((qt) => (
            <button
              key={qt}
              type="button"
              onClick={() => setQuizType(qt)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
                quizType === qt
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {qt}
            </button>
          ))}
        </div>

        {question && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/90 p-3.5">
              <span className="text-xs text-slate-300">{question.prompt}</span>
              <button
                type="button"
                onClick={question.play}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400"
              >
                <Volume2 className="h-3.5 w-3.5" /> Play Audio
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {question.options.map((opt) => {
                const isCorrect = opt === question.answer;
                const isSelected = opt === selectedAns;
                let cls =
                  'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600';
                if (selectedAns) {
                  if (isCorrect) cls = 'border-emerald-500 bg-emerald-500/20 text-emerald-200';
                  else if (isSelected) cls = 'border-rose-500 bg-rose-500/20 text-rose-200';
                }
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleAnswer(opt)}
                    className={`rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition-all ${cls}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {selectedAns && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-medium text-slate-300">
                  {selectedAns === question.answer
                    ? 'Nailed it!'
                    : `Answer: ${question.answer}`}
                </span>
                <button
                  type="button"
                  onClick={() => generateQuestion(quizType)}
                  className="rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
                >
                  Next Question →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Daily Practice Checklist */}
      <div className="rounded-xl border border-slate-800 bg-[#13151c] p-5 space-y-4 lg:col-span-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              60-Minute Classical → Hybrid Mastery Routine
            </h3>
            <p className="text-xs text-slate-400">
              {doneMinutes} / {totalMinutes} mins completed today (saved locally)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCompletedIds([])}
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${(doneMinutes / totalMinutes) * 100}%` }}
          />
        </div>

        <div className="space-y-2">
          {DEFAULT_ROUTINE.map((item) => {
            const done = completedIds.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleRoutine(item.id)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                  done
                    ? 'border-emerald-500/40 bg-emerald-500/10'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                {done ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                )}
                <div className="flex-1">
                  <div className={`text-xs font-medium ${done ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                    {item.label}
                  </div>
                  <div className="mt-1 flex items-center gap-2 font-mono text-[10px]">
                    <span className="text-amber-400">{item.minutes} min</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-cyan-400">{item.track}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

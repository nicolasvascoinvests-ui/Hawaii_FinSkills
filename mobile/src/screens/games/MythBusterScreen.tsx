import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Zap, Check, X, Flame, RotateCcw, Trophy } from 'lucide-react-native';
import ToolShell from '../../components/ToolShell';
import Button from '../../components/Button';
import type { RootStackScreenProps } from '../../navigation/types';

interface MythQuestion {
  id: string;
  statement: string;
  isFact: boolean;
  explanation: string;
  standard: string;
}

const QUESTIONS: MythQuestion[] = [
  {
    id: 'gross-net',
    statement: 'Gross pay and net pay are the same thing.',
    isFact: false,
    explanation: 'Gross is before taxes and deductions. Net is what actually hits your bank account.',
    standard: 'EI-1',
  },
  {
    id: 'hi-health',
    statement: 'Hawaii employers must offer health insurance to employees working 20+ hours a week.',
    isFact: true,
    explanation: 'The Hawaii Prepaid Health Care Act requires it — unique to Hawaii among US states.',
    standard: 'MR-3',
  },
  {
    id: 'bigger-pkg',
    statement: 'Bigger packages at the grocery store are always the better deal.',
    isFact: false,
    explanation: 'Always check the unit price. Bigger can be cheaper per ounce — or quietly more expensive.',
    standard: 'SP-3',
  },
  {
    id: 'degree-roi',
    statement: 'A 4-year degree always has a better return than trade school.',
    isFact: false,
    explanation: 'Many trades out-earn degree holders when you factor in tuition debt and years of lost income.',
    standard: 'MC-3',
  },
  {
    id: 'compound',
    statement: 'Compound interest grows faster than simple interest over long periods.',
    isFact: true,
    explanation: 'Compound pays interest on interest. That snowball is the engine of long-term investing.',
    standard: 'SV-3',
  },
  {
    id: 'credit-check',
    statement: 'Your credit score is only checked when you apply for a loan.',
    isFact: false,
    explanation: 'Landlords, employers, insurers, and utility companies can check it too.',
    standard: 'MC-5',
  },
  {
    id: 'auto-liability',
    statement: 'Auto liability insurance is mandatory for drivers in Hawaii.',
    isFact: true,
    explanation: 'Hawaii requires minimum liability coverage. Driving without it carries fines and license issues.',
    standard: 'MR-2',
  },
  {
    id: 'min-payment',
    statement: 'Paying the minimum on a credit card is enough to avoid paying interest.',
    isFact: false,
    explanation: 'You need to pay the full statement balance to avoid interest. Minimums can trap you for years.',
    standard: 'MC-2',
  },
  {
    id: 'mutual-etf',
    statement: 'Mutual funds and ETFs are the same thing.',
    isFact: false,
    explanation: 'Both are pooled, but ETFs trade on exchanges like stocks and usually cost less to own.',
    standard: 'IN-3',
  },
  {
    id: 'id-theft',
    statement: 'Identity theft only targets people with bad credit.',
    isFact: false,
    explanation: 'Thieves prefer clean credit files — they can open more accounts before getting caught.',
    standard: 'MR-5',
  },
];

const SECONDS_PER_QUESTION = 7;

type Answer = 'fact' | 'myth' | 'timeout';

interface AnswerLog {
  questionId: string;
  picked: Answer;
  correct: boolean;
}

export default function MythBusterScreen(_props: RootStackScreenProps<'MythBuster'>) {
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [log, setLog] = useState<AnswerLog[]>([]);
  const [reveal, setReveal] = useState<{ correct: boolean; picked: Answer } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const q = QUESTIONS[index];
  const finished = index >= QUESTIONS.length;

  useEffect(() => {
    if (finished || reveal) return;
    setTimeLeft(SECONDS_PER_QUESTION);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleAnswer('timeout');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, finished, reveal]);

  function handleAnswer(picked: Answer) {
    if (!q || reveal) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const correct =
      (picked === 'fact' && q.isFact) || (picked === 'myth' && !q.isFact);

    setLog((l) => [...l, { questionId: q.id, picked, correct }]);

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));
      // Base 10 + streak bonus + time bonus (0-5)
      const timeBonus = Math.round((timeLeft / SECONDS_PER_QUESTION) * 5);
      setScore((s) => s + 10 + (newStreak - 1) * 2 + timeBonus);
    } else {
      setStreak(0);
    }

    setReveal({ correct, picked });
    setTimeout(() => {
      setReveal(null);
      setIndex((i) => i + 1);
    }, 1400);
  }

  function reset() {
    setIndex(0);
    setTimeLeft(SECONDS_PER_QUESTION);
    setStreak(0);
    setBestStreak(0);
    setScore(0);
    setLog([]);
    setReveal(null);
  }

  const correctCount = log.filter((l) => l.correct).length;

  return (
    <ToolShell
      title="Myth Buster"
      description="FACT or MYTH? Tap fast — longer streaks earn bigger bonuses."
      gradient={['#8B5CF6', '#6366F1']}
      standards={['Mixed']}
      Icon={({ color, size }) => <Zap color={color} size={size} />}
      backLabel="Back to games"
    >
      {!finished && q && (
        <>
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1 bg-card rounded-2xl p-3">
              <Text className="text-[10px] text-muted-foreground uppercase tracking-wide">Score</Text>
              <Text className="text-lg font-bold text-foreground">{score}</Text>
            </View>
            <View className="flex-1 bg-card rounded-2xl p-3">
              <View className="flex-row items-center gap-1">
                <Flame color="#F97316" size={12} />
                <Text className="text-[10px] text-muted-foreground uppercase tracking-wide">Streak</Text>
              </View>
              <Text className="text-lg font-bold text-foreground">{streak}</Text>
            </View>
            <View className="flex-1 bg-card rounded-2xl p-3">
              <Text className="text-[10px] text-muted-foreground uppercase tracking-wide">Question</Text>
              <Text className="text-lg font-bold text-foreground">
                {index + 1}<Text className="text-sm text-muted-foreground">/{QUESTIONS.length}</Text>
              </Text>
            </View>
          </View>

          <View className="h-1.5 bg-muted rounded-full overflow-hidden mb-4">
            <MotiView
              from={{ width: '100%' }}
              animate={{ width: `${(timeLeft / SECONDS_PER_QUESTION) * 100}%` }}
              transition={{ type: 'timing', duration: 900 }}
              style={{
                height: '100%',
                backgroundColor: timeLeft <= 2 ? '#EF4444' : '#6366F1',
              }}
            />
          </View>

          <AnimatePresence exitBeforeEnter>
            <MotiView
              key={q.id + (reveal ? '-reveal' : '-asking')}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -10 }}
              transition={{ type: 'timing', duration: 200 }}
              className="bg-card rounded-2xl p-6 mb-4 min-h-[160px] justify-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              {reveal ? (
                <View>
                  <View className="flex-row items-center gap-2 mb-2">
                    {reveal.correct ? (
                      <>
                        <Check color="#059669" size={20} />
                        <Text className="font-bold text-emerald-700">Correct!</Text>
                      </>
                    ) : (
                      <>
                        <X color="#DC2626" size={20} />
                        <Text className="font-bold text-red-700">
                          {reveal.picked === 'timeout' ? 'Too slow!' : 'Not quite'}
                        </Text>
                      </>
                    )}
                    <View className="ml-auto bg-muted rounded-full px-2 py-0.5">
                      <Text className="text-[10px] font-semibold text-muted-foreground">
                        It's a {q.isFact ? 'FACT' : 'MYTH'}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm text-foreground">{q.explanation}</Text>
                </View>
              ) : (
                <Text className="text-lg font-semibold text-card-foreground text-center">
                  {q.statement}
                </Text>
              )}
            </MotiView>
          </AnimatePresence>

          <View className="flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Myth"
              onPress={() => handleAnswer('myth')}
              disabled={!!reveal}
              className={`flex-1 h-20 rounded-2xl items-center justify-center bg-destructive active:bg-rose-500 ${reveal ? 'opacity-50' : ''}`}
            >
              <X color="white" size={24} />
              <Text className="text-white font-bold text-lg mt-1">MYTH</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fact"
              onPress={() => handleAnswer('fact')}
              disabled={!!reveal}
              className={`flex-1 h-20 rounded-2xl items-center justify-center bg-emerald-600 active:bg-emerald-700 ${reveal ? 'opacity-50' : ''}`}
            >
              <Check color="white" size={24} />
              <Text className="text-white font-bold text-lg mt-1">FACT</Text>
            </Pressable>
          </View>
        </>
      )}

      {finished && (
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="bg-card rounded-2xl p-6"
        >
          <View className="flex-row items-center gap-2 mb-1">
            <Trophy color="#F59E0B" size={20} />
            <Text className="text-lg font-bold text-foreground">Round complete</Text>
          </View>
          <Text className="text-sm text-muted-foreground mb-4">
            You answered {correctCount} of {QUESTIONS.length} correctly.
          </Text>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-muted rounded-2xl p-4">
              <Text className="text-xs text-muted-foreground">Final score</Text>
              <Text className="text-3xl font-bold text-foreground">{score}</Text>
            </View>
            <View className="flex-1 bg-muted rounded-2xl p-4">
              <View className="flex-row items-center gap-1">
                <Flame color="#F97316" size={14} />
                <Text className="text-xs text-muted-foreground">Best streak</Text>
              </View>
              <Text className="text-3xl font-bold text-foreground">{bestStreak}</Text>
            </View>
          </View>

          <Text className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Review</Text>
          {QUESTIONS.map((question, i) => {
            const entry = log[i];
            return (
              <View key={question.id} className="flex-row items-start gap-2 py-2 border-b border-border">
                {entry?.correct ? (
                  <Check color="#059669" size={16} />
                ) : (
                  <X color="#DC2626" size={16} />
                )}
                <View className="flex-1">
                  <Text className="text-sm text-foreground">{question.statement}</Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    {question.isFact ? 'FACT' : 'MYTH'} · {question.standard}
                  </Text>
                </View>
              </View>
            );
          })}

          <View className="mt-5">
            <Button onPress={reset} leftIcon={<RotateCcw color="white" size={18} />} fullWidth>
              Play again
            </Button>
          </View>
        </MotiView>
      )}
    </ToolShell>
  );
}

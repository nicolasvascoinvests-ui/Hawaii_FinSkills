import { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Trophy,
  Clock,
} from 'lucide-react-native';
import Screen from '../components/Screen';
import Button from '../components/Button';
import LessonCertificate from '../components/LessonCertificate';
import Struggalo from '../components/Struggalo';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useCourseCompletion } from '../hooks/useCourseCompletion';
import type { QuizQuestion } from '../types/database';
import type { RootStackScreenProps } from '../navigation/types';

const COOLDOWN_MS = 60 * 60 * 1000;

interface DragDropItem {
  item: string;
  match: string;
}

interface Answer {
  questionId: string;
  correct: boolean;
  answer: string;
  rawAnswer: string | Record<string, string>;
}

interface GradeResult {
  score: number;
  total: number;
  pct: number;
  perStandard: Record<string, { correct: number; total: number }>;
  results: Array<{ questionId: string; correct: boolean; correctAnswer: string }>;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function interleaveByType(questions: QuizQuestion[]): QuizQuestion[] {
  const buckets = new Map<string, QuizQuestion[]>();
  for (const q of questions) {
    const list = buckets.get(q.question_type) ?? [];
    list.push(q);
    buckets.set(q.question_type, list);
  }

  const result: QuizQuestion[] = [];
  let lastType: string | null = null;

  while (result.length < questions.length) {
    let pickType: string | null = null;
    let pickSize = -1;
    for (const [type, list] of buckets) {
      if (list.length === 0) continue;
      if (type === lastType) continue;
      if (list.length > pickSize) {
        pickSize = list.length;
        pickType = type;
      }
    }
    if (pickType === null) {
      for (const [type, list] of buckets) {
        if (list.length > 0) {
          pickType = type;
          break;
        }
      }
    }
    if (pickType === null) break;
    const list = buckets.get(pickType)!;
    result.push(list.shift()!);
    lastType = pickType;
  }

  return result;
}

export default function QuizScreen({ route, navigation }: RootStackScreenProps<'Quiz'>) {
  const { lessonId } = route.params;
  const { user } = useAuth();
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [fillAnswer, setFillAnswer] = useState('');
  const [dragMatches, setDragMatches] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [quizDone, setQuizDone] = useState(false);
  const [cooldownDisplay, setCooldownDisplay] = useState('');
  const [serverCooldownMs, setServerCooldownMs] = useState<number | null>(null);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [quizStartedAt] = useState(() => Date.now());

  const { data: questions } = useQuery({
    queryKey: ['quiz-questions', lessonId],
    queryFn: async () => {
      const { data } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index');
      return (data ?? []) as QuizQuestion[];
    },
  });

  const { data: lesson } = useQuery({
    queryKey: ['lesson-basic', lessonId],
    queryFn: async () => {
      const { data } = await supabase
        .from('lessons')
        .select('course_id, title')
        .eq('id', lessonId)
        .single();
      return data;
    },
  });

  const courseCompletion = useCourseCompletion(lesson?.course_id ?? null);

  const { data: lastAttempt } = useQuery({
    queryKey: ['quiz-cooldown', lessonId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('quiz_attempts')
        .select('completed_at')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const cooldownRemaining = useMemo(() => {
    if (!lastAttempt?.completed_at) return 0;
    const elapsed = Date.now() - new Date(lastAttempt.completed_at).getTime();
    return Math.max(0, COOLDOWN_MS - elapsed);
  }, [lastAttempt]);

  const isOnCooldown = cooldownRemaining > 0;

  useEffect(() => {
    if (!isOnCooldown || !lastAttempt?.completed_at) return;
    const tick = () => {
      const remaining = Math.max(
        0,
        COOLDOWN_MS - (Date.now() - new Date(lastAttempt.completed_at!).getTime())
      );
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setCooldownDisplay(`${mins}m ${secs}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isOnCooldown, lastAttempt]);

  const shuffledQuestions = useMemo(() => {
    if (!questions) return [];
    const ordered = interleaveByType(shuffleArray(questions));
    return ordered.map((q) =>
      q.question_type === 'multiple_choice' && Array.isArray(q.options)
        ? { ...q, options: shuffleArray(q.options as string[]) }
        : q
    );
  }, [questions]);

  const saveMutation = useMutation({
    mutationFn: async (finalAnswers: Answer[]): Promise<GradeResult> => {
      const payload = {
        lessonId,
        answers: finalAnswers.map((a) => ({ questionId: a.questionId, answer: a.rawAnswer })),
        timeTakenSeconds: Math.round((Date.now() - quizStartedAt) / 1000),
      };
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('Your session has expired. Please sign in again.');
      const { data, error } = await supabase.functions.invoke<GradeResult>('grade-quiz', {
        body: payload,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (error) {
        const ctx = (error as unknown as { context?: Response }).context;
        let serverMsg: string | null = null;
        let cooldownMs: number | null = null;
        let status: number | null = null;
        let rawBody: string | null = null;
        if (ctx) {
          status = typeof ctx.status === 'number' ? ctx.status : null;
          try {
            const cloned = typeof ctx.clone === 'function' ? ctx.clone() : ctx;
            rawBody = await cloned.text();
            if (rawBody) {
              try {
                const body = JSON.parse(rawBody) as { error?: string; retryInMs?: number };
                if (body?.error === 'cooldown_active' && typeof body.retryInMs === 'number') {
                  cooldownMs = body.retryInMs;
                } else if (body?.error) {
                  serverMsg = body.error;
                }
              } catch {
                serverMsg = rawBody.slice(0, 200);
              }
            }
          } catch {
            // response body unreadable
          }
        }
        if (cooldownMs !== null) throw new Error(`__COOLDOWN__${cooldownMs}`);
        const statusPart = status !== null ? `[${status}] ` : '';
        throw new Error(statusPart + (serverMsg || error.message || 'Failed to grade quiz'));
      }
      if (!data) throw new Error('Empty response from grader');
      return data;
    },
    onSuccess: (data) => {
      setGradeResult(data);
      queryClient.invalidateQueries({ queryKey: ['mastery'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-cooldown', lessonId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['course-completion'] });
    },
    onError: (err: Error) => {
      if (err.message.startsWith('__COOLDOWN__')) {
        const ms = parseInt(err.message.replace('__COOLDOWN__', ''), 10);
        if (!Number.isNaN(ms)) setServerCooldownMs(ms);
        return;
      }
      setGradeError(err.message);
    },
  });

  const question = shuffledQuestions[currentQ];

  const checkCorrect = (): boolean => {
    if (!question) return false;
    if (question.question_type === 'fill_in') {
      return fillAnswer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim();
    }
    if (question.question_type === 'drag_match') {
      const items = question.options as DragDropItem[];
      return items.every((item) => dragMatches[item.item] === item.match);
    }
    return selectedAnswer === question.correct_answer;
  };

  const canSubmit = (): boolean => {
    if (showResult || !question) return false;
    if (question.question_type === 'fill_in') return fillAnswer.trim().length > 0;
    if (question.question_type === 'drag_match') {
      const items = question.options as DragDropItem[];
      return items.every((item) => dragMatches[item.item]);
    }
    return selectedAnswer !== null;
  };

  const handleSubmit = () => {
    if (!question) return;
    const correct = checkCorrect();
    const rawAnswer: string | Record<string, string> =
      question.question_type === 'fill_in'
        ? fillAnswer
        : question.question_type === 'drag_match'
          ? { ...dragMatches }
          : (selectedAnswer ?? '');
    const display =
      typeof rawAnswer === 'string' ? rawAnswer : JSON.stringify(rawAnswer);
    setShowResult(true);
    setAnswers((prev) => [
      ...prev,
      {
        questionId: question.id,
        correct,
        answer: display,
        rawAnswer,
      },
    ]);
  };

  const handleNext = () => {
    if (currentQ >= shuffledQuestions.length - 1) {
      setQuizDone(true);
      saveMutation.mutate(answers);
    } else {
      setCurrentQ((p) => p + 1);
      setSelectedAnswer(null);
      setFillAnswer('');
      setDragMatches({});
      setShowResult(false);
    }
  };

  if ((isOnCooldown || serverCooldownMs !== null) && !quizDone) {
    const displayMs =
      serverCooldownMs !== null
        ? (() => {
            const mins = Math.floor(serverCooldownMs / 60000);
            const secs = Math.floor((serverCooldownMs % 60000) / 1000);
            return `${mins}m ${secs}s`;
          })()
        : cooldownDisplay;
    return (
      <Screen>
        <View className="px-4 py-6">
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-8 items-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 24,
              elevation: 8,
            }}
          >
            <Clock color="#0B5E8C" size={64} />
            <Text className="text-2xl font-bold text-foreground mt-4 mb-2">Cooldown Active</Text>
            <Text className="text-muted-foreground text-sm text-center mb-4">
              You've already taken this quiz recently. Use this time to review the lesson material before trying again.
            </Text>
            <Text className="text-4xl font-bold text-primary mb-6">{displayMs}</Text>
            <View className="flex-row gap-3">
              <Button variant="secondary" onPress={() => navigation.goBack()}>
                Back to course
              </Button>
              <Button onPress={() => navigation.replace('Lesson', { lessonId })}>
                Review lesson
              </Button>
            </View>
          </MotiView>
        </View>
      </Screen>
    );
  }

  if (!shuffledQuestions.length) {
    return (
      <Screen>
        <View className="px-4 py-6">
          <View className="bg-card rounded-2xl h-64" />
        </View>
      </Screen>
    );
  }

  if (quizDone) {
    if (saveMutation.isPending) {
      return (
        <Screen>
          <View className="px-4 py-6">
            <View className="bg-card rounded-2xl p-8 items-center">
              <Text className="text-base text-muted-foreground">Grading your quiz…</Text>
            </View>
          </View>
        </Screen>
      );
    }
    if (gradeError && !gradeResult) {
      return (
        <Screen>
          <View className="px-4 py-6">
            <View className="bg-card rounded-2xl p-8 items-center gap-4">
              <XCircle color="#EF4444" size={48} />
              <Text className="text-lg font-bold text-foreground">Couldn't record quiz</Text>
              <Text className="text-sm text-muted-foreground text-center">{gradeError}</Text>
              <Button onPress={() => saveMutation.mutate(answers)}>Retry</Button>
              <Button variant="secondary" onPress={() => navigation.goBack()}>Back</Button>
            </View>
          </View>
        </Screen>
      );
    }
    const score = gradeResult?.score ?? 0;
    const total = gradeResult?.total ?? answers.length;
    const pct = gradeResult?.pct ?? 0;
    const serverResults = gradeResult?.results ?? [];
    const isPerfect = total > 0 && score === total;
    const headline =
      pct >= 90 ? '🎉 Amazing!' : pct >= 70 ? '👏 Great job!' : pct >= 50 ? '💪 Good effort!' : '📚 Keep learning!';
    const learnerName =
      profile?.display_name?.trim() ||
      (user?.email ? user.email.split('@')[0] : 'Learner');
    const showCertificate =
      !courseCompletion.isLoading &&
      courseCompletion.isCourseComplete &&
      !!courseCompletion.course;

    return (
      <Screen>
        <View className="px-4 py-6">
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-8 items-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 24,
              elevation: 8,
            }}
          >
            <Trophy color={pct >= 70 ? '#F59E0B' : '#676D76'} size={64} />
            <Text className="text-2xl font-bold text-foreground mt-4 mb-2">{headline}</Text>
            <Text className="text-4xl font-bold text-foreground">
              {score}/{total}
            </Text>
            <Text className="text-muted-foreground text-sm mb-6">{pct}% correct</Text>

            {isPerfect ? (
              <View className="w-full mb-4">
                <Struggalo learnerName={learnerName} variant="defeated" />
              </View>
            ) : pct < 70 ? (
              <View className="w-full mb-4">
                <Struggalo learnerName={learnerName} variant="taunting" />
              </View>
            ) : null}

            <View className="w-full gap-2 mb-6">
              {serverResults.map((r, i) => {
                const q = shuffledQuestions.find((qq) => qq.id === r.questionId);
                return (
                  <View
                    key={i}
                    className={`flex-row items-start gap-2 p-3 rounded-xl ${r.correct ? 'bg-jade/10' : 'bg-destructive/10'}`}
                  >
                    {r.correct ? (
                      <CheckCircle2 color="#2F9950" size={16} />
                    ) : (
                      <XCircle color="#EF4444" size={16} />
                    )}
                    <View className="flex-1">
                      <Text className="text-sm text-foreground">{q?.question_text}</Text>
                      {!r.correct && (
                        <Text className="text-xs text-muted-foreground mt-1">
                          Correct: {r.correctAnswer}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {showCertificate && courseCompletion.course ? (
              <View className="w-full mb-2">
                <LessonCertificate
                  learnerName={learnerName}
                  courseTitle={courseCompletion.course.title}
                  standards={courseCompletion.course.standards_covered}
                />
              </View>
            ) : !isPerfect && courseCompletion.totalLessons > 0 ? (
              <View className="w-full mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <Text className="text-sm font-semibold text-amber-700 mb-1">
                  Score 100% to count toward your certificate
                </Text>
                <Text className="text-xs text-amber-700/80">
                  {courseCompletion.perfectLessons}/{courseCompletion.totalLessons} lessons aced
                  in this course. Retake this quiz in 1 hour to push this lesson to 100%.
                </Text>
              </View>
            ) : null}

            <View className="flex-row items-center gap-1 mb-6">
              <Clock color="#676D76" size={12} />
              <Text className="text-xs text-muted-foreground">
                You can retake this quiz in 1 hour
              </Text>
            </View>

            <View className="flex-row gap-3">
              <Button variant="secondary" onPress={() => navigation.replace('Lesson', { lessonId })}>
                Review lesson
              </Button>
              <Button
                onPress={() =>
                  lesson?.course_id
                    ? navigation.replace('Course', { courseId: lesson.course_id })
                    : navigation.goBack()
                }
                rightIcon={<ArrowRight color="white" size={16} />}
              >
                Continue
              </Button>
            </View>
          </MotiView>
        </View>
      </Screen>
    );
  }

  const progressPct = ((currentQ + 1) / shuffledQuestions.length) * 100;
  const dragItems =
    question.question_type === 'drag_match' ? (question.options as DragDropItem[]) : [];
  const usedMatches = new Set(Object.values(dragMatches));
  const correct = checkCorrect();

  return (
    <Screen>
      <View className="px-4 py-6">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Exit quiz"
          onPress={() => navigation.goBack()}
          className="flex-row items-center gap-1 mb-4 self-start py-2"
        >
          <ArrowLeft color="#676D76" size={16} />
          <Text className="text-sm text-muted-foreground">Exit quiz</Text>
        </Pressable>

        <View className="flex-row items-center justify-between mb-4">
          <View className="bg-muted rounded px-2 py-1">
            <Text className="text-xs text-muted-foreground">{question.standard_code}</Text>
          </View>
          <Text className="text-sm text-muted-foreground">
            {currentQ + 1} / {shuffledQuestions.length}
          </Text>
        </View>

        <View className="h-2 bg-muted rounded-full overflow-hidden mb-6">
          <View
            className="h-full bg-primary rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </View>

        <MotiView
          key={currentQ}
          from={{ opacity: 0, translateX: 20 }}
          animate={{ opacity: 1, translateX: 0 }}
        >
          <View
            className="bg-card rounded-2xl p-6 mb-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <Text className="text-base font-medium text-foreground">{question.question_text}</Text>
          </View>

          {question.question_type === 'multiple_choice' && (
            <View className="gap-2">
              {(question.options as string[]).map((opt, i) => {
                const isSelected = selectedAnswer === opt;
                const isRight = showResult && opt === question.correct_answer;
                const isWrong = showResult && isSelected && !isRight;
                const borderClass = isRight
                  ? 'border-jade bg-jade/10'
                  : isWrong
                    ? 'border-destructive bg-destructive/10'
                    : isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card';
                return (
                  <Pressable
                    key={i}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected, disabled: showResult }}
                    disabled={showResult}
                    onPress={() => setSelectedAnswer(opt)}
                    className={`p-4 rounded-xl border-2 ${borderClass}`}
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        className={`w-7 h-7 rounded-full border-2 items-center justify-center ${
                          isRight
                            ? 'border-jade'
                            : isWrong
                              ? 'border-destructive'
                              : isSelected
                                ? 'border-primary bg-primary'
                                : 'border-gray-300'
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            isRight
                              ? 'text-jade'
                              : isWrong
                                ? 'text-destructive'
                                : isSelected
                                  ? 'text-primary-foreground'
                                  : 'text-muted-foreground'
                          }`}
                        >
                          {isRight ? '✓' : isWrong ? '✗' : String.fromCharCode(65 + i)}
                        </Text>
                      </View>
                      <Text className="text-sm text-foreground flex-1">{opt}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {question.question_type === 'true_false' && (
            <View className="gap-2">
              {['True', 'False'].map((opt) => {
                const isSelected = selectedAnswer === opt;
                const isRight = showResult && opt === question.correct_answer;
                const isWrong = showResult && isSelected && !isRight;
                const borderClass = isRight
                  ? 'border-jade bg-jade/10'
                  : isWrong
                    ? 'border-destructive bg-destructive/10'
                    : isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card';
                return (
                  <Pressable
                    key={opt}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected, disabled: showResult }}
                    disabled={showResult}
                    onPress={() => setSelectedAnswer(opt)}
                    className={`p-4 rounded-xl border-2 ${borderClass}`}
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        className={`w-7 h-7 rounded-full border-2 items-center justify-center ${
                          isRight
                            ? 'border-jade'
                            : isWrong
                              ? 'border-destructive'
                              : isSelected
                                ? 'border-primary bg-primary'
                                : 'border-gray-300'
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            isRight
                              ? 'text-jade'
                              : isWrong
                                ? 'text-destructive'
                                : isSelected
                                  ? 'text-primary-foreground'
                                  : 'text-muted-foreground'
                          }`}
                        >
                          {isRight ? '✓' : isWrong ? '✗' : opt[0]}
                        </Text>
                      </View>
                      <Text className="text-sm text-foreground flex-1">{opt}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {question.question_type === 'fill_in' && (
            <View className="bg-card rounded-xl border-2 border-border p-4">
              <TextInput
                value={fillAnswer}
                onChangeText={setFillAnswer}
                placeholder="Type your answer..."
                placeholderTextColor="#9CA3AF"
                editable={!showResult}
                className={`text-lg text-foreground ${showResult ? (correct ? 'border-jade' : 'border-destructive') : ''}`}
                onSubmitEditing={() => canSubmit() && handleSubmit()}
              />
              {showResult && !correct && (
                <Text className="text-xs text-muted-foreground mt-2">
                  Correct answer: <Text className="font-bold">{question.correct_answer}</Text>
                </Text>
              )}
            </View>
          )}

          {question.question_type === 'drag_match' && (
            <View className="gap-3">
              {dragItems.map((item) => (
                <View key={item.item} className="bg-card rounded-xl border-2 border-border p-4">
                  <Text className="font-medium text-sm text-foreground mb-2">{item.item}</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {dragItems.map((m) => {
                      const isChosen = dragMatches[item.item] === m.match;
                      const isUsed = usedMatches.has(m.match) && !isChosen;
                      const isRightMatch = showResult && m.match === item.match;
                      const isWrongMatch = showResult && isChosen && m.match !== item.match;
                      const pillClass = isRightMatch && isChosen
                        ? 'bg-jade/10 border-jade'
                        : isWrongMatch
                          ? 'bg-destructive/10 border-destructive'
                          : isChosen
                            ? 'bg-primary/10 border-primary'
                            : isUsed
                              ? 'border-border opacity-30'
                              : 'border-border';
                      return (
                        <Pressable
                          key={m.match}
                          disabled={showResult || (isUsed && !isChosen)}
                          onPress={() =>
                            setDragMatches((prev) => ({
                              ...prev,
                              [item.item]: isChosen ? '' : m.match,
                            }))
                          }
                          className={`px-3 py-1.5 rounded-lg border ${pillClass}`}
                        >
                          <Text className="text-xs text-foreground">{m.match}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          )}

          <AnimatePresence>
            {showResult && (
              <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                className={`mt-4 p-4 rounded-xl ${correct ? 'bg-jade/10 border border-jade/20' : 'bg-destructive/10 border border-destructive/20'}`}
              >
                <View className="flex-row items-center gap-2 mb-1">
                  {correct ? (
                    <>
                      <CheckCircle2 color="#2F9950" size={20} />
                      <Text className="font-semibold text-jade">Correct! 🎉</Text>
                    </>
                  ) : (
                    <>
                      <XCircle color="#EF4444" size={20} />
                      <Text className="font-semibold text-destructive">Not quite 😅</Text>
                    </>
                  )}
                </View>
                {question.explanation && (
                  <Text className="text-sm text-foreground/80">{question.explanation}</Text>
                )}
              </MotiView>
            )}
          </AnimatePresence>

          <View className="flex-row justify-end mt-6">
            {!showResult ? (
              <Button onPress={handleSubmit} disabled={!canSubmit()}>
                Check Answer
              </Button>
            ) : (
              <Button
                onPress={handleNext}
                rightIcon={<ArrowRight color="white" size={16} />}
              >
                {currentQ >= shuffledQuestions.length - 1 ? 'See Results' : 'Next Question'}
              </Button>
            )}
          </View>
        </MotiView>
      </View>
    </Screen>
  );
}

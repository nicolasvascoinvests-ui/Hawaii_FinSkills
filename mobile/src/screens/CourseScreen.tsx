import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  PlayCircle,
  RefreshCw,
  Award,
} from 'lucide-react-native';
import Screen from '../components/Screen';
import { supabase } from '../lib/supabase';
import { THEMES } from '../lib/standards';
import { useAuth } from '../hooks/useAuth';
import type { Course, Lesson, UserProgress } from '../types/database';
import type { RootStackScreenProps } from '../navigation/types';

interface QuizCountRow {
  lesson_id: string;
}

interface AttemptRow {
  lesson_id: string;
  score: number;
  total_questions: number;
}

type LessonCertStatus = 'aced' | 'needs_100' | 'in_progress' | 'not_started';

export default function CourseScreen({ route, navigation }: RootStackScreenProps<'Course'>) {
  const { courseId } = route.params;
  const { user } = useAuth();

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data } = await supabase.from('courses').select('*').eq('id', courseId).single();
      return data as Course;
    },
  });

  const { data: lessons } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: async () => {
      const { data } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');
      return (data ?? []) as Lesson[];
    },
  });

  const lessonIds = lessons?.map((l) => l.id) ?? [];

  const { data: progress } = useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: async () => {
      if (!user) return [] as UserProgress[];
      const { data } = await supabase.from('user_progress').select('*').eq('user_id', user.id);
      return (data ?? []) as UserProgress[];
    },
    enabled: !!user,
  });

  const { data: quizCounts } = useQuery({
    queryKey: ['lesson-quiz-counts', courseId],
    enabled: lessonIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from('quiz_questions')
        .select('lesson_id')
        .in('lesson_id', lessonIds);
      const counts = new Map<string, number>();
      for (const row of (data ?? []) as QuizCountRow[]) {
        counts.set(row.lesson_id, (counts.get(row.lesson_id) ?? 0) + 1);
      }
      return counts;
    },
  });

  const { data: bestScores } = useQuery({
    queryKey: ['lesson-best-scores', courseId, user?.id],
    enabled: !!user && lessonIds.length > 0,
    queryFn: async () => {
      if (!user) return new Map<string, number>();
      const { data } = await supabase
        .from('quiz_attempts')
        .select('lesson_id, score, total_questions')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds);
      const best = new Map<string, number>();
      for (const a of (data ?? []) as AttemptRow[]) {
        if (a.total_questions <= 0) continue;
        const pct = a.score / a.total_questions;
        const prev = best.get(a.lesson_id) ?? 0;
        if (pct > prev) best.set(a.lesson_id, pct);
      }
      return best;
    },
  });

  const themeData = THEMES.find((t) => t.key === course?.theme);

  const getLessonCertStatus = (
    lessonId: string,
  ): { status: LessonCertStatus; bestPct: number | null } => {
    const status = progress?.find((p) => p.lesson_id === lessonId)?.status ?? 'not_started';
    const hasQuiz = (quizCounts?.get(lessonId) ?? 0) > 0;
    const best = bestScores?.get(lessonId);
    const bestPct = best !== undefined ? Math.round(best * 100) : null;

    if (hasQuiz) {
      if ((best ?? 0) >= 1) return { status: 'aced', bestPct: 100 };
      if (best !== undefined) return { status: 'needs_100', bestPct };
      if (status === 'in_progress' || status === 'completed')
        return { status: 'in_progress', bestPct: null };
      return { status: 'not_started', bestPct: null };
    }
    if (status === 'completed') return { status: 'aced', bestPct: null };
    if (status === 'in_progress') return { status: 'in_progress', bestPct: null };
    return { status: 'not_started', bestPct: null };
  };

  const lessonStatuses =
    lessons?.map((l) => ({ lesson: l, ...getLessonCertStatus(l.id) })) ?? [];
  const acedCount = lessonStatuses.filter((s) => s.status === 'aced').length;
  const blockers = lessonStatuses.filter((s) => s.status !== 'aced');
  const totalLessons = lessons?.length ?? 0;
  const certificateReady = totalLessons > 0 && acedCount >= totalLessons;

  const describeBlocker = (b: (typeof lessonStatuses)[number]): string => {
    if (b.status === 'needs_100' && b.bestPct !== null)
      return `${b.lesson.title} (best ${b.bestPct}%)`;
    if (b.status === 'in_progress') return `${b.lesson.title} (quiz not taken)`;
    return `${b.lesson.title} (not started)`;
  };

  const blockerSummary =
    blockers.length === 0
      ? null
      : blockers.length === 1
        ? `Still need: ${describeBlocker(blockers[0])}`
        : blockers.length === 2
          ? `Still need: ${describeBlocker(blockers[0])} · ${describeBlocker(blockers[1])}`
          : `Still need ${blockers.length} lessons — see list below`;

  if (!course) {
    return (
      <Screen>
        <View className="px-4 py-6 gap-3">
          {[1, 2, 3].map((i) => (
            <View key={i} className="bg-card rounded-2xl h-20" />
          ))}
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="px-4 py-6">
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to courses"
            onPress={() => navigation.goBack()}
            className="flex-row items-center gap-1 mb-4 self-start py-2"
          >
            <ArrowLeft color="#676D76" size={16} />
            <Text className="text-sm text-muted-foreground">Back to courses</Text>
          </Pressable>

          <LinearGradient
            colors={[themeData?.gradientFrom ?? '#0B5E8C', themeData?.gradientTo ?? '#08486B']}
            style={{ borderRadius: 20, padding: 24, marginBottom: 16 }}
          >
            <Text className="text-3xl mb-2">{themeData?.icon}</Text>
            <Text className="text-2xl font-bold text-white">{course.title}</Text>
            <Text className="text-white/80 text-sm mt-1">{course.description}</Text>
            <View className="flex-row flex-wrap gap-1.5 mt-3">
              {course.standards_covered?.map((code) => (
                <View key={code} className="bg-white/20 rounded-full px-2 py-0.5">
                  <Text className="text-xs text-white">{code}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </MotiView>

        {totalLessons > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 80 }}
          >
            <View
              className={`rounded-2xl p-4 mb-5 flex-row items-center gap-3 ${
                certificateReady
                  ? 'bg-amber-50 border-2 border-amber-500/40'
                  : 'bg-primary/5 border border-primary/20'
              }`}
            >
              <View
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  certificateReady ? 'bg-amber-500/20' : 'bg-primary/10'
                }`}
              >
                <Award color={certificateReady ? '#D97706' : '#0B5E8C'} size={20} />
              </View>
              <View className="flex-1">
                <Text
                  className={`text-sm font-semibold ${
                    certificateReady ? 'text-amber-700' : 'text-foreground'
                  }`}
                >
                  {certificateReady
                    ? 'Certificate ready — finish any lesson to claim it'
                    : `${acedCount}/${totalLessons} lessons aced (100%)`}
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  {certificateReady
                    ? 'Reopen any lesson to view and download your PDF.'
                    : (blockerSummary ?? 'Score 100% on every quiz to unlock your course certificate.')}
                </Text>
              </View>
            </View>
          </MotiView>
        )}

        <Text className="font-semibold text-foreground mb-3">Lessons</Text>
        <View className="gap-2">
          {lessons?.map((lesson, i) => {
            const { status: certStatus, bestPct } = getLessonCertStatus(lesson.id);
            const isAced = certStatus === 'aced';
            const needs100 = certStatus === 'needs_100';
            const inProgress = certStatus === 'in_progress';

            const labelText =
              certStatus === 'aced'
                ? '100% — counts toward certificate'
                : certStatus === 'needs_100'
                  ? `Best ${bestPct}% — retake quiz for 100%`
                  : certStatus === 'in_progress'
                    ? 'Quiz not yet taken — score 100% to unlock certificate'
                    : 'Not started';

            const labelColor = isAced
              ? 'text-jade'
              : needs100
                ? 'text-amber-600'
                : inProgress
                  ? 'text-primary'
                  : 'text-muted-foreground';

            const badgeBg = isAced
              ? 'bg-jade/10'
              : needs100
                ? 'bg-amber-500/15'
                : inProgress
                  ? 'bg-primary/10'
                  : 'bg-muted';

            const scoreChipText = isAced
              ? '100%'
              : needs100 && bestPct !== null
                ? `${bestPct}%`
                : inProgress
                  ? 'Quiz'
                  : 'Start';

            const scoreChipClass = isAced
              ? 'bg-jade/15 text-jade'
              : needs100
                ? 'bg-amber-500/20 text-amber-700'
                : inProgress
                  ? 'bg-primary/15 text-primary'
                  : 'bg-muted text-muted-foreground';

            const a11yState = isAced
              ? ', aced at 100 percent, counts toward certificate'
              : needs100
                ? `, best score ${bestPct} percent, retake the quiz to earn certificate credit`
                : inProgress
                  ? ', in progress, quiz not yet completed'
                  : ', not started';

            return (
              <MotiView
                key={lesson.id}
                from={{ opacity: 0, translateX: -10 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: i * 60 }}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Lesson ${i + 1}: ${lesson.title}${a11yState}`}
                  onPress={() => navigation.navigate('Lesson', { lessonId: lesson.id })}
                  className={`bg-card rounded-xl p-4 flex-row items-center gap-4 ${
                    needs100 ? 'border border-amber-500/30' : ''
                  }`}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.06,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                >
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${badgeBg}`}
                  >
                    {isAced ? (
                      <CheckCircle2 color="#2F9950" size={20} />
                    ) : needs100 ? (
                      <RefreshCw color="#D97706" size={18} />
                    ) : (
                      <Text
                        className={`text-sm font-bold ${
                          inProgress ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        {i + 1}
                      </Text>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-card-foreground text-sm">{lesson.title}</Text>
                    <Text className={`text-xs mt-0.5 font-medium ${labelColor}`}>{labelText}</Text>
                    <View className="flex-row flex-wrap gap-1 mt-1">
                      {lesson.standards_covered?.map((code) => (
                        <View key={code} className="bg-muted rounded px-1.5 py-0.5">
                          <Text className="text-[10px] text-muted-foreground">{code}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View className="items-end gap-1">
                    <View className={`rounded-full px-2 py-0.5 ${scoreChipClass.split(' ')[0]}`}>
                      <Text className={`text-[10px] font-bold ${scoreChipClass.split(' ')[1]}`}>
                        {scoreChipText}
                      </Text>
                    </View>
                    <PlayCircle
                      color={isAced ? '#2F9950' : needs100 ? '#D97706' : '#0B5E8C'}
                      size={20}
                    />
                  </View>
                </Pressable>
              </MotiView>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

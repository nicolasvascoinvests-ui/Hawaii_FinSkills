import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface CourseCompletionState {
  course: { id: string; title: string; standards_covered: string[] } | null;
  totalLessons: number;
  perfectLessons: number;
  isCourseComplete: boolean;
  isLoading: boolean;
}

interface LessonRow {
  id: string;
  course_id: string;
  quiz_questions: { count: number }[];
}

interface AttemptRow {
  lesson_id: string;
  score: number;
  total_questions: number;
}

interface ProgressRow {
  lesson_id: string;
  status: string;
}

export function useCourseCompletion(courseId: string | null | undefined): CourseCompletionState {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['course-completion', courseId, user?.id],
    enabled: !!courseId && !!user,
    queryFn: async () => {
      if (!courseId || !user) return null;

      const { data: course } = await supabase
        .from('courses')
        .select('id, title, standards_covered')
        .eq('id', courseId)
        .single();

      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, course_id, quiz_questions(count)')
        .eq('course_id', courseId);

      const lessonRows = (lessons ?? []) as LessonRow[];
      const lessonIds = lessonRows.map((l) => l.id);

      if (lessonIds.length === 0) {
        return { course, totalLessons: 0, perfectLessons: 0 };
      }

      const [{ data: attempts }, { data: progress }] = await Promise.all([
        supabase
          .from('quiz_attempts')
          .select('lesson_id, score, total_questions')
          .eq('user_id', user.id)
          .in('lesson_id', lessonIds),
        supabase
          .from('user_progress')
          .select('lesson_id, status')
          .eq('user_id', user.id)
          .in('lesson_id', lessonIds),
      ]);

      const bestScoreByLesson = new Map<string, number>();
      for (const a of (attempts ?? []) as AttemptRow[]) {
        if (a.total_questions <= 0) continue;
        const pct = a.score / a.total_questions;
        const prev = bestScoreByLesson.get(a.lesson_id) ?? 0;
        if (pct > prev) bestScoreByLesson.set(a.lesson_id, pct);
      }

      const completedSet = new Set(
        ((progress ?? []) as ProgressRow[])
          .filter((p) => p.status === 'completed')
          .map((p) => p.lesson_id),
      );

      let perfectLessons = 0;
      for (const lesson of lessonRows) {
        const hasQuiz = (lesson.quiz_questions?.[0]?.count ?? 0) > 0;
        if (hasQuiz) {
          if ((bestScoreByLesson.get(lesson.id) ?? 0) >= 1) perfectLessons += 1;
        } else if (completedSet.has(lesson.id)) {
          perfectLessons += 1;
        }
      }

      return { course, totalLessons: lessonRows.length, perfectLessons };
    },
  });

  const totalLessons = data?.totalLessons ?? 0;
  const perfectLessons = data?.perfectLessons ?? 0;
  return {
    course: data?.course ?? null,
    totalLessons,
    perfectLessons,
    isCourseComplete: totalLessons > 0 && perfectLessons >= totalLessons,
    isLoading,
  };
}

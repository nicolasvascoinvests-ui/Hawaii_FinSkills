import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, CheckCircle2, BookOpen, Brain } from 'lucide-react-native';
import Screen from '../components/Screen';
import Button from '../components/Button';
import LessonCertificate from '../components/LessonCertificate';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useCourseCompletion } from '../hooks/useCourseCompletion';
import type { Lesson, LessonSection, QuizQuestion } from '../types/database';
import type { RootStackScreenProps } from '../navigation/types';

export default function LessonScreen({ route, navigation }: RootStackScreenProps<'Lesson'>) {
  const { lessonId } = route.params;
  const { user } = useAuth();
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const [currentSection, setCurrentSection] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);

  const { data: lesson } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const { data } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();
      return data as Lesson;
    },
  });

  const courseCompletion = useCourseCompletion(lesson?.course_id ?? null);

  const { data: quizQuestions } = useQuery({
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

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!user || !lessonId) return;
      const { data: existing } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('user_progress')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase.from('user_progress').insert({
          user_id: user.id,
          lesson_id: lessonId,
          status: 'completed',
          completed_at: new Date().toISOString(),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
      queryClient.invalidateQueries({ queryKey: ['course-completion'] });
    },
  });

  const sections: LessonSection[] = lesson?.content?.sections ?? [];
  const isLastSection = currentSection >= sections.length - 1;
  const hasQuiz = (quizQuestions?.length ?? 0) > 0;

  const handleNext = () => {
    if (isLastSection) {
      completeMutation.mutate();
      if (hasQuiz) {
        navigation.replace('Quiz', { lessonId });
      } else {
        setShowCertificate(true);
      }
    } else {
      setCurrentSection((p) => p + 1);
    }
  };

  if (!lesson || sections.length === 0) {
    return (
      <Screen>
        <View className="px-4 py-6">
          <View className="bg-card rounded-2xl h-64" />
        </View>
      </Screen>
    );
  }

  if (showCertificate) {
    const learnerName =
      profile?.display_name?.trim() ||
      (user?.email ? user.email.split('@')[0] : 'Learner');
    const courseDone =
      !courseCompletion.isLoading &&
      courseCompletion.isCourseComplete &&
      !!courseCompletion.course;
    const headline = courseDone ? 'Course complete!' : 'Lesson complete!';
    const subline = courseDone
      ? `You finished every lesson in ${courseCompletion.course?.title ?? 'this course'}. Here's your certificate.`
      : `${courseCompletion.perfectLessons}/${courseCompletion.totalLessons} lessons done at 100% — keep going to earn your certificate.`;
    return (
      <Screen>
        <View className="px-4 py-6">
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-6 items-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 24,
              elevation: 6,
            }}
          >
            <Text className="text-2xl font-bold text-foreground mb-1 text-center">
              {headline}
            </Text>
            <Text className="text-sm text-muted-foreground mb-6 text-center">
              {subline}
            </Text>
            {courseDone && courseCompletion.course ? (
              <LessonCertificate
                learnerName={learnerName}
                courseTitle={courseCompletion.course.title}
                standards={courseCompletion.course.standards_covered}
              />
            ) : null}
            <Button
              onPress={() => navigation.goBack()}
              rightIcon={<ArrowRight color="white" size={16} />}
            >
              Continue
            </Button>
          </MotiView>
        </View>
      </Screen>
    );
  }

  const section = sections[currentSection];
  const sectionStyle =
    section.type === 'example'
      ? 'bg-amber-500/10 border border-amber-500/20'
      : section.type === 'tip'
        ? 'bg-jade/10 border border-jade/20'
        : 'bg-card';

  return (
    <Screen>
      <View className="px-4 py-6">
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to course"
            onPress={() => navigation.goBack()}
            className="flex-row items-center gap-1 mb-4 self-start py-2"
          >
            <ArrowLeft color="#676D76" size={16} />
            <Text className="text-sm text-muted-foreground">Back to course</Text>
          </Pressable>
          <Text className="text-xl font-bold text-foreground mb-1">{lesson.title}</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {lesson.standards_covered?.map((code) => (
              <View key={code} className="bg-primary/10 rounded-full px-2 py-0.5">
                <Text className="text-xs text-primary">{code}</Text>
              </View>
            ))}
          </View>
        </MotiView>

        <View className="flex-row gap-1.5 mb-6">
          {sections.map((_, i) => (
            <View
              key={i}
              className={`h-1.5 rounded-full ${
                i === currentSection
                  ? 'bg-primary'
                  : i < currentSection
                    ? 'bg-jade'
                    : 'bg-muted'
              }`}
              style={{ flex: i === currentSection ? 2 : 1 }}
            />
          ))}
        </View>

        <AnimatePresence>
          <MotiView
            key={currentSection}
            from={{ opacity: 0, translateX: 30 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -30 }}
            className="mb-8"
          >
            <View className={`rounded-2xl p-6 ${sectionStyle}`}>
              <View className="flex-row items-center gap-2 mb-3">
                {section.type === 'example' && <Text className="text-lg">💡</Text>}
                {section.type === 'tip' && <Text className="text-lg">✅</Text>}
                {section.type === 'text' && <BookOpen color="#0B5E8C" size={16} />}
                <Text className="font-semibold text-foreground">{section.title}</Text>
              </View>
              <Text className="text-base text-foreground/90 leading-6">{section.body}</Text>
            </View>
          </MotiView>
        </AnimatePresence>

        <View className="flex-row items-center justify-between">
          <Button
            variant="ghost"
            onPress={() => setCurrentSection((p) => Math.max(0, p - 1))}
            disabled={currentSection === 0}
            leftIcon={<ArrowLeft color="#1B2633" size={16} />}
          >
            Previous
          </Button>
          <Text className="text-xs text-muted-foreground">
            {currentSection + 1} / {sections.length}
          </Text>
          <Button
            onPress={handleNext}
            variant={isLastSection && hasQuiz ? 'coral' : 'primary'}
            rightIcon={
              isLastSection ? (
                hasQuiz ? (
                  <Brain color="white" size={16} />
                ) : (
                  <CheckCircle2 color="white" size={16} />
                )
              ) : (
                <ArrowRight color="white" size={16} />
              )
            }
          >
            {isLastSection ? (hasQuiz ? 'Take Quiz' : 'Complete') : 'Next'}
          </Button>
        </View>
      </View>
    </Screen>
  );
}

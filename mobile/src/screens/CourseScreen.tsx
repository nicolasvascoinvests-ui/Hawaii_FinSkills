import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, PlayCircle } from 'lucide-react-native';
import Screen from '../components/Screen';
import { supabase } from '../lib/supabase';
import { THEMES } from '../lib/standards';
import { useAuth } from '../hooks/useAuth';
import type { Course, Lesson, UserProgress } from '../types/database';
import type { RootStackScreenProps } from '../navigation/types';

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

  const { data: progress } = useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: async () => {
      if (!user) return [] as UserProgress[];
      const { data } = await supabase.from('user_progress').select('*').eq('user_id', user.id);
      return (data ?? []) as UserProgress[];
    },
    enabled: !!user,
  });

  const themeData = THEMES.find((t) => t.key === course?.theme);
  const getLessonStatus = (lessonId: string) =>
    progress?.find((p) => p.lesson_id === lessonId)?.status ?? 'not_started';

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
            style={{ borderRadius: 20, padding: 24, marginBottom: 24 }}
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

        <Text className="font-semibold text-foreground mb-3">Lessons</Text>
        <View className="gap-2">
          {lessons?.map((lesson, i) => {
            const isCompleted = getLessonStatus(lesson.id) === 'completed';
            return (
              <MotiView
                key={lesson.id}
                from={{ opacity: 0, translateX: -10 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: i * 60 }}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Lesson ${i + 1}: ${lesson.title}${isCompleted ? ', completed' : ''}`}
                  onPress={() => navigation.navigate('Lesson', { lessonId: lesson.id })}
                  className="bg-card rounded-xl p-4 flex-row items-center gap-4"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.06,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                >
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${isCompleted ? 'bg-jade/10' : 'bg-muted'}`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 color="#2F9950" size={20} />
                    ) : (
                      <Text className="text-sm font-bold text-muted-foreground">{i + 1}</Text>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-card-foreground text-sm">{lesson.title}</Text>
                    <View className="flex-row flex-wrap gap-1 mt-1">
                      {lesson.standards_covered?.map((code) => (
                        <View key={code} className="bg-muted rounded px-1.5 py-0.5">
                          <Text className="text-[10px] text-muted-foreground">{code}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <PlayCircle color={isCompleted ? '#2F9950' : '#0B5E8C'} size={20} />
                </Pressable>
              </MotiView>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

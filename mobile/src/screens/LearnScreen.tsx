import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ArrowRight, Clock, Target } from 'lucide-react-native';
import Screen from '../components/Screen';
import { supabase } from '../lib/supabase';
import { THEMES } from '../lib/standards';
import { useMastery } from '../hooks/useMastery';
import type { Course, Lesson } from '../types/database';
import type { MainTabScreenProps } from '../navigation/types';

export default function LearnScreen({ route, navigation }: MainTabScreenProps<'Learn'>) {
  const standardFilter = route.params?.standard;
  const [themeFilter, setThemeFilter] = useState<string | null>(null);
  const { getCourseProgress } = useMastery();

  useEffect(() => {
    if (standardFilter) {
      const theme = THEMES.find((t) => t.standards.some((s) => s.code === standardFilter));
      if (theme) setThemeFilter(theme.key);
    }
  }, [standardFilter]);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data } = await supabase.from('courses').select('*');
      return (data ?? []) as Course[];
    },
  });

  const { data: lessons } = useQuery({
    queryKey: ['all-lessons'],
    queryFn: async () => {
      const { data } = await supabase.from('lessons').select('*').order('order_index');
      return (data ?? []) as Lesson[];
    },
  });

  let filteredCourses = themeFilter ? courses?.filter((c) => c.theme === themeFilter) : courses;
  if (standardFilter) {
    filteredCourses = filteredCourses?.filter((c) => c.standards_covered?.includes(standardFilter));
  }

  const getThemeData = (theme: string) => THEMES.find((t) => t.key === theme);
  const getLessonCount = (courseId: string) =>
    lessons?.filter((l) => l.course_id === courseId).length ?? 0;

  return (
    <Screen>
      <View className="px-4 py-6">
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }}>
          <Text className="text-2xl font-bold text-foreground mb-1">Learn</Text>
          <Text className="text-muted-foreground text-sm mb-4">
            {standardFilter
              ? `Showing courses for standard ${standardFilter}`
              : 'Explore courses to master financial literacy standards.'}
          </Text>

          {standardFilter && (
            <Pressable
              onPress={() => {
                navigation.setParams({ standard: undefined });
                setThemeFilter(null);
              }}
              className="mb-3 flex-row items-center gap-1"
            >
              <Target color="#0B5E8C" size={12} />
              <Text className="text-xs text-primary">Clear standard filter</Text>
            </Pressable>
          )}
        </MotiView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 4, gap: 8 }}
          className="mb-4"
        >
          <Pressable
            onPress={() => setThemeFilter(null)}
            className={`px-3 py-1.5 rounded-full ${!themeFilter ? 'bg-primary' : 'bg-muted'}`}
          >
            <Text
              className={`text-xs font-medium ${!themeFilter ? 'text-primary-foreground' : 'text-muted-foreground'}`}
            >
              All
            </Text>
          </Pressable>
          {THEMES.map((t) => (
            <Pressable
              key={t.key}
              onPress={() => setThemeFilter(t.key)}
              className={`px-3 py-1.5 rounded-full ${themeFilter === t.key ? 'bg-primary' : 'bg-muted'}`}
            >
              <Text
                className={`text-xs font-medium ${themeFilter === t.key ? 'text-primary-foreground' : 'text-muted-foreground'}`}
              >
                {t.icon} {t.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {isLoading ? (
          <View className="gap-3">
            {[1, 2, 3].map((i) => (
              <View key={i} className="bg-card rounded-2xl h-32" />
            ))}
          </View>
        ) : (
          <View className="gap-3">
            {filteredCourses?.map((course, i) => {
              const themeData = getThemeData(course.theme);
              const lessonCount = getLessonCount(course.id);
              const prog = getCourseProgress(course.standards_covered ?? []);
              return (
                <MotiView
                  key={course.id}
                  from={{ opacity: 0, translateY: 10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: i * 80 }}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${course.title}, ${lessonCount} lessons`}
                    onPress={() => navigation.navigate('Course', { courseId: course.id })}
                    className="bg-card rounded-2xl overflow-hidden"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.06,
                      shadowRadius: 3,
                      elevation: 2,
                    }}
                  >
                    {themeData && (
                      <LinearGradient
                        colors={[themeData.gradientFrom, themeData.gradientTo]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ height: 6 }}
                      />
                    )}
                    <View className="p-5 flex-row items-start gap-4">
                      {themeData && (
                        <LinearGradient
                          colors={[themeData.gradientFrom, themeData.gradientTo]}
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text className="text-xl">{themeData.icon}</Text>
                        </LinearGradient>
                      )}
                      <View className="flex-1">
                        <Text className="font-semibold text-card-foreground">{course.title}</Text>
                        <Text className="text-sm text-muted-foreground mt-0.5" numberOfLines={2}>
                          {course.description}
                        </Text>
                        <View className="flex-row items-center gap-3 mt-3">
                          <View className="flex-row items-center gap-1">
                            <BookOpen color="#676D76" size={14} />
                            <Text className="text-xs text-muted-foreground">
                              {lessonCount} lessons
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-1">
                            <Clock color="#676D76" size={14} />
                            <Text className="text-xs text-muted-foreground">
                              ~{lessonCount * 5} min
                            </Text>
                          </View>
                          <Text
                            className={`text-xs font-medium ${
                              prog.total === 0
                                ? 'text-muted-foreground'
                                : prog.mastered >= prog.total
                                  ? 'text-jade'
                                  : prog.mastered > 0
                                    ? 'text-amber-600'
                                    : 'text-muted-foreground'
                            }`}
                          >
                            {prog.mastered}/{prog.total} mastered
                            {prog.total > 0 && prog.mastered < prog.total ? ' — keep going' : ''}
                          </Text>
                        </View>
                      </View>
                      <ArrowRight color="#676D76" size={16} />
                    </View>
                  </Pressable>
                </MotiView>
              );
            })}
          </View>
        )}
      </View>
    </Screen>
  );
}

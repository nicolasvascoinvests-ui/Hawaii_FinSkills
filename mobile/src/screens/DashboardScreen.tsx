import { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Zap, Sparkles, Trophy, Star, Flame } from 'lucide-react-native';
import Screen from '../components/Screen';
import ProgressRing from '../components/ProgressRing';
import StruggaloMeter from '../components/StruggaloMeter';
import { THEMES } from '../lib/standards';
import { useMastery } from '../hooks/useMastery';
import { useProfile } from '../hooks/useProfile';
import { supabase } from '../lib/supabase';
import type { Course } from '../types/database';
import type { MainTabScreenProps } from '../navigation/types';

const DAILY_QUESTIONS = [
  {
    q: "What's the difference between gross and net pay?",
    a: 'Gross pay is before deductions; net pay is your take-home amount.',
    standard: 'EI-1',
  },
  {
    q: 'What does the 50/30/20 budget rule suggest?',
    a: '50% needs, 30% wants, 20% savings and debt repayment.',
    standard: 'SP-2',
  },
  {
    q: 'Why is compound interest more powerful than simple interest?',
    a: 'It earns interest on both principal AND accumulated interest.',
    standard: 'SV-3',
  },
];

const ENCOURAGEMENTS = [
  'You got this! 🤙',
  'Keep grinding! 💪',
  'Mahalo for learning! 🌺',
  'Level up! 🚀',
];

export default function DashboardScreen({ navigation }: MainTabScreenProps<'Dashboard'>) {
  const { masteredCount, totalStandards, getThemeProgress } = useMastery();
  const { profile } = useProfile();

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data } = await supabase.from('courses').select('*');
      return (data ?? []) as Course[];
    },
  });

  const dailyQuestion = useMemo(() => {
    const idx = new Date().getDate() % DAILY_QUESTIONS.length;
    return DAILY_QUESTIONS[idx];
  }, []);

  const encouragement = useMemo(
    () => ENCOURAGEMENTS[new Date().getDate() % ENCOURAGEMENTS.length],
    []
  );

  const progressPercent = totalStandards > 0 ? (masteredCount / totalStandards) * 100 : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const level = masteredCount >= 15 ? 'Pro' : masteredCount >= 5 ? 'Rising' : 'Rookie';

  return (
    <Screen>
      <View className="px-4 py-6">
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
        >
          <View className="flex-row items-center gap-2">
            <Text className="text-2xl font-bold text-foreground">
              {getGreeting()}
              {profile?.display_name ? `, ${profile.display_name}` : ''}! 🌺
            </Text>
          </View>
          <Text className="text-muted-foreground text-sm">{encouragement}</Text>
        </MotiView>

        <View className="mt-5">
          <StruggaloMeter />
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 50 }}
          className="flex-row gap-3 mb-5"
        >
          <View className="flex-1 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex-row items-center gap-3">
            <Flame color="#F59E0B" size={24} />
            <View>
              <Text className="text-xs font-semibold text-amber-600 uppercase">Streak</Text>
              <Text className="text-lg font-bold text-foreground">1 day</Text>
            </View>
          </View>
          <View className="flex-1 bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 flex-row items-center gap-3">
            <Star color="#A855F7" size={24} />
            <View>
              <Text className="text-xs font-semibold text-purple-600 uppercase">Level</Text>
              <Text className="text-lg font-bold text-foreground">{level}</Text>
            </View>
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100 }}
          className="bg-card rounded-2xl p-6 mb-6 items-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <View className="flex-row items-center gap-2 mb-4">
            <Trophy color="#F59E0B" size={16} />
            <Text className="text-sm font-medium text-muted-foreground">Your PTP Progress</Text>
          </View>
          <ProgressRing percentage={progressPercent} size={160} strokeWidth={12}>
            <Text className="text-3xl font-bold text-foreground">{masteredCount}</Text>
            <Text className="text-muted-foreground text-sm">of {totalStandards}</Text>
          </ProgressRing>
          <Text className="text-sm font-medium text-foreground mt-4">Standards Mastered</Text>
          <Text className="text-xs text-muted-foreground mt-1">
            {masteredCount === 0
              ? 'Start learning to track your progress! 🏁'
              : `${Math.round(progressPercent)}% complete — keep going! 🔥`}
          </Text>
        </MotiView>

        <View className="flex-row items-center gap-2 mb-3">
          <Text className="font-semibold text-foreground">Learning Themes</Text>
          <View className="bg-muted rounded-full px-2 py-0.5">
            <Text className="text-xs text-muted-foreground">{THEMES.length} themes</Text>
          </View>
        </View>

        <View className="flex-row flex-wrap -mx-1.5 mb-6">
          {THEMES.map((theme, i) => {
            const prog = getThemeProgress(theme.key);
            const pct = prog.total > 0 ? (prog.mastered / prog.total) * 100 : 0;
            return (
              <MotiView
                key={theme.key}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 200 + i * 60, type: 'spring' }}
                style={{ width: '50%', paddingHorizontal: 6, marginBottom: 12 }}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${theme.label}: ${prog.mastered} of ${prog.total} standards mastered`}
                  onPress={() => navigation.navigate('Learn', { standard: undefined })}
                >
                  <LinearGradient
                    colors={[theme.gradientFrom, theme.gradientTo]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ borderRadius: 20, padding: 16 }}
                  >
                    <Text className="text-2xl">{theme.icon}</Text>
                    <Text className="font-bold text-sm text-white mt-2">{theme.label}</Text>
                    <Text className="text-xs text-white/70">{theme.hawaiian}</Text>
                    <View className="mt-3">
                      <View className="flex-row justify-between mb-1">
                        <Text className="text-xs text-white/80">
                          {prog.mastered}/{prog.total}
                        </Text>
                        <Text className="text-xs text-white/80">{Math.round(pct)}%</Text>
                      </View>
                      <View className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-white/80 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </View>
                    </View>
                  </LinearGradient>
                </Pressable>
              </MotiView>
            );
          })}
        </View>

        {courses && courses.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continue learning"
            onPress={() => navigation.navigate('Learn')}
            className="mb-4"
          >
            <LinearGradient
              colors={['#0B5E8C', '#08486B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 20 }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center gap-1">
                    <Sparkles color="white" size={12} />
                    <Text className="text-white/70 text-xs font-medium uppercase">
                      Continue Learning
                    </Text>
                  </View>
                  <Text className="text-white font-semibold mt-1">{courses[0].title}</Text>
                  <Text className="text-white/70 text-sm mt-0.5" numberOfLines={1}>
                    {courses[0].description?.slice(0, 60)}…
                  </Text>
                </View>
                <ArrowRight color="white" size={20} />
              </View>
            </LinearGradient>
          </Pressable>
        )}

        <View className="bg-coral/10 border border-coral/20 rounded-2xl p-5">
          <View className="flex-row items-center gap-2 mb-2">
            <Zap color="#FF6B4A" size={16} />
            <Text className="text-xs font-semibold text-coral uppercase">Daily Challenge</Text>
            <View className="ml-auto bg-coral/20 rounded-full px-2 py-0.5">
              <Text className="text-xs font-bold text-coral">{dailyQuestion.standard}</Text>
            </View>
          </View>
          <Text className="font-medium text-card-foreground text-sm">{dailyQuestion.q}</Text>
          <View className="mt-2 p-3 bg-card rounded-xl">
            <Text className="text-muted-foreground text-sm">✅ {dailyQuestion.a}</Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}

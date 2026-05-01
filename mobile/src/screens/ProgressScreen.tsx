import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';
import {
  CheckCircle2,
  Circle,
  Loader as Loader2,
  ChevronDown,
  ArrowRight,
} from 'lucide-react-native';
import Screen from '../components/Screen';
import { THEMES, type ThemeKey } from '../lib/standards';
import { useMastery } from '../hooks/useMastery';
import type { MainTabScreenProps } from '../navigation/types';

type StatusKey = 'not_started' | 'in_progress' | 'mastered';

const STATUS_CONFIG: Record<
  StatusKey,
  {
    Icon: typeof Circle;
    label: string;
    color: string;
    bg: string;
  }
> = {
  not_started: { Icon: Circle, label: 'Not started', color: '#676D76', bg: 'bg-muted' },
  in_progress: { Icon: Loader2, label: 'In progress', color: '#0B5E8C', bg: 'bg-primary/10' },
  mastered: { Icon: CheckCircle2, label: 'Mastered', color: '#2F9950', bg: 'bg-jade/10' },
};

export default function ProgressScreen({ navigation }: MainTabScreenProps<'Progress'>) {
  const { getStandardMastery, masteredCount, totalStandards, getThemeProgress } = useMastery();
  const [expandedTheme, setExpandedTheme] = useState<ThemeKey | null>(null);

  return (
    <Screen>
      <View className="px-4 py-6">
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }}>
          <Text className="text-2xl font-bold text-foreground mb-1">Standards Progress</Text>
          <Text className="text-muted-foreground text-sm mb-2">
            {masteredCount} of {totalStandards} standards mastered
          </Text>
          <View className="h-3 bg-muted rounded-full overflow-hidden mb-6">
            <LinearGradient
              colors={['#2F9950', '#34D399']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: '100%',
                width: `${totalStandards > 0 ? (masteredCount / totalStandards) * 100 : 0}%`,
              }}
            />
          </View>
        </MotiView>

        <View className="flex-row flex-wrap gap-3 mb-6">
          {(Object.entries(STATUS_CONFIG) as [StatusKey, (typeof STATUS_CONFIG)[StatusKey]][]).map(
            ([key, cfg]) => (
              <View key={key} className="flex-row items-center gap-1.5">
                <cfg.Icon color={cfg.color} size={14} />
                <Text className="text-xs text-muted-foreground">{cfg.label}</Text>
              </View>
            )
          )}
        </View>

        <View className="gap-3">
          {THEMES.map((theme, ti) => {
            const prog = getThemeProgress(theme.key);
            const isExpanded = expandedTheme === theme.key;
            const pct = prog.total > 0 ? (prog.mastered / prog.total) * 100 : 0;
            return (
              <MotiView
                key={theme.key}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: ti * 60 }}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${theme.label}, ${prog.mastered} of ${prog.total} mastered`}
                  accessibilityState={{ expanded: isExpanded }}
                  onPress={() => setExpandedTheme(isExpanded ? null : theme.key)}
                >
                  <LinearGradient
                    colors={[theme.gradientFrom, theme.gradientTo]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 20,
                      padding: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <Text className="text-2xl">{theme.icon}</Text>
                    <View className="flex-1">
                      <Text className="font-bold text-sm text-white">{theme.label}</Text>
                      <Text className="text-xs text-white/70">
                        {prog.mastered}/{prog.total} mastered
                      </Text>
                    </View>
                    <View className="w-12 h-2 bg-white/20 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-white/80 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </View>
                    <ChevronDown color="rgba(255,255,255,0.8)" size={16} />
                  </LinearGradient>
                </Pressable>

                <AnimatePresence>
                  {isExpanded && (
                    <MotiView
                      from={{ opacity: 0, translateY: -8 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      exit={{ opacity: 0, translateY: -8 }}
                    >
                      <View className="pt-2 gap-2">
                        {theme.standards.map((standard, si) => {
                          const status = getStandardMastery(standard.code);
                          const cfg = STATUS_CONFIG[status];
                          return (
                            <MotiView
                              key={standard.code}
                              from={{ opacity: 0, translateX: -10 }}
                              animate={{ opacity: 1, translateX: 0 }}
                              transition={{ delay: si * 50 }}
                            >
                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`${standard.code}: ${standard.title}, ${cfg.label}`}
                                onPress={() =>
                                  navigation.navigate('Learn', { standard: standard.code })
                                }
                                className={`flex-row items-center gap-3 rounded-xl p-3 ${cfg.bg}`}
                              >
                                <cfg.Icon color={cfg.color} size={20} />
                                <View className="flex-1">
                                  <View className="flex-row items-center gap-2">
                                    <View className="bg-foreground/10 rounded px-1.5 py-0.5">
                                      <Text className="text-xs font-bold text-foreground">
                                        {standard.code}
                                      </Text>
                                    </View>
                                    {status === 'mastered' ? (
                                      <Text className="text-xs">🎉</Text>
                                    ) : (
                                      <View className="bg-primary/10 rounded-full px-1.5 py-0.5">
                                        <Text className="text-[10px] font-medium text-primary">
                                          Start learning →
                                        </Text>
                                      </View>
                                    )}
                                  </View>
                                  <Text className="text-sm text-foreground mt-0.5">
                                    {standard.title}
                                  </Text>
                                </View>
                                <ArrowRight
                                  color={status === 'mastered' ? '#2F9950' : '#676D76'}
                                  size={16}
                                />
                              </Pressable>
                            </MotiView>
                          );
                        })}
                      </View>
                    </MotiView>
                  )}
                </AnimatePresence>
              </MotiView>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

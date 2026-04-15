import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { THEMES, TOTAL_STANDARDS, type ThemeKey } from '../lib/standards';
import type { StandardMastery } from '../types/database';

export function useMastery() {
  const { user } = useAuth();

  const { data: masteryData, isLoading } = useQuery({
    queryKey: ['mastery', user?.id],
    queryFn: async () => {
      if (!user) return [] as StandardMastery[];
      const { data, error } = await supabase
        .from('standard_mastery')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data ?? []) as StandardMastery[];
    },
    enabled: !!user,
  });

  const masteredCount = masteryData?.filter((m) => m.mastery_level >= 80).length ?? 0;
  const totalStandards = TOTAL_STANDARDS;

  const getThemeProgress = (themeKey: ThemeKey) => {
    const theme = THEMES.find((t) => t.key === themeKey);
    if (!theme) return { mastered: 0, total: 0 };
    const mastered = theme.standards.filter((s) =>
      masteryData?.some((m) => m.standard_code === s.code && m.mastery_level >= 80)
    ).length;
    return { mastered, total: theme.standards.length };
  };

  const getStandardMastery = (code: string) => {
    const entry = masteryData?.find((m) => m.standard_code === code);
    if (!entry) return 'not_started' as const;
    if (entry.mastery_level >= 80) return 'mastered' as const;
    return 'in_progress' as const;
  };

  const getCourseProgress = (standardsCovered: string[]) => {
    const mastered = standardsCovered.filter((code) =>
      masteryData?.some((m) => m.standard_code === code && m.mastery_level >= 80)
    ).length;
    return { mastered, total: standardsCovered.length };
  };

  return {
    masteryData,
    isLoading,
    masteredCount,
    totalStandards,
    getThemeProgress,
    getStandardMastery,
    getCourseProgress,
  };
}

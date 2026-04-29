import { useMemo } from 'react';
import { THEMES, type Theme } from '../lib/standards';
import { useMastery } from './useMastery';

export interface StruggaloProgress {
  activeTheme: Theme;
  currentHP: number;
  maxHP: number;
  damageDealt: number;
  defeatedCount: number;
  totalThemes: number;
  allDefeated: boolean;
}

const MAX_HP = 100;
const MASTERY_THRESHOLD = 80;

export function useStruggaloProgress(): StruggaloProgress {
  const { masteryData } = useMastery();

  return useMemo(() => {
    const totalThemes = THEMES.length;

    const themeHPs = THEMES.map((theme) => {
      const masteredInTheme = theme.standards.filter((s) =>
        masteryData?.some(
          (m) => m.standard_code === s.code && m.mastery_level >= MASTERY_THRESHOLD
        )
      ).length;
      const total = theme.standards.length;
      const damage = total > 0 ? (masteredInTheme / total) * MAX_HP : 0;
      const hp = Math.max(0, MAX_HP - damage);
      return { theme, hp, damage, defeated: hp <= 0 };
    });

    const defeatedCount = themeHPs.filter((t) => t.defeated).length;
    const allDefeated = defeatedCount === totalThemes;

    const active = themeHPs.find((t) => !t.defeated) ?? themeHPs[totalThemes - 1];

    return {
      activeTheme: active.theme,
      currentHP: active.hp,
      maxHP: MAX_HP,
      damageDealt: active.damage,
      defeatedCount,
      totalThemes,
      allDefeated,
    };
  }, [masteryData]);
}

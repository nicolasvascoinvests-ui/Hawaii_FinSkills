export interface Standard {
  code: string;
  title: string;
  theme: ThemeKey;
}

export type ThemeKey =
  | 'earning_income'
  | 'spending'
  | 'saving'
  | 'investing'
  | 'managing_credit'
  | 'managing_risk';

export interface Theme {
  key: ThemeKey;
  label: string;
  hawaiian: string;
  icon: string;
  gradientFrom: string;
  gradientTo: string;
  standards: Standard[];
}

export const THEMES: Theme[] = [
  {
    key: 'earning_income',
    label: 'Earning Income',
    hawaiian: 'Loaʻa Kālā',
    icon: '💰',
    gradientFrom: '#FBBF24',
    gradientTo: '#F97316',
    standards: [
      { code: 'EI-1', title: 'Net income & deductions', theme: 'earning_income' },
      { code: 'EI-2', title: 'Compensation & benefits', theme: 'earning_income' },
      { code: 'EI-3', title: 'Education ROI', theme: 'earning_income' },
      { code: 'EI-4', title: 'Economic & labor market', theme: 'earning_income' },
      { code: 'EI-5', title: 'Retirement income sources', theme: 'earning_income' },
    ],
  },
  {
    key: 'spending',
    label: 'Spending',
    hawaiian: 'Hoʻolilo Kālā',
    icon: '🛒',
    gradientFrom: '#FF6B4A',
    gradientTo: '#F43F5E',
    standards: [
      { code: 'SP-1', title: 'Purchase influences', theme: 'spending' },
      { code: 'SP-2', title: 'Budgeting', theme: 'spending' },
      { code: 'SP-3', title: 'Evaluating purchases', theme: 'spending' },
      { code: 'SP-4', title: 'Housing (rent vs buy)', theme: 'spending' },
      { code: 'SP-5', title: 'Consumer protection', theme: 'spending' },
    ],
  },
  {
    key: 'saving',
    label: 'Saving',
    hawaiian: 'Hoʻāhu Kālā',
    icon: '🏦',
    gradientFrom: '#34D399',
    gradientTo: '#2F9950',
    standards: [
      { code: 'SV-1', title: 'Saving goals', theme: 'saving' },
      { code: 'SV-2', title: 'Savings & well-being', theme: 'saving' },
      { code: 'SV-3', title: 'Compound vs simple interest', theme: 'saving' },
      { code: 'SV-4', title: 'Account types', theme: 'saving' },
      { code: 'SV-5', title: 'Tax-advantaged savings', theme: 'saving' },
    ],
  },
  {
    key: 'investing',
    label: 'Investing',
    hawaiian: 'Hoʻokomo Kālā',
    icon: '📈',
    gradientFrom: '#60A5FA',
    gradientTo: '#6366F1',
    standards: [
      { code: 'IN-1', title: 'Capital gains vs income', theme: 'investing' },
      { code: 'IN-2', title: 'Asset types', theme: 'investing' },
      { code: 'IN-3', title: 'Pooled investments', theme: 'investing' },
      { code: 'IN-4', title: 'Risk levels', theme: 'investing' },
      { code: 'IN-5', title: 'Risk tolerance', theme: 'investing' },
    ],
  },
  {
    key: 'managing_credit',
    label: 'Managing Credit',
    hawaiian: 'Hoʻoponopono ʻAie',
    icon: '💳',
    gradientFrom: '#C084FC',
    gradientTo: '#D946EF',
    standards: [
      { code: 'MC-1', title: 'Rates & fees', theme: 'managing_credit' },
      { code: 'MC-2', title: 'Debt impact', theme: 'managing_credit' },
      { code: 'MC-3', title: 'College funding', theme: 'managing_credit' },
      { code: 'MC-4', title: 'Credit scores', theme: 'managing_credit' },
      { code: 'MC-5', title: 'Non-lender uses of credit', theme: 'managing_credit' },
    ],
  },
  {
    key: 'managing_risk',
    label: 'Managing Risk',
    hawaiian: 'Hoʻoponopono Pilikia',
    icon: '🛡️',
    gradientFrom: '#FB923C',
    gradientTo: '#D97706',
    standards: [
      { code: 'MR-1', title: 'Financial risks', theme: 'managing_risk' },
      { code: 'MR-2', title: 'Mandatory insurance', theme: 'managing_risk' },
      { code: 'MR-3', title: 'Health insurance', theme: 'managing_risk' },
      { code: 'MR-4', title: 'Public insurance programs', theme: 'managing_risk' },
      { code: 'MR-5', title: 'Identity theft', theme: 'managing_risk' },
    ],
  },
];

export const ALL_STANDARDS = THEMES.flatMap((t) => t.standards);
export const TOTAL_STANDARDS = ALL_STANDARDS.length;

export function getThemeByKey(key: ThemeKey): Theme | undefined {
  return THEMES.find((t) => t.key === key);
}

export function getStandardByCode(code: string): Standard | undefined {
  return ALL_STANDARDS.find((s) => s.code === code);
}

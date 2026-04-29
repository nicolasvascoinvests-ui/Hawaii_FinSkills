-- =====================================================================
-- Seed data for the FinSkill Path Supabase project
-- Safe to re-run — uses ON CONFLICT DO NOTHING / DO UPDATE.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Hawaiʻi Financial Literacy Standards (August 2025)
-- 6 themes, 30 standards
-- ---------------------------------------------------------------------
INSERT INTO public.standards (code, theme_key, theme_label, title, description) VALUES
  -- Theme 1: Earning Income
  ('EI-1', 'earning_income', 'Earning Income', 'Net income & deductions',  'Net income (take-home pay) = wages/salaries minus taxes and payroll deductions'),
  ('EI-2', 'earning_income', 'Earning Income', 'Compensation & benefits',  'Compensation includes wages, salaries, commissions, tips, bonuses, plus benefits'),
  ('EI-3', 'earning_income', 'Earning Income', 'Education ROI',            'Opportunity cost of additional training/education vs future earning potential'),
  ('EI-4', 'earning_income', 'Earning Income', 'Economic & labor market',  'Economic conditions, technology, and labor market changes affect income'),
  ('EI-5', 'earning_income', 'Earning Income', 'Retirement income sources','Retirement income sources: continued employment, Social Security, employer plans'),

  -- Theme 2: Spending
  ('SP-1', 'spending', 'Spending', 'Purchase influences',  'Price, peer pressure, advertising, and others choices influence purchase decisions'),
  ('SP-2', 'spending', 'Spending', 'Budgeting',            'Budgets help make informed spending/saving decisions to achieve financial goals'),
  ('SP-3', 'spending', 'Spending', 'Evaluating purchases', 'Informed purchases require evaluating price, claims, and quality from multiple sources'),
  ('SP-4', 'spending', 'Spending', 'Housing decisions',    'Housing decisions depend on preferences, circumstances, costs'),
  ('SP-5', 'spending', 'Spending', 'Consumer protection',  'Federal/state consumer protection helps avoid fraud and unfair practices'),

  -- Theme 3: Saving
  ('SV-1', 'saving', 'Saving', 'Saving goals',                'People save for large purchases, education, retirement, and emergencies'),
  ('SV-2', 'saving', 'Saving', 'Savings & well-being',        'Savings decisions depend on individual preferences/circumstances'),
  ('SV-3', 'saving', 'Saving', 'Compound vs simple interest', 'Compound interest vs simple interest'),
  ('SV-4', 'saving', 'Saving', 'Account types',               'Account types: savings, money market, CDs — varying rates, fees, insurance'),
  ('SV-5', 'saving', 'Saving', 'Tax-advantaged savings',      'Tax policies (pretax savings, IRAs) incentivize saving'),

  -- Theme 4: Investing
  ('IN-1', 'investing', 'Investing', 'Capital gains vs income','Investors expect capital gains and/or regular income'),
  ('IN-2', 'investing', 'Investing', 'Asset types',             'Common assets: CDs, stocks, bonds, mutual funds, real estate'),
  ('IN-3', 'investing', 'Investing', 'Pooled investments',      'Pooled investments (mutual funds, ETFs) as alternative to individual securities'),
  ('IN-4', 'investing', 'Investing', 'Risk levels',              'Different investments carry different degrees of risk'),
  ('IN-5', 'investing', 'Investing', 'Risk tolerance',           'Risk tolerance depends on personality, resources, experience, life circumstances'),

  -- Theme 5: Managing Credit
  ('MC-1', 'managing_credit', 'Managing Credit', 'Rates & fees',              'Interest rates and fees vary by lender type, credit type, and market conditions'),
  ('MC-2', 'managing_credit', 'Managing Credit', 'Debt impact',                'Borrowing increases debt and can negatively affect finances'),
  ('MC-3', 'managing_credit', 'Managing Credit', 'College funding',            'Post-secondary education funded through scholarships, grants, loans, work-study, savings'),
  ('MC-4', 'managing_credit', 'Managing Credit', 'Credit scores',              'Credit score = numeric rating assessing credit risk'),
  ('MC-5', 'managing_credit', 'Managing Credit', 'Non-lender uses of credit',  'Credit reports/scores used by landlords, employers, insurance companies'),

  -- Theme 6: Managing Risk
  ('MR-1', 'managing_risk', 'Managing Risk', 'Financial risks',            'Unexpected events can damage health, wealth, income, property, opportunities'),
  ('MR-2', 'managing_risk', 'Managing Risk', 'Mandatory insurance',        'Some insurance coverage is mandatory (e.g., auto liability)'),
  ('MR-3', 'managing_risk', 'Managing Risk', 'Health insurance',           'Health insurance covers medically necessary care'),
  ('MR-4', 'managing_risk', 'Managing Risk', 'Public insurance programs', 'Public insurance programs (unemployment, Medicaid, Medicare) protect against hardship'),
  ('MR-5', 'managing_risk', 'Managing Risk', 'Identity theft',             'Online transactions create vulnerability to identity theft and fraud')
ON CONFLICT (code) DO UPDATE SET
  title       = EXCLUDED.title,
  description = EXCLUDED.description,
  theme_key   = EXCLUDED.theme_key,
  theme_label = EXCLUDED.theme_label;

-- ---------------------------------------------------------------------
-- Achievement definitions (starter set)
-- ---------------------------------------------------------------------
INSERT INTO public.achievement_definitions (code, title, description, icon, category, points, age_tier) VALUES
  ('first_lesson',    'First Steps',         'Complete your very first lesson',         '🎉', 'progress',  10, NULL),
  ('first_quiz',      'Quiz Whiz',           'Pass your first quiz',                    '🧠', 'mastery',   15, NULL),
  ('streak_3',        '3-Day Streak',        'Learn 3 days in a row',                   '🔥', 'streak',    20, NULL),
  ('streak_7',        'Week Warrior',        'Learn 7 days in a row',                   '⚡', 'streak',    50, NULL),
  ('streak_30',       'Monthly Master',      'Learn 30 days in a row',                  '🏆', 'streak',   200, NULL),
  ('first_budget',    'Budget Builder',      'Create your first budget in the tool',    '📊', 'engagement',25, NULL),
  ('first_savings_goal','Savings Starter',   'Set your first savings goal',             '🐷', 'engagement',25, NULL),
  ('mastered_theme_ei','Income Insider',     'Master all 5 Earning Income standards',   '💰', 'mastery',  100, NULL),
  ('mastered_theme_sp','Smart Spender',      'Master all 5 Spending standards',         '🛒', 'mastery',  100, NULL),
  ('mastered_theme_sv','Super Saver',        'Master all 5 Saving standards',           '🏦', 'mastery',  100, NULL),
  ('mastered_theme_in','Investor',           'Master all 5 Investing standards',        '📈', 'mastery',  100, NULL),
  ('mastered_theme_mc','Credit Captain',     'Master all 5 Managing Credit standards',  '💳', 'mastery',  100, NULL),
  ('mastered_theme_mr','Risk Ranger',        'Master all 5 Managing Risk standards',    '🛡️', 'mastery', 100, NULL),
  ('all_standards',   'Financial Literacy Champion', 'Master all 30 financial literacy standards', '⭐', 'milestone',500, NULL)
ON CONFLICT (code) DO UPDATE SET
  title       = EXCLUDED.title,
  description = EXCLUDED.description,
  icon        = EXCLUDED.icon,
  points      = EXCLUDED.points,
  category    = EXCLUDED.category;

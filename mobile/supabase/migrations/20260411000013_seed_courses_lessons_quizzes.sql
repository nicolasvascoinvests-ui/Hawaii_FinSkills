-- =====================================================================
-- Seed data: Courses, Lessons, and Quiz Questions
-- Covers all 6 themes and all 30 Hawaiʻi Financial Literacy Standards.
-- Safe to re-run — uses ON CONFLICT DO NOTHING.
-- =====================================================================

-- We use fixed UUIDs so re-running is idempotent.
-- Course UUIDs: c1..c6   Lesson UUIDs: L prefix   Quiz UUIDs: Q prefix

-- =====================================================================
-- THEME 1: EARNING INCOME
-- =====================================================================
INSERT INTO public.courses (id, slug, title, description, theme, age_tier, difficulty, estimated_minutes, order_index, standards_covered, is_published) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'earning-income-101', 'Earning Income 101', 'Understand how you earn money, what affects your paycheck, and how to plan for your financial future through smart career and education choices.', 'earning_income', '13_17', 'beginner', 50, 1, ARRAY['EI-1','EI-2','EI-3','EI-4','EI-5'], true)
ON CONFLICT (id) DO NOTHING;

-- Lesson 1: Your Paycheck Explained (EI-1)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000001-0001-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'your-paycheck-explained', 'Your Paycheck Explained', 'Learn what gets taken out of your paycheck and why.', 'reading',
   '{"sections":[
     {"title":"What Is a Paycheck?","body":"When you work a job, your employer pays you for your time and effort. But the amount you earn (gross pay) is not the same as the amount you take home (net pay). Several deductions are subtracted before you receive your check.","type":"text"},
     {"title":"Common Paycheck Deductions","body":"Federal income tax, state income tax (Hawaii has rates from 1.4% to 11%), Social Security (6.2%), and Medicare (1.45%) are the main deductions. You may also see deductions for health insurance, retirement contributions, or union dues.","type":"text"},
     {"title":"Hawaii Example","body":"Imagine you earn $1,000 in a pay period in Honolulu. After federal tax (~$120), Hawaii state tax (~$50), Social Security (~$62), and Medicare (~$14.50), your take-home pay is roughly $753.50. That is a big difference from $1,000!","type":"example"},
     {"title":"Key Takeaway","body":"Always look at your net pay, not your gross pay, when planning your budget. Understanding your deductions helps you plan smarter and avoid surprises.","type":"tip"}
   ]}'::jsonb, 10, 1, ARRAY['EI-1'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 2: Compensation & Benefits (EI-2)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000001-0002-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'compensation-and-benefits', 'Compensation & Benefits', 'Your pay is more than just your wage — learn about the full compensation package.', 'reading',
   '{"sections":[
     {"title":"More Than Just a Wage","body":"Compensation is everything your employer gives you in exchange for your work. This includes your base pay (hourly wage or salary) plus benefits like health insurance, retirement plans, paid time off, and education reimbursement.","type":"text"},
     {"title":"Types of Pay","body":"Wages are paid hourly. Salaries are a fixed annual amount. Some jobs also offer commissions (a percentage of sales), tips (common in food service in Hawaii), and bonuses for meeting goals.","type":"text"},
     {"title":"Benefits Matter","body":"A job paying $50,000/year with full health insurance and a 401(k) match could be worth more than a $55,000 job with no benefits. In Hawaii, where health insurance is required by law for most employees, this is especially important.","type":"example"},
     {"title":"Evaluate the Full Package","body":"When comparing job offers, always add up the total value of compensation — not just the paycheck number. Benefits can be worth thousands of dollars per year.","type":"tip"}
   ]}'::jsonb, 10, 2, ARRAY['EI-2'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 3: Is College Worth It? (EI-3)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000001-0003-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'is-college-worth-it', 'Is College Worth It?', 'Explore the opportunity cost of education and training.', 'reading',
   '{"sections":[
     {"title":"Opportunity Cost of Education","body":"Going to college costs money (tuition, books, fees) and time (4+ years). During that time, you are not earning a full-time income. This trade-off is called opportunity cost — what you give up to pursue something else.","type":"text"},
     {"title":"The Earning Premium","body":"On average, workers with a bachelor''s degree earn about $1.2 million more over their lifetime than those with only a high school diploma. But averages hide a lot of variation — the field of study matters enormously.","type":"text"},
     {"title":"Hawaii Context","body":"The University of Hawaii system offers in-state tuition around $12,000/year. A nursing degree from UH can lead to starting salaries of $75,000+ in Hawaii, while some other degrees may not have the same return. Trade programs (electrician, plumber) can also lead to high-paying careers.","type":"example"},
     {"title":"Calculate Your ROI","body":"Before choosing education or training, estimate the cost vs. the expected increase in lifetime earnings. Sometimes a 2-year trade certificate has better ROI than a 4-year degree.","type":"tip"}
   ]}'::jsonb, 10, 3, ARRAY['EI-3'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 4: The Job Market & Economy (EI-4)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000001-0004-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'job-market-and-economy', 'The Job Market & Economy', 'How economic conditions and technology shape your career opportunities.', 'reading',
   '{"sections":[
     {"title":"Supply and Demand for Workers","body":"Just like products, workers are subject to supply and demand. When many people have a skill but few jobs need it, wages tend to be lower. When a skill is rare but highly needed, wages rise.","type":"text"},
     {"title":"Technology Changes Everything","body":"Automation and AI are changing which jobs exist. Some jobs disappear (toll booth operators, data entry clerks), while new ones emerge (cybersecurity analysts, renewable energy technicians). Adaptability is key.","type":"text"},
     {"title":"Hawaii''s Economy","body":"Hawaii''s economy depends heavily on tourism, military, and construction. The high cost of living means wages need to be higher to maintain the same standard of living as on the mainland. Remote work is creating new opportunities for Hawaii residents to earn mainland salaries.","type":"example"},
     {"title":"Stay Adaptable","body":"The best career strategy is continuous learning. Keep building new skills, stay aware of industry trends, and be willing to pivot when the market changes.","type":"tip"}
   ]}'::jsonb, 10, 4, ARRAY['EI-4'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 5: Planning for Retirement (EI-5)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000001-0005-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'planning-for-retirement', 'Planning for Retirement', 'It is never too early to think about retirement income sources.', 'reading',
   '{"sections":[
     {"title":"Where Does Retirement Money Come From?","body":"Most retirees rely on three sources: Social Security benefits, employer-sponsored retirement plans (like 401(k) or pension), and personal savings/investments. Some people also continue working part-time.","type":"text"},
     {"title":"Social Security Basics","body":"Social Security is a government program funded by payroll taxes (FICA). You earn credits by working, and benefits are based on your 35 highest-earning years. The full retirement age is currently 67 for most young people today.","type":"text"},
     {"title":"Start Early","body":"If you save $100/month starting at age 18 with a 7% average return, you will have about $380,000 by age 65. If you wait until age 30 to start, you will only have about $175,000. Starting 12 years earlier nearly doubles your retirement savings!","type":"example"},
     {"title":"Take Advantage of Employer Matches","body":"If your employer offers a 401(k) match (e.g., they match 50% of your contributions up to 6% of your salary), always contribute at least enough to get the full match. It is literally free money.","type":"tip"}
   ]}'::jsonb, 10, 5, ARRAY['EI-5'])
ON CONFLICT (id) DO NOTHING;

-- Quiz questions for Earning Income lessons
INSERT INTO public.quiz_questions (id, lesson_id, question_type, question_text, options, correct_answer, explanation, standard_code, difficulty, order_index, points) VALUES
  -- EI-1 questions
  ('b0000001-0001-0001-0000-000000000001', 'a0000001-0001-0000-0000-000000000001', 'multiple_choice',
   'What is net pay?',
   '["Your total earnings before any deductions","The amount you take home after deductions","The amount your employer pays in taxes","Your hourly wage multiplied by hours worked"]'::jsonb,
   'The amount you take home after deductions',
   'Net pay (take-home pay) is what remains after federal tax, state tax, Social Security, Medicare, and other deductions are subtracted from your gross pay.',
   'EI-1', 'easy', 1, 1),

  ('b0000001-0001-0002-0000-000000000001', 'a0000001-0001-0000-0000-000000000001', 'multiple_choice',
   'Which of the following is NOT typically deducted from a paycheck?',
   '["Federal income tax","Social Security (FICA)","Grocery expenses","State income tax"]'::jsonb,
   'Grocery expenses',
   'Grocery expenses are personal spending, not a paycheck deduction. Paycheck deductions include taxes, Social Security, Medicare, and voluntary items like health insurance.',
   'EI-1', 'easy', 2, 1),

  ('b0000001-0001-0003-0000-000000000001', 'a0000001-0001-0000-0000-000000000001', 'true_false',
   'Gross pay and net pay are the same amount.',
   '["True","False"]'::jsonb,
   'False',
   'Gross pay is your total earnings before deductions. Net pay is what you take home after taxes and other deductions are subtracted.',
   'EI-1', 'easy', 3, 1),

  -- EI-2 questions
  ('b0000001-0002-0001-0000-000000000001', 'a0000001-0002-0000-0000-000000000001', 'multiple_choice',
   'Which of these is an example of an employee benefit?',
   '["Hourly wage","Health insurance","Commission","Overtime pay"]'::jsonb,
   'Health insurance',
   'Benefits are non-wage compensation provided by employers. Health insurance, retirement plans, and paid time off are common benefits.',
   'EI-2', 'easy', 1, 1),

  ('b0000001-0002-0002-0000-000000000001', 'a0000001-0002-0000-0000-000000000001', 'multiple_choice',
   'A job pays $50,000/year with full health insurance ($8,000 value) and 401(k) match ($2,500 value). What is the total compensation?',
   '["$50,000","$58,000","$60,500","$52,500"]'::jsonb,
   '$60,500',
   'Total compensation = salary ($50,000) + health insurance ($8,000) + 401(k) match ($2,500) = $60,500.',
   'EI-2', 'medium', 2, 1),

  -- EI-3 questions
  ('b0000001-0003-0001-0000-000000000001', 'a0000001-0003-0000-0000-000000000001', 'multiple_choice',
   'What is opportunity cost?',
   '["The price of tuition","What you give up when you choose one option over another","The interest on student loans","The cost of textbooks"]'::jsonb,
   'What you give up when you choose one option over another',
   'Opportunity cost is the value of the next best alternative you give up when making a decision. Going to college means giving up years of potential full-time earnings.',
   'EI-3', 'medium', 1, 1),

  ('b0000001-0003-0002-0000-000000000001', 'a0000001-0003-0000-0000-000000000001', 'true_false',
   'A 4-year college degree always provides better return on investment than a trade certificate.',
   '["True","False"]'::jsonb,
   'False',
   'It depends on the specific degree and trade. Some 2-year trade certificates (electrician, plumber) can provide better ROI than certain 4-year degrees, especially considering lower tuition costs and earlier entry into the workforce.',
   'EI-3', 'medium', 2, 1),

  -- EI-4 questions
  ('b0000001-0004-0001-0000-000000000001', 'a0000001-0004-0000-0000-000000000001', 'multiple_choice',
   'What happens to wages when many workers have a skill but few jobs need it?',
   '["Wages increase","Wages stay the same","Wages tend to decrease","Wages double"]'::jsonb,
   'Wages tend to decrease',
   'When the supply of workers with a particular skill exceeds the demand for that skill, wages tend to fall due to competition among workers.',
   'EI-4', 'medium', 1, 1),

  -- EI-5 questions
  ('b0000001-0005-0001-0000-000000000001', 'a0000001-0005-0000-0000-000000000001', 'multiple_choice',
   'What are the three main sources of retirement income?',
   '["Savings, credit cards, inheritance","Social Security, employer plans, personal savings","Lottery, gifts, Social Security","Rent, dividends, tips"]'::jsonb,
   'Social Security, employer plans, personal savings',
   'The three pillars of retirement income are Social Security benefits, employer-sponsored retirement plans (401(k), pensions), and personal savings/investments.',
   'EI-5', 'easy', 1, 1),

  ('b0000001-0005-0002-0000-000000000001', 'a0000001-0005-0000-0000-000000000001', 'true_false',
   'Starting to save for retirement at age 18 instead of age 30 can nearly double your retirement savings.',
   '["True","False"]'::jsonb,
   'True',
   'Thanks to compound interest, starting early makes a huge difference. Saving $100/month from age 18 at 7% returns yields ~$380,000 by 65, vs ~$175,000 starting at 30.',
   'EI-5', 'easy', 2, 1)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- THEME 2: SPENDING
-- =====================================================================
INSERT INTO public.courses (id, slug, title, description, theme, age_tier, difficulty, estimated_minutes, order_index, standards_covered, is_published) VALUES
  ('c0000001-0000-0000-0000-000000000002', 'smart-spending', 'Smart Spending', 'Learn how to make smart purchase decisions, build a budget, and protect yourself as a consumer in Hawaii.', 'spending', '13_17', 'beginner', 50, 2, ARRAY['SP-1','SP-2','SP-3','SP-4','SP-5'], true)
ON CONFLICT (id) DO NOTHING;

-- Lesson 1: What Influences Your Spending? (SP-1)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000002-0001-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000002', 'what-influences-spending', 'What Influences Your Spending?', 'Discover the hidden forces that shape your buying decisions.', 'reading',
   '{"sections":[
     {"title":"The Psychology of Spending","body":"Every time you buy something, multiple forces are at work. Price is obvious, but peer pressure, advertising, social media influencers, and even store layout are designed to influence your decisions. Understanding these forces helps you make better choices.","type":"text"},
     {"title":"Advertising Tricks","body":"Companies spend billions on advertising because it works. Emotional appeals, celebrity endorsements, limited-time offers, and fear of missing out (FOMO) all push you toward spending. Social media ads are especially powerful because they feel personal.","type":"text"},
     {"title":"Peer Pressure in Hawaii","body":"In Hawaii, there can be pressure to keep up with trends — the latest phone, popular brands, or eating out at trendy spots. If your friends all have the newest iPhone, it is easy to feel like you need one too, even if your current phone works perfectly fine.","type":"example"},
     {"title":"Pause Before You Purchase","body":"Before buying something, wait 24 hours. Ask yourself: Do I need this, or do I just want it right now? Am I buying this because of an ad or because a friend has it? This simple pause can save you hundreds of dollars a year.","type":"tip"}
   ]}'::jsonb, 10, 1, ARRAY['SP-1'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 2: Budgeting Basics (SP-2)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000002-0002-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000002', 'budgeting-basics', 'Budgeting Basics', 'Create a budget that actually works for your life.', 'reading',
   '{"sections":[
     {"title":"What Is a Budget?","body":"A budget is a plan for your money. It tells every dollar where to go so you can cover your needs, enjoy some wants, and save for the future. Without a budget, money tends to disappear without a trace.","type":"text"},
     {"title":"The 50/30/20 Rule","body":"A popular budgeting framework: 50% of your income goes to needs (rent, food, transportation), 30% to wants (entertainment, dining out, hobbies), and 20% to savings and debt repayment. In Hawaii, the needs percentage may be higher due to the cost of living.","type":"text"},
     {"title":"Hawaii Budget Example","body":"A teen earning $800/month from a part-time job might budget: $200 for transportation and phone (needs), $240 for fun and food with friends (wants), and $160 for savings (20%). Even small savings add up — $160/month becomes $1,920 in a year!","type":"example"},
     {"title":"Track Everything","body":"Use an app or simple spreadsheet to track every dollar for one month. You will be surprised where your money actually goes. Most people discover they spend way more on small purchases (boba, snacks, subscriptions) than they realized.","type":"tip"}
   ]}'::jsonb, 10, 2, ARRAY['SP-2'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 3: Being a Smart Shopper (SP-3)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000002-0003-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000002', 'smart-shopper', 'Being a Smart Shopper', 'How to evaluate products and make informed purchase decisions.', 'reading',
   '{"sections":[
     {"title":"Compare Before You Buy","body":"Informed purchases require comparing price, quality, and product claims from multiple sources. Do not rely on a single advertisement or review. Check multiple retailers, read independent reviews, and compare unit prices.","type":"text"},
     {"title":"Unit Pricing","body":"Unit pricing shows the cost per ounce, per count, or per unit, making it easy to compare products of different sizes. The bigger package is not always the better deal! Always check the unit price on the shelf tag.","type":"text"},
     {"title":"Online Shopping Tips","body":"When shopping online in Hawaii, factor in shipping costs — they can be significant due to the distance from the mainland. Look for free shipping thresholds, compare prices across multiple sites, and read reviews from verified purchasers.","type":"example"},
     {"title":"Return Policies Matter","body":"Before buying, check the return policy. Some items (electronics, swimwear) may have limited return windows. Keep receipts and original packaging. A good return policy can save you money if the product does not meet expectations.","type":"tip"}
   ]}'::jsonb, 10, 3, ARRAY['SP-3'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 4: Housing Decisions (SP-4)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000002-0004-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000002', 'housing-decisions', 'Housing Decisions', 'Explore renting vs. buying and how housing costs affect your finances.', 'reading',
   '{"sections":[
     {"title":"Housing Is Your Biggest Expense","body":"For most people, housing is their single largest expense — often 30-50% of income. Your housing choice (renting vs. buying, location, size) has a massive impact on your overall financial health.","type":"text"},
     {"title":"Renting vs. Buying","body":"Renting offers flexibility and lower upfront costs. Buying builds equity (ownership) over time but requires a down payment, maintenance costs, and a long-term commitment. Neither is always better — it depends on your situation.","type":"text"},
     {"title":"Hawaii Housing Reality","body":"Hawaii has some of the highest housing costs in the nation. The median home price in Honolulu exceeds $700,000, and average rent for a 1-bedroom apartment is over $2,000/month. Many Hawaii residents live with extended family (multigenerational housing) to manage costs — this is both culturally valued and financially smart.","type":"example"},
     {"title":"The 30% Rule","body":"Financial experts suggest spending no more than 30% of your gross income on housing. In Hawaii, this can be challenging, so creative solutions like roommates, ADUs (accessory dwelling units), and living with family are common and practical strategies.","type":"tip"}
   ]}'::jsonb, 10, 4, ARRAY['SP-4'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 5: Consumer Protection (SP-5)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000002-0005-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000002', 'consumer-protection', 'Consumer Protection', 'Know your rights as a consumer and where to get help.', 'reading',
   '{"sections":[
     {"title":"Your Rights as a Consumer","body":"Federal and state laws protect you from fraud, unsafe products, and unfair business practices. The Federal Trade Commission (FTC) and Consumer Financial Protection Bureau (CFPB) enforce these protections at the federal level.","type":"text"},
     {"title":"Hawaii Consumer Protection","body":"Hawaii has its own Office of Consumer Protection (OCP) under the Department of Commerce and Consumer Affairs (DCCA). They handle complaints about businesses, scams, price gouging, and unfair practices specific to Hawaii.","type":"text"},
     {"title":"Common Scams to Watch For","body":"In Hawaii, common scams include fake vacation rentals, predatory lending targeting military families, phishing emails from fake Hawaiian companies, and door-to-door solar panel scams with misleading contracts. If a deal seems too good to be true, it probably is.","type":"example"},
     {"title":"What to Do If Scammed","body":"Report fraud to the Hawaii DCCA (cca.hawaii.gov), file a complaint with the FTC (reportfraud.ftc.gov), and contact your bank immediately if financial accounts are compromised. Keep all documentation — emails, receipts, screenshots.","type":"tip"}
   ]}'::jsonb, 10, 5, ARRAY['SP-5'])
ON CONFLICT (id) DO NOTHING;

-- Quiz questions for Spending lessons
INSERT INTO public.quiz_questions (id, lesson_id, question_type, question_text, options, correct_answer, explanation, standard_code, difficulty, order_index, points) VALUES
  -- SP-1
  ('b0000002-0001-0001-0000-000000000001', 'a0000002-0001-0000-0000-000000000001', 'multiple_choice',
   'Which of these is an example of peer pressure influencing a purchase?',
   '["Buying a cheaper generic brand","Buying the same shoes your friends have to fit in","Comparing prices at two stores","Waiting for a sale"]'::jsonb,
   'Buying the same shoes your friends have to fit in',
   'Peer pressure is when you make a purchase primarily because your friends have the same item or because you want to fit in socially.',
   'SP-1', 'easy', 1, 1),

  ('b0000002-0001-0002-0000-000000000001', 'a0000002-0001-0000-0000-000000000001', 'true_false',
   'Waiting 24 hours before making a purchase can help you avoid impulse buying.',
   '["True","False"]'::jsonb,
   'True',
   'The 24-hour rule helps you distinguish between wants and needs, reducing impulse purchases driven by emotions, advertising, or peer pressure.',
   'SP-1', 'easy', 2, 1),

  -- SP-2
  ('b0000002-0002-0001-0000-000000000001', 'a0000002-0002-0000-0000-000000000001', 'multiple_choice',
   'In the 50/30/20 budget rule, what does the 20% represent?',
   '["Needs like rent and food","Wants like entertainment","Savings and debt repayment","Taxes"]'::jsonb,
   'Savings and debt repayment',
   'The 50/30/20 rule allocates 50% to needs, 30% to wants, and 20% to savings and paying off debt.',
   'SP-2', 'easy', 1, 1),

  ('b0000002-0002-0002-0000-000000000001', 'a0000002-0002-0000-0000-000000000001', 'fill_in',
   'If you earn $800/month and save 20%, how many dollars do you save each month?',
   '[]'::jsonb,
   '160',
   '$800 x 20% = $160 per month in savings.',
   'SP-2', 'medium', 2, 1),

  -- SP-3
  ('b0000002-0003-0001-0000-000000000001', 'a0000002-0003-0000-0000-000000000001', 'multiple_choice',
   'What is unit pricing?',
   '["The total price of an item","The cost per ounce, count, or unit","The price after coupons","The manufacturer suggested retail price"]'::jsonb,
   'The cost per ounce, count, or unit',
   'Unit pricing breaks down the cost to a per-unit basis, making it easy to compare products of different sizes and find the best deal.',
   'SP-3', 'easy', 1, 1),

  -- SP-4
  ('b0000002-0004-0001-0000-000000000001', 'a0000002-0004-0000-0000-000000000001', 'multiple_choice',
   'What is one advantage of renting a home instead of buying?',
   '["Building equity over time","Lower upfront costs and more flexibility","Tax deductions on mortgage interest","Increasing property value"]'::jsonb,
   'Lower upfront costs and more flexibility',
   'Renting typically requires less money upfront (no down payment) and allows you to move more easily, while buying builds equity but requires significant upfront investment.',
   'SP-4', 'medium', 1, 1),

  -- SP-5
  ('b0000002-0005-0001-0000-000000000001', 'a0000002-0005-0000-0000-000000000001', 'multiple_choice',
   'Which Hawaii agency handles consumer protection complaints?',
   '["FBI","Hawaii Tourism Authority","Department of Commerce and Consumer Affairs (DCCA)","IRS"]'::jsonb,
   'Department of Commerce and Consumer Affairs (DCCA)',
   'Hawaii''s DCCA houses the Office of Consumer Protection, which handles complaints about unfair business practices, scams, and fraud in the state.',
   'SP-5', 'medium', 1, 1)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- THEME 3: SAVING
-- =====================================================================
INSERT INTO public.courses (id, slug, title, description, theme, age_tier, difficulty, estimated_minutes, order_index, standards_covered, is_published) VALUES
  ('c0000001-0000-0000-0000-000000000003', 'saving-for-your-future', 'Saving for Your Future', 'Discover why saving matters, how compound interest grows your money, and the different types of savings accounts available to you.', 'saving', '13_17', 'beginner', 50, 3, ARRAY['SV-1','SV-2','SV-3','SV-4','SV-5'], true)
ON CONFLICT (id) DO NOTHING;

-- Lesson 1: Why Save? (SV-1)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000003-0001-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000003', 'why-save', 'Why Save?', 'Understand the reasons people save and set your own savings goals.', 'reading',
   '{"sections":[
     {"title":"Reasons People Save","body":"People save money for many reasons: large purchases (a car, college tuition), emergencies (unexpected medical bills, car repairs), retirement, and future goals (travel, starting a business). Having savings gives you options and reduces financial stress.","type":"text"},
     {"title":"Emergency Fund First","body":"Financial experts recommend saving 3-6 months of living expenses as an emergency fund before focusing on other savings goals. This protects you from unexpected events like job loss, medical emergencies, or major repairs.","type":"text"},
     {"title":"Hawaii Savings Goals","body":"In Hawaii, common savings goals include a car (since public transit is limited outside Honolulu), college tuition at UH ($12,000/year in-state), or eventually a down payment on a home. Even saving $50/month starting as a teen adds up — that is $600/year or $3,600 by the time you graduate high school if you start at age 14.","type":"example"},
     {"title":"Pay Yourself First","body":"The most effective savings strategy is automating it. Set up automatic transfers to your savings account on payday, before you have a chance to spend it. Treat savings like a bill you must pay.","type":"tip"}
   ]}'::jsonb, 10, 1, ARRAY['SV-1'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 2: Savings & Personal Circumstances (SV-2)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000003-0002-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000003', 'savings-and-you', 'Savings & Your Situation', 'How your personal circumstances affect your savings decisions.', 'reading',
   '{"sections":[
     {"title":"Everyone''s Situation Is Different","body":"How much you should save and what you save for depends on your income, age, family situation, risk tolerance, and financial goals. There is no one-size-fits-all answer.","type":"text"},
     {"title":"Life Stage Matters","body":"A teenager might save for a first car or college. A young adult might save for an apartment deposit. A parent might prioritize their children''s education fund. A 50-year-old should be focused on retirement savings.","type":"text"},
     {"title":"Hawaii Cost Considerations","body":"Living in Hawaii means higher costs for many things — groceries are 30-50% more expensive than the mainland, gas prices are higher, and housing costs are among the highest in the nation. This means Hawaii residents may need to save more aggressively or find creative ways to cut expenses.","type":"example"},
     {"title":"Start Where You Are","body":"Do not be discouraged if you can only save a small amount. Even $10/week builds the habit and adds up to $520/year. The important thing is consistency, not the amount.","type":"tip"}
   ]}'::jsonb, 10, 2, ARRAY['SV-2'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 3: Compound Interest Magic (SV-3)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000003-0003-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000003', 'compound-interest', 'Compound Interest Magic', 'How compound interest makes your money grow faster over time.', 'reading',
   '{"sections":[
     {"title":"Simple vs. Compound Interest","body":"Simple interest is calculated only on the original amount (principal). Compound interest is calculated on the principal PLUS any interest already earned. This creates a snowball effect where your money grows faster and faster over time.","type":"text"},
     {"title":"The Math","body":"If you put $1,000 in an account earning 5% simple interest, you earn $50/year — always $50. With 5% compound interest, you earn $50 the first year, then $52.50 the second year (5% of $1,050), then $55.13 the third year, and so on. After 20 years: simple = $2,000, compound = $2,653.","type":"text"},
     {"title":"The Rule of 72","body":"Want to know how long it takes to double your money? Divide 72 by the interest rate. At 6% return, your money doubles in about 12 years (72/6=12). At 8%, it doubles in about 9 years. This is why starting early is so powerful!","type":"example"},
     {"title":"Make It Work for You","body":"Compound interest is your best friend when saving and your worst enemy when borrowing. Save early to earn it, and avoid high-interest debt (like credit cards) where it works against you.","type":"tip"}
   ]}'::jsonb, 10, 3, ARRAY['SV-3'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 4: Types of Savings Accounts (SV-4)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000003-0004-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000003', 'savings-account-types', 'Types of Savings Accounts', 'Compare different savings account types and their features.', 'reading',
   '{"sections":[
     {"title":"Regular Savings Accounts","body":"The most common type. Easy to open, low minimum balances, instant access to your money. Interest rates are typically low (0.01-0.5%). FDIC insured up to $250,000. Available at most banks and credit unions in Hawaii.","type":"text"},
     {"title":"Money Market Accounts","body":"Higher interest rates than regular savings, but may require higher minimum balances ($1,000-$2,500). May offer limited check-writing. FDIC insured. A good middle ground between savings and checking.","type":"text"},
     {"title":"Certificates of Deposit (CDs)","body":"You lock your money in for a set period (3 months to 5 years). In return, you get a higher interest rate. Early withdrawal usually means a penalty. Best for money you know you will not need for a while.","type":"text"},
     {"title":"Hawaii Banking Options","body":"Local banks like Bank of Hawaii and First Hawaiian Bank, plus credit unions like HawaiiUSA Federal Credit Union, often offer competitive rates for Hawaii residents. High-yield online savings accounts (like Marcus or Ally) can offer even higher rates, but you will not have local branch access.","type":"example"}
   ]}'::jsonb, 10, 4, ARRAY['SV-4'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 5: Tax-Advantaged Savings (SV-5)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000003-0005-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000003', 'tax-advantaged-savings', 'Tax-Advantaged Savings', 'How the government encourages saving through tax benefits.', 'reading',
   '{"sections":[
     {"title":"Why the Government Helps You Save","body":"The government wants people to save for retirement, education, and health care. To encourage this, they offer tax benefits on certain savings accounts. This means you pay less in taxes when you use these special accounts.","type":"text"},
     {"title":"Retirement Accounts","body":"Traditional IRAs let you deduct contributions from your taxable income now and pay taxes when you withdraw in retirement. Roth IRAs use after-tax money but withdrawals in retirement are tax-free. 401(k) plans work similarly but are offered through employers.","type":"text"},
     {"title":"Education Savings","body":"529 Plans let you save for college with tax-free growth. Hawaii does not have its own 529 plan, but residents can use any state''s plan. Coverdell Education Savings Accounts (ESAs) are another option for education expenses.","type":"example"},
     {"title":"Start a Roth IRA Early","body":"If you have earned income (even from a part-time job), you can open a Roth IRA. Since teens are usually in a low tax bracket, paying taxes now and getting tax-free growth for 50+ years is an incredible deal. Even $500/year starting at 16 can grow to over $100,000 by retirement.","type":"tip"}
   ]}'::jsonb, 10, 5, ARRAY['SV-5'])
ON CONFLICT (id) DO NOTHING;

-- Quiz questions for Saving lessons
INSERT INTO public.quiz_questions (id, lesson_id, question_type, question_text, options, correct_answer, explanation, standard_code, difficulty, order_index, points) VALUES
  -- SV-1
  ('b0000003-0001-0001-0000-000000000001', 'a0000003-0001-0000-0000-000000000001', 'multiple_choice',
   'How much do financial experts recommend keeping in an emergency fund?',
   '["1 week of expenses","1 month of expenses","3-6 months of living expenses","1 year of income"]'::jsonb,
   '3-6 months of living expenses',
   'An emergency fund of 3-6 months of living expenses provides a safety net for unexpected events like job loss or medical emergencies.',
   'SV-1', 'easy', 1, 1),

  ('b0000003-0001-0002-0000-000000000001', 'a0000003-0001-0000-0000-000000000001', 'true_false',
   'The "pay yourself first" strategy means spending on things you enjoy before saving.',
   '["True","False"]'::jsonb,
   'False',
   '"Pay yourself first" means setting aside savings BEFORE spending on anything else, ideally through automatic transfers on payday.',
   'SV-1', 'easy', 2, 1),

  -- SV-3
  ('b0000003-0003-0001-0000-000000000001', 'a0000003-0003-0000-0000-000000000001', 'multiple_choice',
   'How does compound interest differ from simple interest?',
   '["They are the same thing","Compound interest is always lower","Compound interest earns interest on both principal and previously earned interest","Simple interest grows faster"]'::jsonb,
   'Compound interest earns interest on both principal and previously earned interest',
   'Compound interest creates a snowball effect — you earn interest on your interest, causing your money to grow exponentially over time.',
   'SV-3', 'easy', 1, 1),

  ('b0000003-0003-0002-0000-000000000001', 'a0000003-0003-0000-0000-000000000001', 'fill_in',
   'Using the Rule of 72, how many years does it take to double your money at a 6% return rate?',
   '[]'::jsonb,
   '12',
   'Rule of 72: divide 72 by the interest rate. 72 / 6 = 12 years to double your money.',
   'SV-3', 'medium', 2, 1),

  -- SV-4
  ('b0000003-0004-0001-0000-000000000001', 'a0000003-0004-0000-0000-000000000001', 'multiple_choice',
   'What is a key feature of a Certificate of Deposit (CD)?',
   '["Unlimited withdrawals at any time","You lock your money in for a set period for a higher rate","No interest is earned","They are not FDIC insured"]'::jsonb,
   'You lock your money in for a set period for a higher rate',
   'CDs require you to keep your money deposited for a fixed term (3 months to 5 years) in exchange for a higher interest rate than regular savings.',
   'SV-4', 'easy', 1, 1),

  -- SV-5
  ('b0000003-0005-0001-0000-000000000001', 'a0000003-0005-0000-0000-000000000001', 'multiple_choice',
   'What is the main benefit of a Roth IRA?',
   '["Contributions are tax-deductible","Withdrawals in retirement are tax-free","No contribution limits","Employer matching"]'::jsonb,
   'Withdrawals in retirement are tax-free',
   'Roth IRA contributions are made with after-tax dollars, but all qualified withdrawals in retirement — including decades of growth — are completely tax-free.',
   'SV-5', 'medium', 1, 1)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- THEME 4: INVESTING
-- =====================================================================
INSERT INTO public.courses (id, slug, title, description, theme, age_tier, difficulty, estimated_minutes, order_index, standards_covered, is_published) VALUES
  ('c0000001-0000-0000-0000-000000000004', 'investing-fundamentals', 'Investing Fundamentals', 'Learn how investing works, the different types of investments, and how to assess risk to grow your wealth over time.', 'investing', '13_17', 'intermediate', 50, 4, ARRAY['IN-1','IN-2','IN-3','IN-4','IN-5'], true)
ON CONFLICT (id) DO NOTHING;

-- Lesson 1: Why Invest? (IN-1)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000004-0001-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000004', 'why-invest', 'Why Invest?', 'Understand the purpose of investing and how investors earn returns.', 'reading',
   '{"sections":[
     {"title":"Investing vs. Saving","body":"Saving is putting money aside in safe places (bank accounts). Investing means putting money into assets that can grow in value or generate income. Investing carries more risk than saving, but historically offers much higher returns over long periods.","type":"text"},
     {"title":"How Investors Make Money","body":"Investors earn returns in two main ways: capital gains (selling an asset for more than you paid) and regular income (interest from bonds, dividends from stocks, or rent from real estate). Some investments offer both.","type":"text"},
     {"title":"Growth Over Time","body":"If you invested $5,000 in a total stock market index fund 20 years ago, it would be worth roughly $20,000-$25,000 today, even after downturns. A savings account earning 0.5% would have grown to only about $5,500. That is the power of investing.","type":"example"},
     {"title":"Time Is Your Greatest Asset","body":"The earlier you start investing, the more time compound growth has to work. Even small amounts invested as a teen can grow substantially by retirement. You do not need a lot of money — many brokerages let you start with as little as $1.","type":"tip"}
   ]}'::jsonb, 10, 1, ARRAY['IN-1'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 2: Types of Investments (IN-2)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000004-0002-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000004', 'types-of-investments', 'Types of Investments', 'Explore the common asset classes available to investors.', 'reading',
   '{"sections":[
     {"title":"Stocks","body":"When you buy stock, you own a tiny piece of a company. If the company grows and profits increase, your stock generally gains value. Some stocks also pay dividends — regular cash payments to shareholders. Stocks have historically returned about 10% per year on average.","type":"text"},
     {"title":"Bonds","body":"A bond is a loan you make to a company or government. They pay you interest on a regular schedule and return your principal when the bond matures. Bonds are generally safer than stocks but offer lower returns. US Treasury bonds are among the safest investments.","type":"text"},
     {"title":"Other Asset Types","body":"Real estate (property), certificates of deposit (CDs), and commodities (gold, oil) are other common investments. Each has different risk levels, returns, and liquidity. Real estate is very relevant in Hawaii where property values have historically appreciated.","type":"example"},
     {"title":"Diversify","body":"Do not put all your eggs in one basket. Owning a mix of stocks, bonds, and other assets reduces your overall risk. If one investment loses value, others may gain, balancing your portfolio.","type":"tip"}
   ]}'::jsonb, 10, 2, ARRAY['IN-2'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 3: Mutual Funds & ETFs (IN-3)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000004-0003-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000004', 'mutual-funds-etfs', 'Mutual Funds & ETFs', 'How pooled investments make diversification easy and affordable.', 'reading',
   '{"sections":[
     {"title":"What Are Pooled Investments?","body":"Mutual funds and ETFs (Exchange-Traded Funds) pool money from many investors to buy a diversified collection of stocks, bonds, or other assets. Instead of buying individual stocks, you can own a tiny piece of hundreds or thousands of companies through a single fund.","type":"text"},
     {"title":"Mutual Funds vs. ETFs","body":"Mutual funds are priced once per day and often have minimum investment amounts. ETFs trade like stocks throughout the day and can be bought in single shares. Both offer instant diversification, but ETFs typically have lower fees.","type":"text"},
     {"title":"Index Funds","body":"An S&P 500 index fund owns shares of the 500 largest US companies. Instead of picking individual winners, you own a piece of all of them. Over the past 50 years, the S&P 500 has returned about 10% annually. Warren Buffett recommends index funds for most investors.","type":"example"},
     {"title":"Keep Fees Low","body":"Fund fees (expense ratios) eat into your returns over time. A fund charging 1% vs 0.03% could cost you tens of thousands over a lifetime. Look for low-cost index funds from providers like Vanguard, Fidelity, or Schwab.","type":"tip"}
   ]}'::jsonb, 10, 3, ARRAY['IN-3'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 4: Understanding Risk (IN-4)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000004-0004-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000004', 'understanding-risk', 'Understanding Risk', 'Different investments carry different levels of risk and potential reward.', 'reading',
   '{"sections":[
     {"title":"Risk and Return Are Related","body":"Generally, investments with higher potential returns also carry higher risk. Savings accounts are very safe but earn little. Stocks can earn a lot but can also lose value. This risk-return trade-off is fundamental to investing.","type":"text"},
     {"title":"The Risk Spectrum","body":"From lowest to highest risk: savings accounts, CDs, government bonds, corporate bonds, large-company stocks, small-company stocks, individual stocks, cryptocurrency. As risk increases, potential returns increase — but so does the chance of losing money.","type":"text"},
     {"title":"Market Downturns","body":"The stock market drops 10% or more roughly once per year, and 20% or more about every 3-5 years. But historically, it has always recovered and reached new highs. The 2020 crash dropped 34% in one month, then fully recovered in about 5 months. Patience is key.","type":"example"},
     {"title":"Never Invest Money You Cannot Afford to Lose","body":"Only invest money you will not need for at least 5 years. Short-term money (rent, emergency fund) belongs in savings accounts. Long-term money (retirement, future goals) can handle the ups and downs of investing.","type":"tip"}
   ]}'::jsonb, 10, 4, ARRAY['IN-4'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 5: Know Your Risk Tolerance (IN-5)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000004-0005-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000004', 'risk-tolerance', 'Know Your Risk Tolerance', 'How your personality and life situation affect how much risk you should take.', 'reading',
   '{"sections":[
     {"title":"What Is Risk Tolerance?","body":"Risk tolerance is how much investment loss you can handle — both financially and emotionally — without panicking and selling at the worst time. It depends on your personality, financial resources, investment experience, and life circumstances.","type":"text"},
     {"title":"Factors That Affect Risk Tolerance","body":"Young people with decades until retirement can typically take more risk (time to recover from losses). People with stable incomes and emergency funds can take more risk than those living paycheck to paycheck. Experience also matters — first-time investors often overestimate their tolerance until they see real losses.","type":"text"},
     {"title":"The Sleep Test","body":"A practical way to gauge risk tolerance: if your investments dropped 30% tomorrow, would you lose sleep? Would you panic-sell? If so, you probably have too much in risky investments. Your portfolio should let you sleep well at night while still growing toward your goals.","type":"example"},
     {"title":"Match Your Investments to Your Timeline","body":"Money needed in 1-2 years: savings account. Money needed in 3-5 years: mix of bonds and some stocks. Money needed in 10+ years: mostly stocks. Money for retirement 30+ years away: aggressive growth (heavy stocks). Adjust as your timeline shortens.","type":"tip"}
   ]}'::jsonb, 10, 5, ARRAY['IN-5'])
ON CONFLICT (id) DO NOTHING;

-- Quiz questions for Investing lessons
INSERT INTO public.quiz_questions (id, lesson_id, question_type, question_text, options, correct_answer, explanation, standard_code, difficulty, order_index, points) VALUES
  -- IN-1
  ('b0000004-0001-0001-0000-000000000001', 'a0000004-0001-0000-0000-000000000001', 'multiple_choice',
   'What are the two main ways investors earn returns?',
   '["Salary and tips","Capital gains and regular income (dividends/interest)","Rent and commission","Tax refunds and bonuses"]'::jsonb,
   'Capital gains and regular income (dividends/interest)',
   'Investors earn money through capital gains (selling an asset for more than they paid) and regular income like interest from bonds or dividends from stocks.',
   'IN-1', 'easy', 1, 1),

  -- IN-2
  ('b0000004-0002-0001-0000-000000000001', 'a0000004-0002-0000-0000-000000000001', 'drag_match',
   'Match each investment type with its description.',
   '[{"item":"Stock","match":"Ownership share in a company"},{"item":"Bond","match":"A loan you make to a company or government"},{"item":"Real Estate","match":"Physical property as an investment"}]'::jsonb,
   'all_matched',
   'Stocks represent ownership, bonds are loans you make, and real estate involves physical property investments.',
   'IN-2', 'medium', 1, 1),

  -- IN-3
  ('b0000004-0003-0001-0000-000000000001', 'a0000004-0003-0000-0000-000000000001', 'multiple_choice',
   'What is the main advantage of an index fund?',
   '["Guaranteed returns","Instant diversification at low cost","No risk of loss","Higher returns than any individual stock"]'::jsonb,
   'Instant diversification at low cost',
   'Index funds provide instant diversification by owning hundreds or thousands of stocks in a single fund, typically with very low fees.',
   'IN-3', 'easy', 1, 1),

  -- IN-4
  ('b0000004-0004-0001-0000-000000000001', 'a0000004-0004-0000-0000-000000000001', 'multiple_choice',
   'Which statement about investment risk is correct?',
   '["Higher risk always means higher returns","Lower risk investments guarantee you will not lose money","Higher potential returns generally come with higher risk","Risk and return are not related"]'::jsonb,
   'Higher potential returns generally come with higher risk',
   'The risk-return trade-off means investments with higher potential returns also carry higher risk of loss. Higher risk does not guarantee higher returns — it means higher potential returns.',
   'IN-4', 'medium', 1, 1),

  -- IN-5
  ('b0000004-0005-0001-0000-000000000001', 'a0000004-0005-0000-0000-000000000001', 'true_false',
   'Young people can generally take on more investment risk because they have more time to recover from losses.',
   '["True","False"]'::jsonb,
   'True',
   'Time is a key factor in risk tolerance. Young investors have decades for their investments to recover from downturns, making them better positioned to handle short-term volatility.',
   'IN-5', 'easy', 1, 1)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- THEME 5: MANAGING CREDIT
-- =====================================================================
INSERT INTO public.courses (id, slug, title, description, theme, age_tier, difficulty, estimated_minutes, order_index, standards_covered, is_published) VALUES
  ('c0000001-0000-0000-0000-000000000005', 'managing-credit-101', 'Managing Credit 101', 'Understand how credit works, how to build and maintain a good credit score, and how to use debt wisely.', 'managing_credit', '13_17', 'intermediate', 50, 5, ARRAY['MC-1','MC-2','MC-3','MC-4','MC-5'], true)
ON CONFLICT (id) DO NOTHING;

-- Lesson 1: Interest Rates & Fees (MC-1)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000005-0001-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000005', 'interest-rates-and-fees', 'Interest Rates & Fees', 'How interest rates and fees vary by lender and credit type.', 'reading',
   '{"sections":[
     {"title":"What Is Interest on Credit?","body":"When you borrow money, the lender charges you interest — a fee for using their money. Interest rates are expressed as an annual percentage rate (APR). The rate you get depends on the lender type, the type of credit, your credit score, and current market conditions.","type":"text"},
     {"title":"Types of Lenders","body":"Banks, credit unions, online lenders, and payday lenders all offer credit at different rates. Credit unions often have the lowest rates. Payday lenders charge the highest — sometimes over 400% APR! In Hawaii, the military community should be especially careful of predatory lenders near bases.","type":"text"},
     {"title":"Rate Comparison","body":"For a $1,000 loan: a credit union might charge 8% APR ($80/year in interest), a credit card averages 22% APR ($220/year), and a payday lender could charge 400% APR ($4,000/year!). The same amount borrowed can cost wildly different amounts depending on the lender.","type":"example"},
     {"title":"Always Compare Rates","body":"Never accept the first loan offer. Shop around and compare APR, fees (origination, late payment, prepayment), and total cost of the loan. Even a 1-2% difference in APR can save hundreds or thousands over the life of a loan.","type":"tip"}
   ]}'::jsonb, 10, 1, ARRAY['MC-1'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 2: Debt & Your Finances (MC-2)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000005-0002-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000005', 'debt-and-your-finances', 'Debt & Your Finances', 'How borrowing affects your overall financial health.', 'reading',
   '{"sections":[
     {"title":"Good Debt vs. Bad Debt","body":"Not all debt is equal. ''Good debt'' funds things that increase in value or earning potential (education, home mortgage). ''Bad debt'' funds things that lose value (credit card spending on wants, payday loans). But even good debt becomes bad if you borrow more than you can repay.","type":"text"},
     {"title":"The Debt Trap","body":"Minimum payments on credit cards can keep you in debt for decades. A $3,000 credit card balance at 22% APR with minimum payments takes over 10 years to pay off, and you will pay over $3,500 in interest — more than the original amount!","type":"text"},
     {"title":"Debt-to-Income Ratio","body":"Lenders use your debt-to-income ratio (monthly debt payments / monthly gross income) to evaluate you. Most recommend keeping it under 36%. If you earn $3,000/month, your total debt payments should be under $1,080. In Hawaii, this can be challenging with high housing costs.","type":"example"},
     {"title":"Avoid Debt When Possible","body":"Before borrowing, ask: Can I wait and save for this instead? Do I truly need it? Can I afford the monthly payments? If you must borrow, use the lowest-rate option available and pay more than the minimum.","type":"tip"}
   ]}'::jsonb, 10, 2, ARRAY['MC-2'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 3: Paying for College (MC-3)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000005-0003-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000005', 'paying-for-college', 'Paying for College', 'Explore all the ways to fund your post-secondary education.', 'reading',
   '{"sections":[
     {"title":"The Cost of Education","body":"Post-secondary education — college, trade school, or certification programs — is an investment in your future. But it can be expensive. Understanding all funding sources helps minimize how much you need to borrow.","type":"text"},
     {"title":"Free Money First","body":"Scholarships (merit-based, need-based, community-based) and grants (like Federal Pell Grants) are free money that does not need to be repaid. Hawaii-specific scholarships include the Hawaii Community Foundation scholarships, Kamehameha Schools financial aid, and UH merit awards. Always apply for FAFSA!","type":"text"},
     {"title":"Work-Study and Savings","body":"Federal Work-Study provides part-time jobs for students with financial need. Working during college helps reduce borrowing. If you saved during high school ($50/month for 4 years = $2,400), that covers books for all four years at UH.","type":"example"},
     {"title":"If You Must Borrow","body":"Choose federal student loans before private loans — they have lower rates, income-based repayment options, and potential forgiveness programs. Never borrow more than your expected first-year salary after graduation. Research your field''s average starting salary before deciding how much to borrow.","type":"tip"}
   ]}'::jsonb, 10, 3, ARRAY['MC-3'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 4: Understanding Credit Scores (MC-4)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000005-0004-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000005', 'credit-scores', 'Understanding Credit Scores', 'What credit scores mean and how they are calculated.', 'reading',
   '{"sections":[
     {"title":"What Is a Credit Score?","body":"A credit score is a three-digit number (300-850) that represents how risky you are as a borrower. Lenders use it to decide whether to lend you money and what interest rate to charge. Higher scores mean lower risk and better rates.","type":"text"},
     {"title":"The Five Factors","body":"Your FICO score is based on: Payment history (35%) — do you pay on time? Credit utilization (30%) — how much of your available credit are you using? Length of credit history (15%) — how long have your accounts been open? Credit mix (10%) — do you have different types of credit? New credit inquiries (10%) — have you applied for lots of credit recently?","type":"text"},
     {"title":"Score Ranges","body":"300-579: Poor. 580-669: Fair. 670-739: Good. 740-799: Very Good. 800-850: Excellent. The average American score is about 715. A score above 740 typically gets you the best rates. Even a 50-point improvement can save thousands on a mortgage.","type":"example"},
     {"title":"Build Credit Early","body":"You can start building credit as a teen by becoming an authorized user on a parent''s card, or getting a secured credit card at 18. Always pay on time (even if it is just the minimum), keep balances low (under 30% of your limit), and do not close old accounts.","type":"tip"}
   ]}'::jsonb, 10, 4, ARRAY['MC-4'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 5: Credit Beyond Lending (MC-5)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000005-0005-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000005', 'credit-beyond-lending', 'Credit Beyond Lending', 'How your credit report affects much more than borrowing.', 'reading',
   '{"sections":[
     {"title":"Not Just for Loans","body":"Your credit report and score are used by many people beyond lenders. Landlords, employers, insurance companies, and utility providers all may check your credit. A poor credit history can affect many areas of your life.","type":"text"},
     {"title":"Who Checks Your Credit","body":"Landlords check credit before approving rental applications — crucial in Hawaii''s competitive rental market. Many employers check credit for job applicants, especially in finance and government positions. Insurance companies may use credit-based scores to set your premiums.","type":"text"},
     {"title":"Hawaii Rental Market","body":"In Hawaii''s tight rental market, landlords often receive many applications for each unit. A good credit score can be the deciding factor. Some landlords in Honolulu require scores above 650-700 just to be considered. Poor credit might mean higher security deposits or being passed over entirely.","type":"example"},
     {"title":"Monitor Your Credit","body":"Check your credit report for free at AnnualCreditReport.com — you are entitled to one free report from each bureau (Equifax, Experian, TransUnion) per year. Look for errors and dispute any inaccuracies immediately. Many credit card companies also offer free credit score monitoring.","type":"tip"}
   ]}'::jsonb, 10, 5, ARRAY['MC-5'])
ON CONFLICT (id) DO NOTHING;

-- Quiz questions for Managing Credit lessons
INSERT INTO public.quiz_questions (id, lesson_id, question_type, question_text, options, correct_answer, explanation, standard_code, difficulty, order_index, points) VALUES
  -- MC-1
  ('b0000005-0001-0001-0000-000000000001', 'a0000005-0001-0000-0000-000000000001', 'multiple_choice',
   'Which type of lender typically charges the highest interest rates?',
   '["Credit unions","Banks","Online lenders","Payday lenders"]'::jsonb,
   'Payday lenders',
   'Payday lenders can charge over 400% APR, making them the most expensive borrowing option. Credit unions typically offer the lowest rates.',
   'MC-1', 'easy', 1, 1),

  -- MC-2
  ('b0000005-0002-0001-0000-000000000001', 'a0000005-0002-0000-0000-000000000001', 'true_false',
   'Making only minimum payments on a credit card can keep you in debt for over 10 years.',
   '["True","False"]'::jsonb,
   'True',
   'Minimum payments mostly cover interest, not principal. A $3,000 balance at 22% APR with minimum payments can take over 10 years to repay, with interest exceeding the original balance.',
   'MC-2', 'easy', 1, 1),

  -- MC-3
  ('b0000005-0003-0001-0000-000000000001', 'a0000005-0003-0000-0000-000000000001', 'multiple_choice',
   'What should you apply for FIRST when funding college?',
   '["Private student loans","Credit cards","FAFSA (for grants and federal aid)","Payday loans"]'::jsonb,
   'FAFSA (for grants and federal aid)',
   'Always apply for free money first — FAFSA determines eligibility for Pell Grants, federal loans (lower rates), and work-study. Scholarships and grants do not need to be repaid.',
   'MC-3', 'easy', 1, 1),

  -- MC-4
  ('b0000005-0004-0001-0000-000000000001', 'a0000005-0004-0000-0000-000000000001', 'multiple_choice',
   'Which factor has the BIGGEST impact on your FICO credit score?',
   '["Length of credit history (15%)","Credit mix (10%)","Payment history (35%)","New credit inquiries (10%)"]'::jsonb,
   'Payment history (35%)',
   'Payment history — whether you pay your bills on time — is the single most important factor at 35% of your FICO score.',
   'MC-4', 'easy', 1, 1),

  ('b0000005-0004-0002-0000-000000000001', 'a0000005-0004-0000-0000-000000000001', 'multiple_choice',
   'What credit score range is generally considered "Good"?',
   '["300-579","580-669","670-739","800-850"]'::jsonb,
   '670-739',
   'FICO score ranges: 300-579 (Poor), 580-669 (Fair), 670-739 (Good), 740-799 (Very Good), 800-850 (Excellent).',
   'MC-4', 'medium', 2, 1),

  -- MC-5
  ('b0000005-0005-0001-0000-000000000001', 'a0000005-0005-0000-0000-000000000001', 'multiple_choice',
   'Besides lenders, who might check your credit report?',
   '["Only banks","Landlords, employers, and insurance companies","No one else can access it","Only the government"]'::jsonb,
   'Landlords, employers, and insurance companies',
   'Credit reports are used by landlords (rental applications), employers (job applications), insurance companies (premium setting), and utility providers — not just lenders.',
   'MC-5', 'easy', 1, 1)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- THEME 6: MANAGING RISK
-- =====================================================================
INSERT INTO public.courses (id, slug, title, description, theme, age_tier, difficulty, estimated_minutes, order_index, standards_covered, is_published) VALUES
  ('c0000001-0000-0000-0000-000000000006', 'managing-risk', 'Managing Risk', 'Learn how to protect yourself financially through insurance, public safety nets, and identity theft prevention.', 'managing_risk', '13_17', 'intermediate', 50, 6, ARRAY['MR-1','MR-2','MR-3','MR-4','MR-5'], true)
ON CONFLICT (id) DO NOTHING;

-- Lesson 1: Financial Risks (MR-1)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000006-0001-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000006', 'financial-risks', 'Financial Risks', 'Unexpected events can threaten your financial well-being.', 'reading',
   '{"sections":[
     {"title":"Life Is Unpredictable","body":"Unexpected events — illness, accidents, natural disasters, job loss, theft — can damage your health, income, property, and future opportunities. Financial risk management is about preparing for these possibilities so they do not devastate your finances.","type":"text"},
     {"title":"Types of Financial Risks","body":"Health risks (medical emergencies, disability), property risks (car accidents, home damage), income risks (job loss, economic downturns), liability risks (lawsuits, accidents you cause), and premature death. Each type requires different protective strategies.","type":"text"},
     {"title":"Hawaii-Specific Risks","body":"Hawaii faces unique risks: hurricanes, volcanic activity, flooding, tsunamis, and high cost of living during emergencies. Hurricane Iniki in 1992 caused $3 billion in damage. Having insurance and emergency savings is especially important in Hawaii where rebuilding costs are higher than the mainland.","type":"example"},
     {"title":"Build Your Safety Net","body":"The best defense against financial risk is layered: emergency fund (3-6 months expenses), appropriate insurance coverage, diversified income sources, and staying healthy. Start with the emergency fund — it is your first line of defense.","type":"tip"}
   ]}'::jsonb, 10, 1, ARRAY['MR-1'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 2: Insurance Basics (MR-2)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000006-0002-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000006', 'insurance-basics', 'Insurance Basics', 'Some insurance is required by law — understand your obligations.', 'reading',
   '{"sections":[
     {"title":"What Is Insurance?","body":"Insurance transfers financial risk from you to an insurance company. You pay a premium (monthly or annual fee), and in return, the insurer pays for covered losses. It protects you from catastrophic financial hits.","type":"text"},
     {"title":"Mandatory Insurance","body":"Some insurance is required by law. In Hawaii, auto liability insurance is mandatory — you must carry at least $20,000 per person / $40,000 per accident bodily injury, and $10,000 property damage. Driving without it is illegal and can result in fines, license suspension, and personal liability.","type":"text"},
     {"title":"Hawaii Auto Insurance","body":"Hawaii''s minimum auto insurance is called 20/40/10. This means up to $20,000 per person injured, $40,000 total per accident for injuries, and $10,000 for property damage. Most financial advisors recommend higher limits, especially in Hawaii where medical costs are above average.","type":"example"},
     {"title":"Do Not Skip Insurance","body":"Insurance feels like wasted money — until you need it. One car accident, one medical emergency, or one natural disaster can cost tens or hundreds of thousands of dollars. Insurance premiums are the cost of financial peace of mind.","type":"tip"}
   ]}'::jsonb, 10, 2, ARRAY['MR-2'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 3: Health Insurance (MR-3)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000006-0003-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000006', 'health-insurance', 'Health Insurance', 'Understanding health insurance and its role as an employee benefit.', 'reading',
   '{"sections":[
     {"title":"Why Health Insurance Matters","body":"Health insurance covers medically necessary care — doctor visits, hospital stays, prescriptions, surgery, and preventive care. Without it, a single medical emergency can cost tens of thousands of dollars and lead to financial ruin.","type":"text"},
     {"title":"Key Terms","body":"Premium: monthly payment for coverage. Deductible: amount you pay before insurance kicks in. Copay: fixed amount per visit ($20-$50). Coinsurance: your percentage after deductible (e.g., you pay 20%, insurer pays 80%). Out-of-pocket maximum: most you will pay in a year.","type":"text"},
     {"title":"Hawaii''s Prepaid Health Care Act","body":"Hawaii is unique — it was the first state to require employers to provide health insurance to employees working 20+ hours/week (since 1974). This is called the Prepaid Health Care Act. It means most working Hawaii residents have employer-sponsored health insurance, making Hawaii one of the states with the highest insured rates.","type":"example"},
     {"title":"Stay on Parents'' Plan","body":"Under the ACA (Affordable Care Act), you can stay on your parents'' health insurance until age 26. This is often the cheapest option for young adults. If you do not have access to employer or parent coverage, check the Hawaii Health Connector marketplace.","type":"tip"}
   ]}'::jsonb, 10, 3, ARRAY['MR-3'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 4: Public Safety Net Programs (MR-4)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000006-0004-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000006', 'public-safety-nets', 'Public Safety Net Programs', 'Government programs that protect against financial hardship.', 'reading',
   '{"sections":[
     {"title":"The Social Safety Net","body":"The government provides programs to help people during financial hardship. These are funded by taxes and exist to prevent extreme poverty, hunger, and lack of medical care. They are not charity — they are part of the social contract.","type":"text"},
     {"title":"Key Programs","body":"Unemployment Insurance (UI) provides temporary income if you lose your job through no fault of your own. Medicaid provides health coverage for low-income individuals. Medicare provides health coverage for people 65 and older. SNAP (food stamps) helps with food costs. Social Security Disability Insurance (SSDI) provides income for those unable to work due to disability.","type":"text"},
     {"title":"Hawaii-Specific Programs","body":"Hawaii offers additional support: the Hawaii General Assistance program, Hawaii Med-QUEST (Medicaid), and Temporary Assistance for Needy Families (TANF). Hawaii''s unemployment insurance replaces about 50% of wages for up to 26 weeks. The state also has rental assistance programs given the high housing costs.","type":"example"},
     {"title":"Know Your Resources","body":"If you ever face financial hardship, do not be afraid to use these programs — that is what they are designed for. Many people use them temporarily during tough times. Contact 211 (dial 2-1-1) in Hawaii to connect with local assistance programs.","type":"tip"}
   ]}'::jsonb, 10, 4, ARRAY['MR-4'])
ON CONFLICT (id) DO NOTHING;

-- Lesson 5: Identity Theft & Online Safety (MR-5)
INSERT INTO public.lessons (id, course_id, slug, title, description, lesson_type, content, duration_minutes, order_index, standards_covered) VALUES
  ('a0000006-0005-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000006', 'identity-theft', 'Identity Theft & Online Safety', 'Protect yourself from identity theft and online fraud.', 'reading',
   '{"sections":[
     {"title":"What Is Identity Theft?","body":"Identity theft occurs when someone steals your personal information (Social Security number, credit card numbers, bank details) and uses it to commit fraud. They can open accounts in your name, make purchases, file fake tax returns, or even get medical care using your identity.","type":"text"},
     {"title":"How It Happens","body":"Common methods: phishing emails/texts that trick you into sharing info, data breaches at companies that have your data, skimming devices on ATMs, stolen mail, unsecured Wi-Fi, oversharing on social media, and poor document safeguarding (throwing away bank statements without shredding).","type":"text"},
     {"title":"Online Shopping Risks","body":"In Hawaii, where online shopping is common due to limited local retail options, the risks are amplified. Fake websites mimicking local businesses, phishing emails about package deliveries (especially around the holidays), and unsecured public Wi-Fi at beaches and coffee shops are all common attack vectors.","type":"example"},
     {"title":"Protect Yourself","body":"Use strong, unique passwords for every account. Enable two-factor authentication (2FA). Never share your SSN unless absolutely necessary. Monitor bank and credit card statements regularly. Shred sensitive documents. Do not click links in unexpected emails or texts. Use a VPN on public Wi-Fi. Freeze your credit if you are not actively applying for credit.","type":"tip"}
   ]}'::jsonb, 10, 5, ARRAY['MR-5'])
ON CONFLICT (id) DO NOTHING;

-- Quiz questions for Managing Risk lessons
INSERT INTO public.quiz_questions (id, lesson_id, question_type, question_text, options, correct_answer, explanation, standard_code, difficulty, order_index, points) VALUES
  -- MR-1
  ('b0000006-0001-0001-0000-000000000001', 'a0000006-0001-0000-0000-000000000001', 'multiple_choice',
   'What is the best first step in protecting yourself from financial risk?',
   '["Buy stocks","Build an emergency fund of 3-6 months expenses","Get a credit card","Buy a house"]'::jsonb,
   'Build an emergency fund of 3-6 months expenses',
   'An emergency fund is your first line of defense against unexpected financial setbacks. It provides immediate cash without needing to borrow or sell investments.',
   'MR-1', 'easy', 1, 1),

  -- MR-2
  ('b0000006-0002-0001-0000-000000000001', 'a0000006-0002-0000-0000-000000000001', 'multiple_choice',
   'What does Hawaii''s minimum auto insurance "20/40/10" mean?',
   '["20% deductible, 40% copay, 10% coinsurance","$20/month, $40 deductible, $10 copay","$20K per person, $40K per accident bodily injury, $10K property damage","20 days coverage, 40 visits, 10 claims"]'::jsonb,
   '$20K per person, $40K per accident bodily injury, $10K property damage',
   'Hawaii requires minimum auto liability of $20,000 per person injured, $40,000 total per accident for injuries, and $10,000 for property damage.',
   'MR-2', 'medium', 1, 1),

  -- MR-3
  ('b0000006-0003-0001-0000-000000000001', 'a0000006-0003-0000-0000-000000000001', 'true_false',
   'Hawaii was the first state to require employers to provide health insurance to employees.',
   '["True","False"]'::jsonb,
   'True',
   'Hawaii passed the Prepaid Health Care Act in 1974, making it the first state to require employer-sponsored health insurance for employees working 20+ hours per week.',
   'MR-3', 'medium', 1, 1),

  ('b0000006-0003-0002-0000-000000000001', 'a0000006-0003-0000-0000-000000000001', 'multiple_choice',
   'Until what age can you stay on your parents'' health insurance under the ACA?',
   '["18","21","26","30"]'::jsonb,
   '26',
   'The Affordable Care Act allows young adults to remain on their parents'' health insurance plan until they turn 26, regardless of student status or marital status.',
   'MR-3', 'easy', 2, 1),

  -- MR-4
  ('b0000006-0004-0001-0000-000000000001', 'a0000006-0004-0000-0000-000000000001', 'drag_match',
   'Match each program with what it provides.',
   '[{"item":"Unemployment Insurance","match":"Temporary income after job loss"},{"item":"Medicaid","match":"Health coverage for low-income individuals"},{"item":"SNAP","match":"Help with food costs"}]'::jsonb,
   'all_matched',
   'UI provides temporary income, Medicaid covers health care for low-income people, and SNAP (food stamps) assists with food purchases.',
   'MR-4', 'medium', 1, 1),

  -- MR-5
  ('b0000006-0005-0001-0000-000000000001', 'a0000006-0005-0000-0000-000000000001', 'multiple_choice',
   'Which of these is a common way identity thieves steal personal information?',
   '["Reading public news articles","Phishing emails that trick you into sharing info","Watching TV commercials","Asking your teacher"]'::jsonb,
   'Phishing emails that trick you into sharing info',
   'Phishing emails impersonate trusted organizations (banks, government, delivery services) to trick you into revealing passwords, credit card numbers, or other personal information.',
   'MR-5', 'easy', 1, 1),

  ('b0000006-0005-0002-0000-000000000001', 'a0000006-0005-0000-0000-000000000001', 'multiple_choice',
   'What should you do to protect yourself on public Wi-Fi?',
   '["Share your password with friends","Use a VPN (Virtual Private Network)","Post your location on social media","Log into your bank account"]'::jsonb,
   'Use a VPN (Virtual Private Network)',
   'Public Wi-Fi networks are often unsecured, making it easy for hackers to intercept your data. A VPN encrypts your connection, keeping your information safe.',
   'MR-5', 'easy', 2, 1)
ON CONFLICT (id) DO NOTHING;

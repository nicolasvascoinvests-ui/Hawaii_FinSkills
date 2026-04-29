# Hawaii_Client — Financial Literacy Educational App

A mobile educational application teaching financial literacy to teens and adults in Hawaiʻi. Built with React Native + Supabase. Uses a spec-driven development workflow with automated verification at every step.

**Audience**: Teens (14–17) and Adults (18+). Minimum registration age is 14.
**Purpose**: Interactive financial literacy courses — budgeting, saving, investing, credit, taxes, and money management
**Compliance**: FERPA (student data), Section 508/ADA, Hawaii state privacy laws. (COPPA does not apply — app is 14+.)
**Note**: This app is NOT affiliated with or endorsed by the Hawaiʻi Department of Education. It teaches the same financial literacy program standards (released August 2025) that schools use for the PTP graduation requirement, but it is an independent product.

---

## Tech Stack

- **Framework**: React Native (Expo) with TypeScript
- **State Management**: Zustand + React Query (TanStack Query)
- **Navigation**: React Navigation (stack, tab, drawer)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Supabase (BaaS — Auth, Database, Realtime, Storage, Edge Functions)
- **Database**: PostgreSQL (via Supabase) + SQLite (local offline cache via expo-sqlite)
- **Auth**: Supabase Auth (email/password)
- **Testing**: Jest + React Native Testing Library + Detox (E2E)
- **CI/CD**: EAS Build + EAS Submit (Expo Application Services)
- **Linting**: ESLint + Prettier + TypeScript strict mode
- **Analytics**: PostHog or Supabase Analytics (privacy-first, no PII in events)
- **Push Notifications**: Expo Notifications + Supabase Edge Functions
- **Offline Storage**: expo-sqlite + MMKV for key-value, Supabase offline sync

---

## Code Quality

- Write clean, readable code with meaningful variable and function names
- Keep functions small and focused on a single responsibility
- Avoid over-engineering — only build what's needed now
- Don't add comments for self-explanatory code

## Workflow

- Always read existing code before modifying it
- Test changes before considering them done
- Prefer editing existing files over creating new ones
- When unsure, ask rather than guess

## Communication

- Be concise and direct
- Lead with the answer, not the reasoning
- Only explain when the logic isn't obvious

---

## Frontend / Mobile Conventions

### Component Patterns
- Use functional components with hooks
- Keep components small and composable
- Separate logic from presentation where it improves clarity
- Co-locate styles, tests, and types with their components
- Use a screen/component hierarchy: `screens/` for full pages, `components/` for reusable pieces

### Styling
- Use a mobile-first responsive approach
- Follow a consistent spacing and color system (design tokens)
- Ensure accessible contrast ratios and touch target sizes (min 44x44 pts)
- Support both light and dark themes from the start

### Performance
- Lazy load screens and heavy components
- Optimize images (WebP, proper sizing, caching)
- Minimize bundle size — avoid unnecessary dependencies
- Use FlatList/SectionList for long scrollable lists (never ScrollView for dynamic data)
- Memoize expensive computations and component renders

### Mobile-Specific
- Handle offline states gracefully (cache educational content locally)
- Respect platform conventions (iOS vs Android patterns)
- Handle keyboard avoidance, safe areas, and notches properly
- Support accessibility features (VoiceOver, TalkBack, dynamic text sizing)
- Request permissions gracefully with clear explanations

---

## Backend Conventions

### API Design
- Use RESTful conventions (or GraphQL if specified)
- Return consistent response shapes with proper status codes
- Validate all input at the API boundary
- Handle errors gracefully with meaningful error messages

### Database
- Use migrations for schema changes
- Index frequently queried columns
- Never trust user input in queries — use parameterized queries

---

## Code Style

### Formatting
- Prettier for formatting, ESLint for linting
- 2-space indentation
- Single quotes for strings

### Naming Conventions
- Variables and functions: camelCase
- Components: PascalCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case for utilities, PascalCase for components
- Screen files: PascalCase with `Screen` suffix (e.g., `HomeScreen.tsx`)

### TypeScript
- Prefer `interface` over `type` for object shapes
- Use strict mode — no `any`
- Use `unknown` or proper generics instead of `any`
- Define types for all API responses, navigation params, and component props

### Git
- Write concise commit messages in imperative mood
- Keep commits focused on a single change
- Branch naming: `feature/`, `fix/`, `chore/` prefixes

---

## Security Practices

### Authentication
- Hash passwords with bcrypt, scrypt, or Argon2 — never MD5 or SHA-1
- Use short-lived JWTs (15 min access, 7-day refresh) or secure server-side sessions
- Invalidate tokens/sessions on password change, logout, and account compromise
- Lock accounts after repeated failed login attempts

### Authorization
- Check permissions server-side on every request — never rely on client-side checks
- Deny by default — explicitly grant access, never implicitly allow
- Validate resource ownership (user A cannot access user B's data)

### API Security
- Rate limit all endpoints: strict on auth routes, moderate on API
- Return `429 Too Many Requests` with `Retry-After` header when limits are hit
- Require API keys or auth tokens for all non-public endpoints

### Input Validation
- Validate all input server-side with a schema validator (Zod, Joi, Pydantic)
- Use parameterized queries or ORM methods — never concatenate user input into SQL
- Escape or sanitize all user content before rendering (prevent XSS)
- Validate file uploads: restrict types, scan for malware, store outside webroot

### Data Protection
- Encrypt data at rest (AES-256) and in transit (TLS 1.2+)
- Never store secrets, API keys, or credentials in code or version control
- Minimize PII collection — only collect what the feature requires
- Use `.gitignore` to exclude `.env`, key files, and credential stores

### Mobile Security
- Store sensitive data in secure storage (Keychain/Keystore), never AsyncStorage
- Implement certificate pinning for API calls
- Obfuscate release builds
- Never log sensitive data (tokens, passwords, PII)
- Validate deep links and universal links to prevent hijacking

---

## Hawaiʻi Financial Literacy Program Standards (August 2025)

All course content, lessons, quizzes, and interactive tools in this app **must align** to the Hawaiʻi Financial Literacy Program Standards (released August 2025). These are derived from the 2021 National Standards for Personal Finance Education (Council for Economic Education + Jump$tart Coalition). The source document is at `Financial-Literacy-Standards.pdf` in the project root.

### How Financial Literacy Fits Into Graduation Requirements
- **PTP (Personal Transition Plan)** is the central mechanism — a required **0.5-credit course** where financial literacy completion is tracked
- Financial literacy is **NOT a separate credit** — it is documented within the PTP requirement
- Schools have flexible delivery: standalone courses, integration into existing courses, or **self-paced learning**
- **This app targets the "self-paced learning" delivery model** — students complete the full financial literacy path here, and educators use the app's reports to sign off on PTP requirements
- **Critical app output**: standards coverage reports and per-standard mastery documentation that educators can attach to a student's PTP file (no completion certificate is issued by the app)
- National standards reference: https://www.jumpstart.org/education/national-standards/

### Standard Codes & Themes (30 standards across 6 themes)

Every course, lesson, and quiz must map to one or more standard codes. Themes do NOT need to be taught in order.

#### Theme 1: Earning Income (EI)
| Code | Standard |
|------|----------|
| EI-1 | Net income (take-home pay) = wages/salaries minus taxes and payroll deductions |
| EI-2 | Compensation includes wages, salaries, commissions, tips, bonuses, plus benefits (health insurance, retirement plans, education reimbursement) |
| EI-3 | Opportunity cost of additional training/education vs future earning potential |
| EI-4 | Economic conditions, technology, and labor market changes affect income and career opportunities |
| EI-5 | Retirement income sources: continued employment, Social Security, employer plans, personal investments |

#### Theme 2: Spending (SP)
| Code | Standard |
|------|----------|
| SP-1 | Price, peer pressure, advertising, and others' choices influence purchase decisions |
| SP-2 | Budgets help make informed spending/saving decisions to achieve financial goals |
| SP-3 | Informed purchases require evaluating price, product claims, and quality from multiple sources |
| SP-4 | Housing decisions depend on preferences, circumstances, costs — impact financial well-being |
| SP-5 | Federal/state consumer protection (FTC, CFPB, Consumer Affairs) helps avoid fraud and unfair practices |

#### Theme 3: Saving (SV)
| Code | Standard |
|------|----------|
| SV-1 | People save for large purchases, education, retirement, and emergencies |
| SV-2 | Savings decisions depend on individual preferences/circumstances |
| SV-3 | Compound interest vs simple interest (interest on principal + previously earned interest) |
| SV-4 | Account types: savings accounts, money market accounts, CDs — with varying rates, fees, deposit insurance |
| SV-5 | Tax policies (pretax savings, tax-deferred interest, IRAs) incentivize saving |

#### Theme 4: Investing (IN)
| Code | Standard |
|------|----------|
| IN-1 | Investors expect capital gains and/or regular income (interest, dividends) |
| IN-2 | Common assets: CDs, stocks, bonds, mutual funds, real estate |
| IN-3 | Pooled investments (mutual funds, ETFs) as alternative to individual securities |
| IN-4 | Different investments carry different degrees of risk |
| IN-5 | Risk tolerance depends on personality, resources, experience, life circumstances |

#### Theme 5: Managing Credit (MC)
| Code | Standard |
|------|----------|
| MC-1 | Interest rates and fees vary by lender type, credit type, and market conditions |
| MC-2 | Borrowing increases debt and can negatively affect finances |
| MC-3 | Post-secondary education funded through scholarships, grants, loans, work-study, savings |
| MC-4 | Credit score = numeric rating assessing credit risk based on credit report |
| MC-5 | Credit reports/scores used by landlords, employers, insurance companies — not just lenders |

#### Theme 6: Managing Risk (MR)
| Code | Standard |
|------|----------|
| MR-1 | Unexpected events can damage health, wealth, income, property, future opportunities |
| MR-2 | Some insurance coverage is mandatory (e.g., auto liability) |
| MR-3 | Health insurance covers medically necessary care; may be offered as employee benefit |
| MR-4 | Public insurance programs (unemployment insurance, Medicaid, Medicare) protect against hardship |
| MR-5 | Online transactions and poor document safeguarding create vulnerability to identity theft and fraud |

### Standards-to-Content Mapping Rules
- Every course must declare which standard codes it covers via `standards_covered` field
- Every lesson must tag its primary standard code(s)
- Quiz questions must map to specific standards for analytics (which standards are students mastering vs struggling with)
- The educator dashboard must show standards coverage: which standards a class has/hasn't covered
- Progress tracking must report per-standard mastery, not just per-course completion
- All 30 standards must be coverable through available courses (no gaps)

### Sample Learning Outcomes (use as exercise/quiz templates)
- **EI**: Identify payroll deductions, evaluate employee benefits, assess education ROI, discuss labor market impacts, describe retirement income sources
- **SP**: Analyze purchase influences, create budgets, evaluate product information, compare renting vs buying (Hawaii-specific), investigate consumer fraud
- **IN**: Explain capital gains vs income investments, define asset types, compare mutual funds vs individual securities, rank investments by risk, assess risk tolerance
- **SV**: Create savings plans (1yr/5yr/10yr), explain compound vs simple interest, compare account types, explain IRA/Roth IRA/education savings incentives
- **MC**: Compare lenders by rates/fees, predict debt consequences, describe education funding sources, explain credit score impacts, explain non-lender uses of credit reports
- **MR**: Describe financial impact of unexpected events, research mandatory insurance (Hawaii auto liability), compare health insurance costs, discuss public safety nets, identify identity theft vectors

---

## Financial Literacy App — Domain Rules

### Content & Learning
- Structure courses in progressive difficulty: Beginner -> Intermediate -> Advanced
- **All content must align to the Hawaiʻi Financial Literacy Standards (6 themes, 30 standards above)**
- Age-tiered content delivery:
  - **Teens (14–17)**: Budgeting, bank accounts, part-time job income, credit basics, avoiding scams. Interactive simulations. Cover all 6 themes with teen-appropriate depth
  - **Adults (18+)**: Investing, taxes, retirement (401k/IRA), credit scores, mortgages, debt management, Hawaii cost-of-living specifics. Full coverage of all 30 standards
- Support multiple learning modalities (visual, text, interactive, audio)
- Track learner progress persistently (local + cloud sync)
- Implement spaced repetition for financial concept retention
- Provide immediate feedback on exercises and quizzes
- Include real-world Hawaii-specific scenarios (housing costs, state taxes, local economy)
- Track per-standard mastery in addition to per-course progress

### Interactive Financial Tools
- Budget calculator/simulator (age-appropriate) — covers SP-2, SP-3
- Savings goal tracker with compound interest visualization — covers SV-1, SV-3
- Credit score simulator (teens/adults) — covers MC-4, MC-5
- Investment growth calculator (adults) — covers IN-1, IN-4, IN-5
- "Life simulation" scenarios — make financial decisions, see outcomes — covers multiple standards
- Quiz engine with multiple question types (multiple choice, drag-and-drop, fill-in, matching)
- Paycheck/net income calculator — covers EI-1, EI-2
- Insurance cost comparison tool — covers MR-2, MR-3

### User Roles & Permissions
- **Student**: Takes courses, completes exercises, tracks personal progress
- **Teacher/Educator**: Assigns courses, views class progress, manages student groups
- **Admin**: Manages content, views aggregate analytics, manages educators
- Role-based access enforced server-side via Supabase RLS policies

### Accessibility (Mandatory — Section 508/ADA)
- WCAG 2.1 AA compliance minimum (target AAA where feasible)
- Support screen readers (VoiceOver/TalkBack) with proper accessibility labels
- Support dynamic text sizing (respect system font scale up to 200%)
- Ensure color is never the only means of conveying information
- Keyboard/switch navigation must work for all interactive elements
- Provide captions for audio/video content
- All financial charts and graphs must have text alternatives
- Touch targets minimum 48x48 dp (Android) / 44x44 pt (iOS)
- Support reduced motion preferences

### Compliance Requirements (Non-Negotiable)

#### Minimum Age — 14+
- Age gate at registration rejects anyone under 14 years old based on birth year
- No COPPA obligations apply; no parental consent flow is collected
- Keep the age gate strict — do not lower without legal review

#### FERPA (Student Education Records)
- All student progress data is an education record — restrict access
- Only authorized school officials (teachers, admins) can view student records
- Parents have right to inspect and request correction of records
- No disclosure of student data to third parties without consent
- Maintain audit log of all data access
- Data breach notification procedures must be in place

#### Section 508 / ADA
- All features must be usable with assistive technology
- Voluntary Product Accessibility Template (VPAT) should be producible
- Regular accessibility audits required

### Offline Support
- Cache course content and lesson materials for offline access
- Queue quiz answers and progress updates, sync when online
- Show clear offline/online status indicators
- Financial calculators must work fully offline
- Gracefully degrade features when offline (disable leaderboards, sync indicators)

### Gamification & Engagement
- Progress tracking with visual indicators (progress bars, streaks, completion %)
- Achievement/badge system for financial milestones ("First Budget Created", "Savings Streak x7")
- Leaderboards — opt-in only, no real names for minors by default
- Push notifications for study reminders (user-controlled, off by default for teens)
- Daily/weekly financial challenges
- Points system that does NOT involve real money or create gambling-like mechanics

---

## Execution System: Get Shit Done (GSD)

This project uses the GSD framework for all planning, execution, and verification. The framework lives in `frameworks/get-shit-done/`.

### How Work Gets Done

**Phase 1: GSD Drives the Work**
- All planning, research, phased execution, and building flows through GSD
- GSD handles: roadmapping, phase planning, code execution, atomic commits, state management

**Phase 2: Subagents Verify & QA**
- Once GSD finalizes work, verification subagents review, audit, and verify output
- Nothing is considered done until appropriate subagents have signed off

**In short: GSD builds it, subagents check it.**

### Available GSD Agents
| Agent | Role |
|-------|------|
| `gsd-roadmapper` | Creates project roadmaps with phase breakdown |
| `gsd-project-researcher` | Researches domain ecosystem before roadmap |
| `gsd-phase-researcher` | Researches how to implement a phase |
| `gsd-research-synthesizer` | Synthesizes research outputs |
| `gsd-planner` | Creates executable phase plans with tasks |
| `gsd-plan-checker` | Verifies plans before execution |
| `gsd-executor` | Executes plans with atomic commits |
| `gsd-codebase-mapper` | Explores and maps the codebase |
| `gsd-debugger` | Investigates bugs using scientific method |
| `gsd-verifier` | Verifies phase goals are met |
| `gsd-nyquist-auditor` | Fills validation gaps with tests |
| `gsd-ui-researcher` | Produces UI-SPEC design contracts |
| `gsd-ui-checker` | Validates UI against design specs |
| `gsd-ui-auditor` | Retroactive visual audit of UI code |
| `gsd-integration-checker` | Verifies cross-phase integration |

---

## Automatic Verification Pipeline

After GSD completes any phase or task, the following verification agents run **automatically** — no manual invocation needed. Nothing is considered done until all relevant agents have signed off.

### Run Order (most critical first)

| Order | Agent | What It Checks | When It Runs |
|-------|-------|----------------|--------------|
| 1 | **security-auditor** | Auth flows, token storage, API security, input validation, secure storage usage, certificate pinning, deep link validation | Every change |
| 2 | **code-reviewer** | TypeScript strict compliance, React Native best practices, component patterns, hook usage, state management, naming conventions | Every change |
| 3 | **error-detective** | Null states, network failures, offline edge cases, race conditions, memory leaks, navigation edge cases, keyboard conflicts | Every change |
| 4 | **performance-engineer** | FlatList optimization, image caching, bundle size, render cycles, memory usage, animation frame drops, startup time | Every change |
| 5 | **accessibility-tester** | WCAG 2.1 AA, VoiceOver/TalkBack labels, touch targets (44x44pt min), dynamic text scaling, color contrast, screen reader navigation | Every change |
| 6 | **test-automator** | Generate unit tests (Jest + RNTL), integration tests, E2E tests (Detox), validate logic, check coverage >= 80% | Every change |
| 7 | **gsd-verifier** | Post-execution quality checks, ensures phase output meets spec, validates learning objectives are met | Every change |
| 8 | **gsd-ui-checker** | Validates UI components match design specs, responsive layouts, theme support, platform consistency | UI changes |
| 9 | **gsd-integration-checker** | API integration, auth flow, data sync, offline/online transitions, push notification delivery | Integration changes |
| 10 | **architect-reviewer** | Clean architecture layers, dependency direction, module boundaries, scalability patterns | Structural changes |
| 11 | **ux-researcher** | Learning flow usability, navigation clarity, content readability, engagement mechanics, onboarding friction | UI/UX changes |
| 12 | **compliance-auditor** | FERPA (student education records), Section 508/ADA, Hawaii state privacy laws, data retention policies, 14+ age gate | Every change |
| 13 | **penetration-tester** | Auth bypass attempts, injection attacks, API abuse, local storage tampering, deep link hijacking | Pre-launch |
| Last | **debugger** | Investigates and fixes bugs flagged by any agent above | When issues are flagged |

### Pipeline Rules
- Agents 1-7 and 12 (compliance) run on **every** change — no exceptions (FERPA compliance is critical)
- Agents 8-11 run based on change type (UI, integration, structural, UX)
- Penetration tester runs pre-launch and on auth/data changes
- Debugger runs last, only when other agents flag issues
- If any agent flags a critical issue, GSD must fix it before proceeding
- The pipeline runs again after fixes to verify resolution

---

## Available Subagents (72 total)

### Core Development
`mobile-developer` `frontend-developer` `fullstack-developer` `ui-designer` `api-designer` `backend-developer` `websocket-engineer`

### Language Specialists
`react-specialist` `typescript-pro` `javascript-pro` `flutter-expert` `kotlin-specialist` `swift-expert` `python-pro` `nextjs-developer` `sql-pro`

### Quality & Security
`accessibility-tester` `architect-reviewer` `code-reviewer` `debugger` `error-detective` `penetration-tester` `performance-engineer` `qa-expert` `security-auditor` `test-automator` `compliance-auditor`

### Data & AI
`ai-engineer` `data-analyst` `database-optimizer` `postgres-pro` `prompt-engineer`

### Developer Experience
`build-engineer` `dependency-manager` `documentation-engineer` `dx-optimizer` `git-workflow-manager` `refactoring-specialist` `tooling-engineer`

### Specialized Domains
`mobile-app-developer` `game-developer` `seo-specialist` `api-documenter`

### Business & Product
`product-manager` `project-manager` `ux-researcher` `technical-writer` `business-analyst`

### Meta & Orchestration
`multi-agent-coordinator` `workflow-orchestrator` `context-manager` `error-coordinator` `task-distributor` `performance-monitor`

### Research & Analysis
`research-analyst` `competitive-analyst` `search-specialist`

### GSD Framework (15 agents)
`gsd-codebase-mapper` `gsd-debugger` `gsd-executor` `gsd-integration-checker` `gsd-nyquist-auditor` `gsd-phase-researcher` `gsd-plan-checker` `gsd-planner` `gsd-project-researcher` `gsd-research-synthesizer` `gsd-roadmapper` `gsd-ui-auditor` `gsd-ui-checker` `gsd-ui-researcher` `gsd-verifier`

---

## Available Skills

### Workflow (Always Active)
- **Superpowers** — Spec-driven planning, TDD, subagent-driven development, debugging, code review
- **GSD Framework** — Full execution system with 15 agents

### Frontend & Design
- **frontend-design** — Production-grade frontend interfaces
- **motion** — Animations, transitions, gestures (Motion/Framer Motion)
- **ui-ux-pro-max** — 67 styles, 161 palettes, 57 font pairings, 99 UX guidelines, supports React Native
- **playground** — Interactive explorers and visual tools
- **web-artifacts-builder** — Complex multi-component artifacts
- **webapp-testing** — Playwright-based frontend testing

### Backend & Integrations
- **claude-api** — Claude API / Anthropic SDK integration
- **mcp-builder** — MCP server creation for external APIs

### DevTools
- **claude-automation-recommender** — Analyze codebase for automation opportunities
- **claude-md-improver** — Audit and improve CLAUDE.md files

### ECC Cherry-Picks (in `.claude/skills/ecc/`)
- **frontend-patterns** — React component composition, hooks, state management, performance
- **coding-standards** — TypeScript/React naming, immutability, async patterns, type safety
- **security-review** — Input validation, auth, XSS, CSRF, dependency security
- **tdd-workflow** — Test-driven development with Jest/Vitest
- **api-design** — REST conventions, pagination, filtering, auth patterns
- **e2e-testing** — Playwright E2E patterns (adaptable for Detox)
- **android-clean-architecture** — Clean architecture layers (adaptable for React Native)
- **verification-loop** — Verification and checkpoint patterns
- **blueprint** — Project blueprinting and architecture
- **search-first** — Research-first development methodology

### ECC Agents (in `.claude/skills/ecc/agents/`)
- **typescript-reviewer** — TypeScript type safety, async correctness, React patterns
- **code-reviewer** — General code quality review
- **security-reviewer** — Security audit automation
- **tdd-guide** — TDD coaching and guidance
- **architect** — Architecture review and planning
- **refactor-cleaner** — Code refactoring guidance

### ECC Commands (in `.claude/skills/ecc/commands/`)
`/code-review` `/tdd` `/verify` `/plan` `/quality-gate` `/test-coverage`

---

## Project Structure (Recommended)

```
Hawaii_Client/
├── CLAUDE.md                      # This file
├── frameworks/
│   └── get-shit-done/             # GSD execution framework
├── .claude/
│   ├── skills/                    # All skills (12 packages + ECC cherry-picks)
│   └── agents/                    # 72 subagents
├── supabase/
│   ├── migrations/                # Database migrations (SQL)
│   ├── functions/                 # Supabase Edge Functions (Deno/TypeScript)
│   ├── seed.sql                   # Seed data (sample courses, test users)
│   └── config.toml                # Supabase local config
├── src/
│   ├── app/                       # App entry, providers, navigation config
│   ├── navigation/                # Stack, tab, drawer navigators
│   ├── screens/
│   │   ├── auth/                  # Login, Register, ParentalConsent, AgeGate
│   │   ├── onboarding/            # Welcome, age selection, profile setup
│   │   ├── home/                  # Dashboard, course catalog, daily challenge
│   │   ├── courses/               # Course list, lesson view, quiz, results
│   │   ├── tools/                 # Budget calculator, savings tracker, credit sim
│   │   ├── progress/              # Progress dashboard, achievements, streaks
│   │   ├── profile/               # User profile, settings, accessibility prefs
│   │   ├── parent/                # Parent dashboard, child progress, consent mgmt
│   │   └── educator/              # Teacher dashboard, class mgmt, assignments
│   ├── components/
│   │   ├── ui/                    # Base UI primitives (Button, Card, Input, etc.)
│   │   ├── education/             # LessonCard, QuizQuestion, ProgressBar, etc.
│   │   ├── financial/             # BudgetChart, SavingsGoal, CreditMeter, etc.
│   │   └── charts/                # Accessible chart components (with text alts)
│   ├── hooks/                     # Custom hooks (useAuth, useCourse, useOffline, etc.)
│   ├── services/
│   │   ├── supabase.ts            # Supabase client init
│   │   ├── auth.ts                # Auth service (age-gated flows)
│   │   ├── courses.ts             # Course/lesson CRUD
│   │   ├── progress.ts            # Progress tracking
│   │   ├── offline.ts             # Offline sync manager
│   │   └── notifications.ts       # Push notification service
│   ├── stores/                    # Zustand stores (auth, courses, progress, ui)
│   ├── types/                     # TypeScript types (User, Course, Lesson, Quiz, etc.)
│   ├── utils/                     # Helpers (formatCurrency, ageCheck, validators)
│   ├── constants/                 # Config, age tiers, financial formulas
│   ├── assets/                    # Images, fonts, Lottie animations, icons
│   └── i18n/                      # Internationalization (English + Hawaiian language support)
├── e2e/                           # Detox E2E tests
├── app.json                       # Expo config
├── eas.json                       # EAS Build config
├── tsconfig.json
├── package.json
└── .env.example                   # Environment variable template (Supabase URL, anon key, etc.)
```

---

## Supabase Schema (Core Tables)

```
users              — id, email, role (student|parent|educator|admin), age_tier, created_at
profiles           — user_id, display_name, avatar_url, age_tier, school_id, grade_level
parental_consents  — id, child_id, parent_id, consent_given, consent_date, consent_method
courses            — id, title, description, age_tier, category, difficulty, order, is_published, standards_covered (text[] — e.g., ['EI-1','EI-2','SP-2'])
lessons            — id, course_id, title, content_json, lesson_type, order, duration_minutes, standards_covered (text[] — primary standards this lesson teaches)
quizzes            — id, lesson_id, questions_json, passing_score, max_attempts
quiz_questions     — id, quiz_id, question_json, standard_code (text — maps question to specific financial literacy standard)
user_progress      — id, user_id, lesson_id, status (not_started|in_progress|completed), score, completed_at
standard_mastery   — id, user_id, standard_code, mastery_level (0-100), attempts, last_assessed_at
achievements       — id, user_id, badge_type, earned_at, metadata
educator_classes   — id, educator_id, name, school_id, join_code
class_enrollments  — id, class_id, student_id, enrolled_at
assigned_courses   — id, class_id, course_id, due_date, assigned_by
audit_log          — id, user_id, action, resource_type, resource_id, timestamp, ip_address
```

All tables use Supabase Row Level Security (RLS) policies. Students see only their own data. Parents see their linked children. Educators see their class students. Admins see all. Audit log is append-only, accessible only to admins.

---

## Getting Started

1. Initialize the Expo project: `npx create-expo-app@latest . --template`
2. Install core dependencies:
   - `@react-navigation/native` + navigators
   - `zustand` + `@tanstack/react-query`
   - `nativewind` + `tailwindcss`
   - `@supabase/supabase-js`
   - `expo-secure-store` (token storage)
   - `expo-sqlite` (offline cache)
   - `react-native-mmkv` (fast key-value)
   - `expo-notifications`
3. Set up Supabase project (local dev with `supabase init` + `supabase start`)
4. Run GSD roadmapper to plan the project phases
5. Follow the GSD workflow: research -> plan -> execute -> verify
6. After each phase, the verification pipeline runs automatically

### Suggested Phase Order
1. **Auth & Onboarding** — 14+ age gate, registration, password reset, Supabase Auth
2. **Core Navigation** — Tab navigator, stack navigators, role-based routing
3. **Course Engine** — Course/lesson data model, content rendering, progress tracking
4. **Quiz System** — Question types, scoring, immediate feedback, retry logic
5. **Financial Tools** — Budget calculator, savings tracker, credit simulator
6. **Gamification** — Achievements, streaks, points, age-appropriate leaderboards
7. **Educator Dashboard** — Class management, assignments, progress reports
8. **Offline Support** — Content caching, progress sync, offline calculators
9. **Accessibility Audit** — Section 508 compliance pass, VPAT preparation
10. **Security & Compliance** — Penetration testing, FERPA audit, data review
11. **Polish & Launch** — Performance optimization, app store assets, final review

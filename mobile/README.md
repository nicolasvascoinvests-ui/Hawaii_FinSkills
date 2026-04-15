# FinSkill Path — Native Mobile App

Hawaiʻi DOE financial literacy app for the Personal Transition Plan (PTP) requirement. Native React Native + Expo build, targeting iOS App Store and Google Play Store.

## Scope

Covers all **30 content standards** across **6 themes** from the Hawaiʻi DOE Financial Literacy Program Standards (released August 2025):

- **Earning Income** (EI-1…EI-5)
- **Spending** (SP-1…SP-5)
- **Saving** (SV-1…SV-5)
- **Investing** (IN-1…IN-5)
- **Managing Credit** (MC-1…MC-5)
- **Managing Risk** (MR-1…MR-5)

## Tech Stack

- **Framework**: Expo SDK 54 + React Native 0.81 + React 19
- **Language**: TypeScript (strict)
- **Styling**: NativeWind (Tailwind for React Native) with Lovable design tokens
- **Navigation**: React Navigation v7 (native stack + bottom tabs)
- **State**: React Query (server) + React Context (auth)
- **Animation**: Moti + Reanimated + expo-linear-gradient
- **Backend**: Supabase (Auth + Postgres + RLS), same project as the web reference
- **Secure storage**: expo-secure-store for session tokens on iOS/Android
- **PDF**: expo-print for PTP completion certificates
- **Testing**: Jest + jest-expo
- **Build**: EAS Build (Expo Application Services)

## Project Layout

```
mobile/
├── App.tsx                    Root providers (Query, Auth, SafeArea, Gestures)
├── app.json                   Expo config — bundle IDs, icons, plugins
├── eas.json                   EAS Build profiles (dev / preview / production)
├── babel.config.js            NativeWind + Reanimated plugin
├── metro.config.js            NativeWind metro wiring
├── tailwind.config.js         Design tokens ported from Lovable
├── global.css                 Tailwind entry
├── src/
│   ├── lib/
│   │   ├── standards.ts       30 DOE standards × 6 themes
│   │   ├── supabase.ts        Supabase client with secure-store adapter
│   │   ├── generateCertificate.ts   PTP certificate via expo-print
│   │   ├── auditLog.ts        FERPA audit helper
│   │   └── format.ts          Currency / percent formatters
│   ├── hooks/
│   │   ├── useAuth.tsx        Auth context
│   │   ├── useProfile.ts      Profile query + mutation
│   │   └── useMastery.ts      Per-standard mastery aggregation
│   ├── components/
│   │   ├── Screen.tsx         SafeArea + ScrollView shell
│   │   ├── Button.tsx         5 variants, 3 sizes, loading state
│   │   ├── Input.tsx          Labeled text input with error/hint
│   │   ├── Select.tsx         Bottom-sheet style picker
│   │   ├── Card.tsx           Elevation card
│   │   ├── ProgressRing.tsx   SVG circular progress
│   │   └── ToolShell.tsx      Shared header for tool screens
│   ├── screens/
│   │   ├── WelcomeScreen.tsx
│   │   ├── AuthScreen.tsx     Age gate enforced before signup
│   │   ├── OnboardingScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── LearnScreen.tsx
│   │   ├── CourseScreen.tsx
│   │   ├── LessonScreen.tsx
│   │   ├── QuizScreen.tsx     Multiple choice, fill-in, drag-match, 1h cooldown
│   │   ├── ToolsScreen.tsx
│   │   ├── ProgressScreen.tsx Per-standard mastery + certificate download
│   │   ├── ProfileScreen.tsx
│   │   ├── EducatorDashboardScreen.tsx
│   │   └── tools/
│   │       ├── PaycheckCalculatorScreen.tsx
│   │       ├── BudgetBuilderScreen.tsx
│   │       ├── SavingsGoalTrackerScreen.tsx
│   │       ├── InvestmentSimulatorScreen.tsx
│   │       ├── CreditScoreSimulatorScreen.tsx
│   │       └── InsuranceEstimatorScreen.tsx
│   ├── navigation/
│   │   ├── types.ts           Typed param lists
│   │   ├── RootNavigator.tsx  Auth gate + onboarding gate
│   │   └── MainTabs.tsx       Bottom tab navigator
│   ├── types/database.ts      Supabase table types
│   └── __tests__/             Jest tests (standards + format)
└── supabase/
    └── audit_log.sql          FERPA audit log migration
```

## Getting Started

```bash
npm install
npm start          # Expo dev server
npm run ios        # iOS simulator (macOS only)
npm run android    # Android emulator
npm test           # Jest test suite
npm run typecheck  # TypeScript strict check
```

To run on a physical device, install the Expo Go app and scan the QR code from `npm start`.

## Auth & Onboarding Flow

1. Welcome screen → Auth screen
2. Sign-up requires birth year. Users under 14 are blocked with an age-gate error.
3. First sign-in routes to Onboarding (name, school, grade level).
4. After onboarding, the main tab navigator unlocks.

## Quiz System

- Multiple choice, fill-in-the-blank, and drag-match questions.
- Per-lesson cooldown of 1 hour between attempts (configurable in `QuizScreen.tsx`).
- On submission, correct answers advance the per-standard mastery level by 25 points (0–100 scale). A standard is considered "mastered" at ≥80.

## Supabase Backend

This app uses the **same Supabase project** as the Lovable web reference — project ID `iaplydyacbvunxvjpujv`. All schema, RLS policies, and existing content (courses, lessons, quizzes) are shared.

Before shipping, apply the FERPA audit log migration at `supabase/audit_log.sql`.

## Store Submission (when ready)

Bundle identifiers are pre-configured in `app.json`:

- **iOS**: `edu.hawaii.doe.finskillpath`
- **Android**: `edu.hawaii.doe.finskillpath`

To build for submission:

```bash
npx eas login
npx eas build:configure         # First-time only, sets projectId
npx eas build --platform ios --profile production
npx eas build --platform android --profile production
```

Requires an Apple Developer account ($99/yr) and Google Play Console ($25 one-time) before the builds can actually submit.

## Accessibility

All interactive elements have `accessibilityRole` and `accessibilityLabel`. Screens use `SafeAreaView` with proper edge handling. Color contrast meets WCAG 2.1 AA on the Lovable design palette. Touch targets are 44×44pt minimum (iOS) / 48×48dp (Android).

## Compliance

- **Minimum age 14**: age gate at signup rejects anyone under 14. COPPA does not apply.
- **FERPA**: student progress data is an education record. RLS policies enforce that students see only their own records, educators see only their class members. Append-only audit log migration included.
- **Section 508 / ADA**: accessibility pass applied throughout.

## Reference

The original Lovable-generated web app lives at `../finskill-path/` as a design and behavioral reference. **Do not ship the web app** — it is not in scope for the DOE deliverable.

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

export type RootStackParamList = {
  Welcome: undefined;
  Auth: undefined;
  EmailConfirmation: { email: string };
  ForgotPassword: undefined;
  ResetPassword: undefined;
  Onboarding: undefined;
  Main: undefined;
  Course: { courseId: string };
  Lesson: { lessonId: string };
  Quiz: { lessonId: string };
  PaycheckCalculator: undefined;
  BudgetBuilder: undefined;
  SavingsGoalTracker: undefined;
  InvestmentSimulator: undefined;
  CreditScoreSimulator: undefined;
  InsuranceEstimator: undefined;
  EducatorDashboard: undefined;
  BudgetBlitz: undefined;
  MythBuster: undefined;
  MoneySort: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Learn: { standard?: string } | undefined;
  Tools: undefined;
  Games: undefined;
  Progress: undefined;
  Profile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

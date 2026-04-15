import { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import type { RootStackParamList } from './types';

import WelcomeScreen from '../screens/WelcomeScreen';
import AuthScreen from '../screens/AuthScreen';
import EmailConfirmationScreen from '../screens/EmailConfirmationScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import MainTabs from './MainTabs';
import CourseScreen from '../screens/CourseScreen';
import LessonScreen from '../screens/LessonScreen';
import QuizScreen from '../screens/QuizScreen';
import PaycheckCalculatorScreen from '../screens/tools/PaycheckCalculatorScreen';
import BudgetBuilderScreen from '../screens/tools/BudgetBuilderScreen';
import SavingsGoalTrackerScreen from '../screens/tools/SavingsGoalTrackerScreen';
import InvestmentSimulatorScreen from '../screens/tools/InvestmentSimulatorScreen';
import CreditScoreSimulatorScreen from '../screens/tools/CreditScoreSimulatorScreen';
import InsuranceEstimatorScreen from '../screens/tools/InsuranceEstimatorScreen';
import EducatorDashboardScreen from '../screens/EducatorDashboardScreen';
import BudgetBlitzScreen from '../screens/games/BudgetBlitzScreen';
import MythBusterScreen from '../screens/games/MythBusterScreen';
import MoneySortScreen from '../screens/games/MoneySortScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking = {
  prefixes: [Linking.createURL('/'), 'finskillpath://'],
  config: {
    screens: {
      ResetPassword: 'reset-password',
      Auth: 'auth',
    },
  },
};

function LoadingGate() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator color="#0B5E8C" size="large" />
    </View>
  );
}

function extractRecoveryParams(url: string): { access_token: string; refresh_token: string } | null {
  // Tokens can arrive in either the URL fragment (#) or the query string (?)
  // depending on platform / Supabase redirect. Try both.
  const hashPart = url.split('#')[1] ?? '';
  const queryPart = url.split('?')[1]?.split('#')[0] ?? '';
  for (const raw of [hashPart, queryPart]) {
    if (!raw) continue;
    const params = new URLSearchParams(raw);
    if (params.get('type') !== 'recovery') continue;
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    if (access_token && refresh_token) return { access_token, refresh_token };
  }
  return null;
}

async function handleRecoveryUrl(url: string): Promise<boolean> {
  const parsed = Linking.parse(url);
  const path = parsed.path ?? '';
  if (!path.includes('reset-password')) return false;

  const tokens = extractRecoveryParams(url);
  if (!tokens) return false;

  const { error } = await supabase.auth.setSession(tokens);
  if (error) return false;
  return true;
}

export default function RootNavigator() {
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const navRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    const activateRecovery = () => {
      setRecoveryMode(true);
      navRef.current?.reset({ index: 0, routes: [{ name: 'ResetPassword' }] });
    };

    Linking.getInitialURL().then((url) => {
      if (url)
        handleRecoveryUrl(url).then((ok) => {
          if (ok) activateRecovery();
        });
    });
    const sub = Linking.addEventListener('url', ({ url }) => {
      handleRecoveryUrl(url).then((ok) => {
        if (ok) activateRecovery();
      });
    });

    const { data: authSub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        activateRecovery();
      }
      if (event === 'SIGNED_OUT') {
        setRecoveryMode(false);
      }
    });

    return () => {
      sub.remove();
      authSub.subscription.unsubscribe();
    };
  }, []);

  if (authLoading || (user && !recoveryMode && profileLoading)) {
    return <LoadingGate />;
  }

  return (
    <NavigationContainer ref={navRef} linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {recoveryMode ? (
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        ) : !user ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="EmailConfirmation" component={EmailConfirmationScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : !profile?.onboarding_completed ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Course" component={CourseScreen} />
            <Stack.Screen name="Lesson" component={LessonScreen} />
            <Stack.Screen name="Quiz" component={QuizScreen} />
            <Stack.Screen name="PaycheckCalculator" component={PaycheckCalculatorScreen} />
            <Stack.Screen name="BudgetBuilder" component={BudgetBuilderScreen} />
            <Stack.Screen name="SavingsGoalTracker" component={SavingsGoalTrackerScreen} />
            <Stack.Screen name="InvestmentSimulator" component={InvestmentSimulatorScreen} />
            <Stack.Screen name="CreditScoreSimulator" component={CreditScoreSimulatorScreen} />
            <Stack.Screen name="InsuranceEstimator" component={InsuranceEstimatorScreen} />
            <Stack.Screen name="EducatorDashboard" component={EducatorDashboardScreen} />
            <Stack.Screen name="BudgetBlitz" component={BudgetBlitzScreen} />
            <Stack.Screen name="MythBuster" component={MythBusterScreen} />
            <Stack.Screen name="MoneySort" component={MoneySortScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

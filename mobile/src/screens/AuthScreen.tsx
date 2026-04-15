import { useState } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { MotiView } from 'moti';
import { ArrowLeft } from 'lucide-react-native';
import Screen from '../components/Screen';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../hooks/useAuth';
import { signInSchema, signUpSchema, firstError } from '../lib/validation';
import type { RootStackScreenProps } from '../navigation/types';

export default function AuthScreen({ navigation }: RootStackScreenProps<'Auth'>) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();

  const handleSubmit = async () => {
    setError('');

    let trimmedEmail = email.trim();
    let ageTier: '13_17' | '18_plus' | undefined;
    let birthYearNum: number | undefined;

    if (mode === 'signup') {
      const parsed = signUpSchema.safeParse({
        email,
        password,
        birthYear: parseInt(birthYear, 10),
      });
      if (!parsed.success) return setError(firstError(parsed.error.issues));
      trimmedEmail = parsed.data.email;
      birthYearNum = parsed.data.birthYear;
      const age = new Date().getFullYear() - birthYearNum;
      ageTier = age < 18 ? '13_17' : '18_plus';
    } else {
      const parsed = signInSchema.safeParse({ email, password });
      if (!parsed.success) return setError(firstError(parsed.error.issues));
      trimmedEmail = parsed.data.email;
    }

    setLoading(true);
    try {
      const { error: authError } =
        mode === 'signup'
          ? await signUp(trimmedEmail, password, { age_tier: ageTier, birth_year: birthYearNum })
          : await signIn(trimmedEmail, password);
      if (authError) {
        setError(authError.message);
      } else if (mode === 'signup') {
        navigation.replace('EmailConfirmation', { email: trimmedEmail });
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="p-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            className="flex-row items-center self-start px-2 py-2"
          >
            <ArrowLeft color="#676D76" size={18} />
            <Text className="text-muted-foreground ml-1">Back</Text>
          </Pressable>
        </View>

        <View className="flex-1 justify-center px-6 pb-12">
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="w-full max-w-sm self-center"
          >
            <View className="items-center mb-8">
              <Text className="text-2xl font-bold text-foreground">
                {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
              </Text>
              <Text className="text-muted-foreground text-sm mt-1">
                {mode === 'signup'
                  ? 'Start your financial literacy journey'
                  : 'Continue your learning'}
              </Text>
            </View>

            <View className="gap-4">
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="student@hawaii.edu"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="10+ chars, mixed case, number"
                secureTextEntry
                autoComplete={mode === 'signup' ? 'password-new' : 'password'}
                textContentType={mode === 'signup' ? 'newPassword' : 'password'}
              />

              {mode === 'signup' && (
                <Input
                  label="Birth Year"
                  value={birthYear}
                  onChangeText={setBirthYear}
                  placeholder="e.g. 2008"
                  keyboardType="number-pad"
                  maxLength={4}
                  hint="Required for age verification"
                />
              )}

              {error ? (
                <Text className="text-destructive text-sm" accessibilityLiveRegion="polite">
                  {error}
                </Text>
              ) : null}

              <Button onPress={handleSubmit} loading={loading} fullWidth size="lg">
                {mode === 'signup' ? 'Create Account' : 'Sign In'}
              </Button>

              {mode === 'login' && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Forgot password"
                  onPress={() => navigation.navigate('ForgotPassword')}
                  className="self-center mt-1"
                >
                  <Text className="text-primary text-sm font-medium">Forgot password?</Text>
                </Pressable>
              )}
            </View>

            <View className="items-center mt-6 flex-row justify-center">
              <Text className="text-muted-foreground text-sm">
                {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setMode(mode === 'signup' ? 'login' : 'signup');
                  setError('');
                }}
              >
                <Text className="text-primary font-medium text-sm">
                  {mode === 'signup' ? 'Sign in' : 'Sign up'}
                </Text>
              </Pressable>
            </View>
          </MotiView>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

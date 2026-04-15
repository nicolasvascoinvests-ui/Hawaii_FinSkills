import { useState } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { MotiView } from 'moti';
import { ArrowLeft, Mail } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import Screen from '../components/Screen';
import Button from '../components/Button';
import Input from '../components/Input';
import { supabase } from '../lib/supabase';
import { forgotPasswordSchema, firstError } from '../lib/validation';
import type { RootStackScreenProps } from '../navigation/types';

export default function ForgotPasswordScreen({
  navigation,
}: RootStackScreenProps<'ForgotPassword'>) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    setError('');
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) return setError(firstError(parsed.error.issues));
    setLoading(true);
    try {
      // Linking.createURL resolves to `exp://…/reset-password` in Expo Go
      // and `finskillpath://reset-password` in a standalone build, so the
      // email link always opens back into the right app.
      const redirectTo = Linking.createURL('/reset-password');
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo,
      });
      if (resetError) {
        setError(resetError.message);
      } else {
        setSent(true);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Screen scroll={false}>
        <View className="p-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to sign in"
            onPress={() => navigation.navigate('Auth')}
            className="flex-row items-center self-start px-2 py-2"
          >
            <ArrowLeft color="#676D76" size={18} />
            <Text className="text-muted-foreground ml-1">Back</Text>
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-8 w-full max-w-sm items-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 24,
              elevation: 8,
            }}
          >
            <View className="bg-primary/10 rounded-full p-4 mb-4">
              <Mail color="#0B5E8C" size={40} />
            </View>
            <Text className="text-xl font-bold text-card-foreground mb-2 text-center">
              Check Your Email
            </Text>
            <Text className="text-muted-foreground text-sm text-center mb-6">
              If an account exists for {email.trim()}, we sent a password reset link. Tap the link
              in the email to choose a new password.
            </Text>
            <Button variant="primary" fullWidth size="lg" onPress={() => navigation.navigate('Auth')}>
              Back to Sign In
            </Button>
          </MotiView>
        </View>
      </Screen>
    );
  }

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
              <Text className="text-2xl font-bold text-foreground">Reset Password</Text>
              <Text className="text-muted-foreground text-sm mt-1 text-center">
                Enter your email and we'll send you a link to reset your password.
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

              {error ? (
                <Text className="text-destructive text-sm" accessibilityLiveRegion="polite">
                  {error}
                </Text>
              ) : null}

              <Button onPress={handleSubmit} loading={loading} fullWidth size="lg">
                Send Reset Link
              </Button>
            </View>
          </MotiView>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

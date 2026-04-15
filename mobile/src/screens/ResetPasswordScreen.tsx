import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { MotiView } from 'moti';
import { CheckCircle2 } from 'lucide-react-native';
import Screen from '../components/Screen';
import Button from '../components/Button';
import Input from '../components/Input';
import { supabase } from '../lib/supabase';
import { resetPasswordSchema, firstError } from '../lib/validation';
import type { RootStackScreenProps } from '../navigation/types';

export default function ResetPasswordScreen({
  navigation,
}: RootStackScreenProps<'ResetPassword'>) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    setError('');
    const parsed = resetPasswordSchema.safeParse({ password, confirm });
    if (!parsed.success) return setError(firstError(parsed.error.issues));

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      await supabase.auth.signOut({ scope: 'global' });
      setDone(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <Screen scroll={false}>
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
              <CheckCircle2 color="#0B5E8C" size={40} />
            </View>
            <Text className="text-xl font-bold text-card-foreground mb-2 text-center">
              Password Updated
            </Text>
            <Text className="text-muted-foreground text-sm text-center mb-6">
              Your password has been reset. Please sign in with your new password. We signed you
              out of other devices for safety.
            </Text>
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Auth' }] })}
            >
              Go to Sign In
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
        <View className="flex-1 justify-center px-6 pb-12">
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="w-full max-w-sm self-center"
          >
            <View className="items-center mb-8">
              <Text className="text-2xl font-bold text-foreground">Choose a New Password</Text>
              <Text className="text-muted-foreground text-sm mt-1 text-center">
                Make it strong — at least 10 characters, mixed case, and a number.
              </Text>
            </View>

            <View className="gap-4">
              <Input
                label="New Password"
                value={password}
                onChangeText={setPassword}
                placeholder="10+ chars, mixed case, number"
                secureTextEntry
                autoComplete="password-new"
                textContentType="newPassword"
              />
              <Input
                label="Confirm Password"
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Re-enter new password"
                secureTextEntry
                autoComplete="password-new"
                textContentType="newPassword"
              />

              {error ? (
                <Text className="text-destructive text-sm" accessibilityLiveRegion="polite">
                  {error}
                </Text>
              ) : null}

              <Button onPress={handleSubmit} loading={loading} fullWidth size="lg">
                Update Password
              </Button>
            </View>
          </MotiView>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

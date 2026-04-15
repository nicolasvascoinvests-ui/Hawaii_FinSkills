import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react-native';
import Screen from '../components/Screen';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import type { RootStackScreenProps } from '../navigation/types';

export default function EmailConfirmationScreen({
  route,
  navigation,
}: RootStackScreenProps<'EmailConfirmation'>) {
  const { email } = route.params;
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    setResending(true);
    setError('');
    setResent(false);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (resendError) {
        setError(resendError.message);
      } else {
        setResent(true);
      }
    } catch {
      setError('Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <Screen scroll={false}>
      <View className="p-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back to sign in"
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

          <Text className="text-muted-foreground text-sm text-center mb-2">
            We sent a confirmation link to
          </Text>
          <Text className="text-foreground font-semibold text-sm text-center mb-4">
            {email}
          </Text>
          <Text className="text-muted-foreground text-sm text-center mb-6">
            Tap the link in the email to verify your account, then come back here to sign in.
          </Text>

          {error ? (
            <Text className="text-destructive text-sm text-center mb-4" accessibilityLiveRegion="polite">
              {error}
            </Text>
          ) : null}

          {resent ? (
            <Text className="text-primary text-sm text-center mb-4" accessibilityLiveRegion="polite">
              Email resent! Check your inbox again.
            </Text>
          ) : null}

          <View className="w-full gap-3">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onPress={() => navigation.navigate('Auth')}
            >
              Go to Sign In
            </Button>

            <Button
              variant="secondary"
              fullWidth
              loading={resending}
              onPress={handleResend}
              leftIcon={!resending ? <RefreshCw color="#676D76" size={16} /> : undefined}
            >
              Resend Email
            </Button>
          </View>
        </MotiView>
      </View>
    </Screen>
  );
}

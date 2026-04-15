import { forwardRef } from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, className = '', ...props },
  ref
) {
  return (
    <View className="w-full">
      {label && (
        <Text className="text-sm font-medium text-foreground mb-1.5">{label}</Text>
      )}
      <TextInput
        ref={ref}
        placeholderTextColor="#9CA3AF"
        className={`h-12 px-4 rounded-xl border border-border bg-card text-foreground text-base ${error ? 'border-destructive' : ''} ${className}`}
        {...props}
      />
      {error ? (
        <Text className="text-destructive text-xs mt-1" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text className="text-muted-foreground text-xs mt-1">{hint}</Text>
      ) : null}
    </View>
  );
});

export default Input;

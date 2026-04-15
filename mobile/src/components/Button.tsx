import { ReactNode } from 'react';
import { Pressable, Text, ActivityIndicator, View, PressableProps } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost' | 'coral' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary active:bg-ocean-deep',
  secondary: 'bg-secondary active:bg-gray-200',
  ghost: 'bg-transparent active:bg-muted',
  coral: 'bg-coral active:bg-coral-hover',
  destructive: 'bg-destructive active:bg-rose-500',
};

const variantTextClasses: Record<Variant, string> = {
  primary: 'text-primary-foreground',
  secondary: 'text-secondary-foreground',
  ghost: 'text-foreground',
  coral: 'text-accent-foreground',
  destructive: 'text-destructive-foreground',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-10 px-4',
  md: 'h-12 px-5',
  lg: 'h-14 px-6',
};

const sizeTextClasses: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={`rounded-2xl flex-row items-center justify-center ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50' : ''}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <View className="flex-row items-center gap-2">
          {leftIcon}
          <Text className={`font-semibold ${variantTextClasses[variant]} ${sizeTextClasses[size]}`}>
            {children}
          </Text>
          {rightIcon}
        </View>
      )}
    </Pressable>
  );
}

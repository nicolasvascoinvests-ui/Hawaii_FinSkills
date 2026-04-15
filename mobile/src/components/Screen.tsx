import { ReactNode } from 'react';
import { View, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  className?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export default function Screen({
  children,
  scroll = true,
  className = '',
  edges = ['top', 'bottom'],
}: ScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={edges}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {scroll ? (
        <ScrollView
          className={`flex-1 ${className}`}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View className={`flex-1 ${className}`}>{children}</View>
      )}
    </SafeAreaView>
  );
}

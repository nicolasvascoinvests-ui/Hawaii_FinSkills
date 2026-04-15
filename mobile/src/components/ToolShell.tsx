import { ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { ArrowLeft } from 'lucide-react-native';
import Screen from './Screen';

interface ToolShellProps {
  title: string;
  description: string;
  gradient: [string, string];
  standards: string[];
  Icon: (props: { color: string; size: number }) => ReactNode;
  children: ReactNode;
  backLabel?: string;
}

export default function ToolShell({
  title,
  description,
  gradient,
  standards,
  Icon,
  children,
  backLabel = 'Back to tools',
}: ToolShellProps) {
  const navigation = useNavigation();
  return (
    <Screen>
      <View className="px-4 py-6">
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            onPress={() => navigation.goBack()}
            className="flex-row items-center gap-1 mb-4 self-start py-2"
          >
            <ArrowLeft color="#676D76" size={16} />
            <Text className="text-sm text-muted-foreground">{backLabel}</Text>
          </Pressable>

          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 20, padding: 24, marginBottom: 24 }}
          >
            <Icon color="white" size={32} />
            <Text className="text-2xl font-bold text-white mt-2">{title}</Text>
            <Text className="text-white/80 text-sm">{description}</Text>
            <View className="flex-row gap-1.5 mt-2">
              {standards.map((code) => (
                <View key={code} className="bg-white/20 rounded-full px-2 py-0.5">
                  <Text className="text-xs text-white">{code}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </MotiView>

        {children}
      </View>
    </Screen>
  );
}

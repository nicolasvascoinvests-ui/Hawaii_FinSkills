import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { ArrowRight, Shield, BookOpen, Award } from 'lucide-react-native';
import Screen from '../components/Screen';
import Button from '../components/Button';
import type { RootStackScreenProps } from '../navigation/types';

const FEATURES = [
  { Icon: BookOpen, title: '30 Standards', desc: 'Master all Hawaiʻi financial literacy standards' },
  { Icon: Shield, title: 'PTP Ready', desc: 'Complete your Personal Transition Plan requirement' },
  { Icon: Award, title: 'Track Progress', desc: 'Visual dashboard shows your mastery journey' },
];

export default function WelcomeScreen({ navigation }: RootStackScreenProps<'Welcome'>) {
  return (
    <Screen>
      <View className="bg-primary pt-12 pb-16 px-6 rounded-b-[40px]">
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600 }}
          className="items-center"
        >
          <View className="bg-white/10 rounded-full px-4 py-1.5 mb-6 flex-row items-center gap-2">
            <Text className="text-white text-xs">🌺</Text>
            <Text className="text-white text-xs">Hawaiʻi Financial Literacy</Text>
          </View>
          <Text className="text-3xl font-bold text-white text-center mb-3">
            Your Money,{'\n'}Your Future
          </Text>
          <Text className="text-white/80 text-base text-center mb-8 max-w-xs">
            Master 30 financial literacy standards and complete your PTP graduation requirement.
          </Text>
          <Button
            variant="coral"
            size="lg"
            onPress={() => navigation.navigate('Auth')}
            rightIcon={<ArrowRight color="white" size={20} />}
            accessibilityLabel="Get started with the financial literacy app"
          >
            Hoʻomaka — Get Started
          </Button>
        </MotiView>
      </View>

      <View className="px-6 py-10 flex-1">
        {FEATURES.map((f, i) => (
          <MotiView
            key={f.title}
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', delay: 300 + i * 150, duration: 500 }}
            className="flex-row items-start gap-4 bg-card rounded-2xl p-5 mb-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <View className="bg-primary/10 p-3 rounded-xl">
              <f.Icon color="#0B5E8C" size={24} />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-card-foreground">{f.title}</Text>
              <Text className="text-muted-foreground text-sm mt-0.5">{f.desc}</Text>
            </View>
          </MotiView>
        ))}
      </View>

      <View className="items-center pb-6">
        <Text className="text-muted-foreground text-sm">Hawaiʻi Financial Literacy</Text>
        <Text className="text-muted-foreground text-xs mt-1">Personal Transition Plan — Financial Literacy</Text>
      </View>
    </Screen>
  );
}

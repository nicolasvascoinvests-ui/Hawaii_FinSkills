import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { DollarSign, Wallet, Target, TrendingUp, CreditCard, Shield } from 'lucide-react-native';
import Screen from '../components/Screen';
import type { MainTabScreenProps } from '../navigation/types';
import type { RootStackParamList } from '../navigation/types';

interface Tool {
  Icon: typeof DollarSign;
  title: string;
  desc: string;
  route: keyof RootStackParamList;
  gradient: [string, string];
  standards: string[];
}

const TOOLS: Tool[] = [
  {
    Icon: DollarSign,
    title: 'Paycheck Calculator',
    desc: 'See how taxes and deductions affect your take-home pay in Hawaiʻi',
    route: 'PaycheckCalculator',
    gradient: ['#FBBF24', '#F97316'],
    standards: ['EI-1', 'EI-2'],
  },
  {
    Icon: Wallet,
    title: 'Budget Builder',
    desc: 'Allocate your income across categories with Hawaiʻi cost-of-living presets',
    route: 'BudgetBuilder',
    gradient: ['#FF6B4A', '#F43F5E'],
    standards: ['SP-2', 'SP-3'],
  },
  {
    Icon: Target,
    title: 'Savings Goal Tracker',
    desc: 'Set a goal and visualize compound interest growth over time',
    route: 'SavingsGoalTracker',
    gradient: ['#2F9950', '#34D399'],
    standards: ['SV-1', 'SV-3'],
  },
  {
    Icon: TrendingUp,
    title: 'Investment Growth Simulator',
    desc: 'Compare $100/month invested at different rates over 10, 20, and 30 years',
    route: 'InvestmentSimulator',
    gradient: ['#0EA5E9', '#2563EB'],
    standards: ['IN-1', 'IN-4'],
  },
  {
    Icon: CreditCard,
    title: 'Credit Score Simulator',
    desc: 'Toggle factors like payment history and utilization to see score impact',
    route: 'CreditScoreSimulator',
    gradient: ['#8B5CF6', '#9333EA'],
    standards: ['MC-4', 'MC-5'],
  },
  {
    Icon: Shield,
    title: 'Insurance Cost Estimator',
    desc: 'Compare auto liability vs full coverage and health insurance tiers',
    route: 'InsuranceEstimator',
    gradient: ['#14B8A6', '#06B6D4'],
    standards: ['MR-2', 'MR-3'],
  },
];

export default function ToolsScreen({ navigation }: MainTabScreenProps<'Tools'>) {
  return (
    <Screen>
      <View className="px-4 py-6">
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }}>
          <Text className="text-2xl font-bold text-foreground mb-1">Financial Tools</Text>
          <Text className="text-muted-foreground text-sm mb-6">
            Interactive calculators and simulators to practice real-world financial skills.
          </Text>
        </MotiView>

        <View className="gap-3">
          {TOOLS.map((tool, i) => (
            <MotiView
              key={tool.title}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: i * 80 }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={tool.title}
                onPress={() => navigation.navigate(tool.route as never)}
                className="bg-card rounded-2xl overflow-hidden"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <LinearGradient
                  colors={tool.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ height: 6 }}
                />
                <View className="p-5 flex-row items-start gap-4">
                  <LinearGradient
                    colors={tool.gradient}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <tool.Icon color="white" size={22} />
                  </LinearGradient>
                  <View className="flex-1">
                    <Text className="font-semibold text-card-foreground">{tool.title}</Text>
                    <Text className="text-sm text-muted-foreground mt-0.5">{tool.desc}</Text>
                    <View className="flex-row flex-wrap gap-1.5 mt-2">
                      {tool.standards.map((code) => (
                        <View key={code} className="bg-muted rounded px-1.5 py-0.5">
                          <Text className="text-[10px] text-muted-foreground">{code}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </Pressable>
            </MotiView>
          ))}
        </View>
      </View>
    </Screen>
  );
}

import { useState } from 'react';
import { View, Text, Switch } from 'react-native';
import Slider from '@react-native-community/slider';
import { MotiView } from 'moti';
import { CreditCard } from 'lucide-react-native';
import ToolShell from '../../components/ToolShell';
import ProgressRing from '../../components/ProgressRing';

interface Factor {
  id: string;
  label: string;
  description: string;
  weight: number;
  value: number;
}

const DEFAULT_FACTORS: Factor[] = [
  {
    id: 'payment',
    label: 'Payment History',
    description: 'Paying bills on time every month',
    weight: 35,
    value: 90,
  },
  {
    id: 'utilization',
    label: 'Credit Utilization',
    description: 'Using less than 30% of available credit',
    weight: 30,
    value: 70,
  },
  {
    id: 'length',
    label: 'Credit History Length',
    description: 'How long your accounts have been open',
    weight: 15,
    value: 50,
  },
  {
    id: 'mix',
    label: 'Credit Mix',
    description: 'Having different types of credit',
    weight: 10,
    value: 60,
  },
  {
    id: 'inquiries',
    label: 'New Credit Inquiries',
    description: 'Recent applications for new credit',
    weight: 10,
    value: 80,
  },
];

function getScoreColor(score: number) {
  if (score >= 750) return '#2F9950';
  if (score >= 670) return '#0B5E8C';
  if (score >= 580) return '#F59E0B';
  return '#EF4444';
}

function getScoreLabel(score: number) {
  if (score >= 800) return 'Exceptional';
  if (score >= 750) return 'Very Good';
  if (score >= 670) return 'Good';
  if (score >= 580) return 'Fair';
  return 'Poor';
}

export default function CreditScoreSimulatorScreen() {
  const [factors, setFactors] = useState<Factor[]>(DEFAULT_FACTORS);
  const [missedPayment, setMissedPayment] = useState(false);
  const [maxedCard, setMaxedCard] = useState(false);

  const adjustedFactors = factors.map((f) => {
    let val = f.value;
    if (f.id === 'payment' && missedPayment) val = Math.max(0, val - 40);
    if (f.id === 'utilization' && maxedCard) val = Math.max(0, val - 50);
    return { ...f, value: val };
  });

  const rawScore = adjustedFactors.reduce((sum, f) => sum + (f.value / 100) * f.weight, 0);
  const creditScore = Math.round(300 + (rawScore / 100) * 550);
  const scoreColor = getScoreColor(creditScore);
  const ringPercent = ((creditScore - 300) / 550) * 100;

  const updateFactor = (id: string, value: number) =>
    setFactors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value: Math.round(value) } : f))
    );

  return (
    <ToolShell
      title="Credit Score Simulator"
      description="Toggle factors to see how they impact your credit score"
      gradient={['#8B5CF6', '#9333EA']}
      standards={['MC-4', 'MC-5']}
      Icon={({ color, size }) => <CreditCard color={color} size={size} />}
    >
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl p-6 mb-4 items-center"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        <ProgressRing
          percentage={ringPercent}
          size={180}
          strokeWidth={14}
          color={scoreColor}
          trackColor="#E5E7EB"
        >
          <Text className="text-4xl font-bold" style={{ color: scoreColor }}>
            {creditScore}
          </Text>
          <Text className="text-xs text-muted-foreground">300 – 850</Text>
        </ProgressRing>
        <Text className="mt-4 text-lg font-semibold" style={{ color: scoreColor }}>
          {getScoreLabel(creditScore)}
        </Text>
      </MotiView>

      <View className="bg-card rounded-2xl p-5 mb-4 gap-4">
        <Text className="font-semibold text-foreground">Scenario Toggles</Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-4">
            <Text className="text-sm font-medium text-foreground">Missed a payment</Text>
            <Text className="text-xs text-muted-foreground">Payment 30+ days late</Text>
          </View>
          <Switch
            value={missedPayment}
            onValueChange={setMissedPayment}
            accessibilityLabel="Missed payment toggle"
          />
        </View>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-4">
            <Text className="text-sm font-medium text-foreground">Maxed out credit card</Text>
            <Text className="text-xs text-muted-foreground">Using 95%+ of limit</Text>
          </View>
          <Switch
            value={maxedCard}
            onValueChange={setMaxedCard}
            accessibilityLabel="Maxed card toggle"
          />
        </View>
      </View>

      <View className="bg-card rounded-2xl p-5 mb-4">
        <Text className="font-semibold text-foreground mb-4">Factor Weights</Text>
        <View className="gap-5">
          {factors.map((f) => {
            const adjusted = adjustedFactors.find((a) => a.id === f.id)!;
            return (
              <View key={f.id}>
                <View className="flex-row items-start justify-between mb-1">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground">{f.label}</Text>
                    <Text className="text-xs text-muted-foreground">{f.description}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs text-muted-foreground">{f.weight}% weight</Text>
                    <Text className="text-xs font-semibold text-foreground">{adjusted.value}/100</Text>
                  </View>
                </View>
                <Slider
                  value={f.value}
                  minimumValue={0}
                  maximumValue={100}
                  step={5}
                  onValueChange={(v) => updateFactor(f.id, v)}
                  minimumTrackTintColor="#8B5CF6"
                  maximumTrackTintColor="#E5E7EB"
                  thumbTintColor="#8B5CF6"
                  accessibilityLabel={f.label}
                />
              </View>
            );
          })}
        </View>
      </View>

      <View className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
        <Text className="text-sm text-foreground">
          💡 Payment history and credit utilization account for 65% of your score. Paying on time and
          keeping balances low are the biggest levers you control.
        </Text>
      </View>
    </ToolShell>
  );
}

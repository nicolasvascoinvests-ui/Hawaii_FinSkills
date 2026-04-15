import { useState, useMemo } from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { Target } from 'lucide-react-native';
import ToolShell from '../../components/ToolShell';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { formatCurrency } from '../../lib/format';

interface ChartPoint {
  month: number;
  savings: number;
  interest: number;
}

export default function SavingsGoalTrackerScreen() {
  const [goal, setGoal] = useState('5000');
  const [monthly, setMonthly] = useState('200');
  const [rate, setRate] = useState('5');
  const [calculated, setCalculated] = useState(false);

  const goalAmt = parseFloat(goal) || 0;
  const monthlyAmt = parseFloat(monthly) || 0;
  const annualRate = (parseFloat(rate) || 0) / 100;
  const monthlyRate = annualRate / 12;

  const chartData = useMemo<ChartPoint[]>(() => {
    if (!calculated || monthlyAmt <= 0) return [];
    const data: ChartPoint[] = [];
    let balance = 0;
    let totalContributed = 0;
    for (let m = 0; m <= 120; m++) {
      data.push({
        month: m,
        savings: Math.round(totalContributed),
        interest: Math.round(balance - totalContributed),
      });
      if (balance >= goalAmt && goalAmt > 0) break;
      balance = balance * (1 + monthlyRate) + monthlyAmt;
      totalContributed += monthlyAmt;
    }
    return data;
  }, [calculated, monthlyAmt, monthlyRate, goalAmt]);

  const monthsToGoal = chartData.length > 0 ? chartData.length - 1 : 0;
  const finalContributions = chartData.length > 0 ? chartData[chartData.length - 1].savings : 0;
  const finalInterest = chartData.length > 0 ? chartData[chartData.length - 1].interest : 0;
  const finalBalance = finalContributions + finalInterest;

  const maxValue = Math.max(1, finalBalance);
  const sampledPoints = chartData.filter((_, i) =>
    chartData.length <= 12 ? true : i % Math.ceil(chartData.length / 12) === 0
  );

  return (
    <ToolShell
      title="Savings Goal Tracker"
      description="Set a goal and see how compound interest helps you reach it faster"
      gradient={['#2F9950', '#34D399']}
      standards={['SV-1', 'SV-3']}
      Icon={({ color, size }) => <Target color={color} size={size} />}
    >
      <View className="bg-card rounded-2xl p-5 mb-4 gap-4">
        <Input
          label="Savings Goal ($)"
          value={goal}
          onChangeText={(v) => {
            setGoal(v);
            setCalculated(false);
          }}
          keyboardType="decimal-pad"
        />
        <Input
          label="Monthly Contribution ($)"
          value={monthly}
          onChangeText={(v) => {
            setMonthly(v);
            setCalculated(false);
          }}
          keyboardType="decimal-pad"
        />
        <Input
          label="Annual Interest Rate (%)"
          value={rate}
          onChangeText={(v) => {
            setRate(v);
            setCalculated(false);
          }}
          keyboardType="decimal-pad"
        />
        <Button onPress={() => setCalculated(true)} fullWidth size="lg">
          Calculate Growth
        </Button>
      </View>

      {calculated && chartData.length > 0 && (
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }}>
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-card rounded-2xl p-4 items-center">
              <Text className="text-xs text-muted-foreground mb-1">Time to Goal</Text>
              <Text className="text-xl font-bold text-foreground">
                {Math.floor(monthsToGoal / 12)}y {monthsToGoal % 12}m
              </Text>
            </View>
            <View className="flex-1 bg-jade/10 border border-jade/20 rounded-2xl p-4 items-center">
              <Text className="text-xs text-jade mb-1">Interest Earned</Text>
              <Text className="text-xl font-bold text-jade">{formatCurrency(finalInterest)}</Text>
            </View>
          </View>

          <View className="bg-card rounded-2xl p-5 mb-4">
            <Text className="font-semibold text-foreground mb-3">Growth Over Time</Text>
            <View className="flex-row items-end gap-1 h-40 mb-2">
              {sampledPoints.map((p, i) => {
                const total = p.savings + p.interest;
                const totalHeight = (total / maxValue) * 100;
                const interestPct = total > 0 ? (p.interest / total) * 100 : 0;
                return (
                  <View key={i} className="flex-1 justify-end">
                    <View
                      className="rounded-t-md bg-jade/30 overflow-hidden"
                      style={{ height: `${totalHeight}%` }}
                    >
                      <View
                        className="bg-jade absolute bottom-0 left-0 right-0"
                        style={{ height: `${100 - interestPct}%` }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted-foreground">Month 0</Text>
              <Text className="text-xs text-muted-foreground">Month {monthsToGoal}</Text>
            </View>
            <View className="flex-row gap-3 mt-3">
              <View className="flex-row items-center gap-1">
                <View className="w-3 h-3 rounded-full bg-jade" />
                <Text className="text-xs text-muted-foreground">Contributions</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <View className="w-3 h-3 rounded-full bg-jade/30" />
                <Text className="text-xs text-muted-foreground">Interest</Text>
              </View>
            </View>
          </View>

          <View className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
            <Text className="text-sm text-foreground">
              💡 <Text className="font-bold">Compound interest</Text> means you earn interest on both your
              contributions AND on previously earned interest. Over time, this effect grows dramatically
              — that's why saving early matters.
            </Text>
          </View>
        </MotiView>
      )}
    </ToolShell>
  );
}

import { useState, useMemo } from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { TrendingUp } from 'lucide-react-native';
import ToolShell from '../../components/ToolShell';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { formatCurrency } from '../../lib/format';

const SCENARIOS = [
  { label: 'Savings Account', rate: 2, color: '#94A3B8' },
  { label: 'Bond Index', rate: 5, color: '#3B82F6' },
  { label: 'Stock Market (S&P 500)', rate: 10, color: '#2F9950' },
];

function futureValue(monthlyContrib: number, annualRate: number, years: number) {
  const r = annualRate / 100 / 12;
  if (r === 0) return monthlyContrib * years * 12;
  return monthlyContrib * ((Math.pow(1 + r, years * 12) - 1) / r);
}

const YEARS = [10, 20, 30];

export default function InvestmentSimulatorScreen() {
  const [monthly, setMonthly] = useState('100');
  const [calculated, setCalculated] = useState(false);

  const monthlyAmt = parseFloat(monthly) || 0;

  const results = useMemo(() => {
    if (!calculated) return null;
    return SCENARIOS.map((s) => ({
      ...s,
      values: YEARS.map((y) => Math.round(futureValue(monthlyAmt, s.rate, y))),
    }));
  }, [calculated, monthlyAmt]);

  const totalContributed30y = monthlyAmt * 30 * 12;

  return (
    <ToolShell
      title="Investment Growth Simulator"
      description="Compare $100/month invested at different rates over 10, 20, and 30 years"
      gradient={['#0EA5E9', '#2563EB']}
      standards={['IN-1', 'IN-4']}
      Icon={({ color, size }) => <TrendingUp color={color} size={size} />}
    >
      <View className="bg-card rounded-2xl p-5 mb-4 gap-4">
        <Input
          label="Monthly Contribution ($)"
          value={monthly}
          onChangeText={(v) => {
            setMonthly(v);
            setCalculated(false);
          }}
          keyboardType="decimal-pad"
        />
        <Button onPress={() => setCalculated(true)} fullWidth size="lg">
          Simulate Growth
        </Button>
      </View>

      {results && (
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }}>
          <View className="bg-card rounded-2xl p-5 mb-4">
            <Text className="font-semibold text-foreground mb-4">Projected Value</Text>
            <View className="flex-row mb-2">
              <Text className="flex-[2] text-xs text-muted-foreground">Scenario</Text>
              {YEARS.map((y) => (
                <Text key={y} className="flex-1 text-xs text-muted-foreground text-right">
                  {y}y
                </Text>
              ))}
            </View>
            {results.map((r) => (
              <View key={r.label} className="py-3 border-t border-border">
                <View className="flex-row items-center gap-2 mb-1">
                  <View
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: r.color }}
                  />
                  <Text className="text-sm font-medium text-foreground">{r.label}</Text>
                  <Text className="text-xs text-muted-foreground">({r.rate}%)</Text>
                </View>
                <View className="flex-row pl-5">
                  {r.values.map((v, i) => (
                    <Text
                      key={i}
                      className="flex-1 text-sm font-semibold text-foreground text-right"
                    >
                      {formatCurrency(v)}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>

          <View className="bg-card rounded-2xl p-5 mb-4">
            <Text className="font-semibold text-foreground mb-2">Total Contributed (30y)</Text>
            <Text className="text-2xl font-bold text-foreground">
              {formatCurrency(totalContributed30y)}
            </Text>
            <Text className="text-xs text-muted-foreground mt-1">
              Everything beyond this is growth from interest and returns.
            </Text>
          </View>

          <View className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
            <Text className="text-sm text-foreground">
              💡 Historically, the stock market has averaged ~10% annual returns over long periods.
              Higher returns come with higher short-term risk — that's the trade-off. Diversification
              and time in the market are how investors manage risk.
            </Text>
          </View>
        </MotiView>
      )}
    </ToolShell>
  );
}

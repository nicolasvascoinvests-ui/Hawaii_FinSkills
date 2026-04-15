import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { DollarSign } from 'lucide-react-native';
import ToolShell from '../../components/ToolShell';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { formatCurrency } from '../../lib/format';

const FEDERAL_BRACKETS_2024 = [
  { min: 0, max: 11600, rate: 0.1 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

const HI_BRACKETS = [
  { min: 0, max: 2400, rate: 0.014 },
  { min: 2400, max: 4800, rate: 0.032 },
  { min: 4800, max: 9600, rate: 0.055 },
  { min: 9600, max: 14400, rate: 0.064 },
  { min: 14400, max: 19200, rate: 0.068 },
  { min: 19200, max: 24000, rate: 0.072 },
  { min: 24000, max: 36000, rate: 0.076 },
  { min: 36000, max: 48000, rate: 0.079 },
  { min: 48000, max: Infinity, rate: 0.0825 },
];

function calcBracketTax(income: number, brackets: typeof FEDERAL_BRACKETS_2024) {
  let tax = 0;
  for (const b of brackets) {
    if (income <= b.min) break;
    const taxable = Math.min(income, b.max) - b.min;
    tax += taxable * b.rate;
  }
  return tax;
}

const SS_RATE = 0.062;
const SS_CAP = 168600;
const MEDICARE_RATE = 0.0145;
const STANDARD_DEDUCTION = 14600;

type PayFreq = 'annual' | 'monthly' | 'biweekly' | 'weekly';
const FREQ_LABELS: Record<PayFreq, string> = {
  annual: 'Annual',
  monthly: 'Monthly',
  biweekly: 'Bi-weekly',
  weekly: 'Weekly',
};
const FREQ_MULTIPLIERS: Record<PayFreq, number> = {
  annual: 1,
  monthly: 12,
  biweekly: 26,
  weekly: 52,
};

export default function PaycheckCalculatorScreen() {
  const [grossInput, setGrossInput] = useState('50000');
  const [freq, setFreq] = useState<PayFreq>('annual');
  const [calculated, setCalculated] = useState(false);

  const grossAnnual = (parseFloat(grossInput) || 0) * FREQ_MULTIPLIERS[freq];
  const taxableIncome = Math.max(0, grossAnnual - STANDARD_DEDUCTION);
  const federalTax = calcBracketTax(taxableIncome, FEDERAL_BRACKETS_2024);
  const stateTax = calcBracketTax(grossAnnual, HI_BRACKETS);
  const socialSecurity = Math.min(grossAnnual, SS_CAP) * SS_RATE;
  const medicare = grossAnnual * MEDICARE_RATE;
  const totalDeductions = federalTax + stateTax + socialSecurity + medicare;
  const netAnnual = grossAnnual - totalDeductions;
  const netMonthly = netAnnual / 12;

  const deductions = [
    { label: 'Federal Income Tax', amount: federalTax, color: '#3B82F6' },
    { label: 'Hawaii State Tax', amount: stateTax, color: '#10B981' },
    { label: 'Social Security', amount: socialSecurity, color: '#F59E0B' },
    { label: 'Medicare', amount: medicare, color: '#A855F7' },
  ];

  return (
    <ToolShell
      title="Paycheck Calculator"
      description="See how taxes and deductions affect your take-home pay in Hawaiʻi"
      gradient={['#FBBF24', '#F97316']}
      standards={['EI-1', 'EI-2']}
      Icon={({ color, size }) => <DollarSign color={color} size={size} />}
    >
      <View
        className="bg-card rounded-2xl p-5 mb-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        <Input
          label="Gross Salary ($)"
          value={grossInput}
          onChangeText={(v) => {
            setGrossInput(v);
            setCalculated(false);
          }}
          keyboardType="decimal-pad"
          placeholder="50000"
        />
        <View className="flex-row flex-wrap gap-2 mt-4 mb-4">
          {(Object.keys(FREQ_LABELS) as PayFreq[]).map((f) => (
            <Pressable
              key={f}
              onPress={() => {
                setFreq(f);
                setCalculated(false);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: freq === f }}
              className={`px-3 py-1.5 rounded-full ${freq === f ? 'bg-primary' : 'bg-muted'}`}
            >
              <Text
                className={`text-xs font-medium ${freq === f ? 'text-primary-foreground' : 'text-muted-foreground'}`}
              >
                {FREQ_LABELS[f]}
              </Text>
            </Pressable>
          ))}
        </View>
        <Button onPress={() => setCalculated(true)} fullWidth size="lg">
          Calculate Take-Home Pay
        </Button>
      </View>

      {calculated && grossAnnual > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="gap-4"
        >
          <View className="flex-row gap-3">
            <View className="flex-1 bg-card rounded-2xl p-4 items-center">
              <Text className="text-xs text-muted-foreground mb-1">Gross Annual</Text>
              <Text className="text-xl font-bold text-foreground">{formatCurrency(grossAnnual)}</Text>
            </View>
            <View className="flex-1 bg-jade/10 border border-jade/20 rounded-2xl p-4 items-center">
              <Text className="text-xs text-jade mb-1">Net Take-Home</Text>
              <Text className="text-xl font-bold text-jade">{formatCurrency(netAnnual)}</Text>
              <Text className="text-xs text-muted-foreground">{formatCurrency(netMonthly)}/mo</Text>
            </View>
          </View>

          <View className="bg-card rounded-2xl p-5">
            <Text className="font-semibold text-foreground mb-3">Deductions Breakdown</Text>
            <View className="h-6 rounded-full overflow-hidden flex-row mb-4 bg-muted">
              <View
                style={{ width: `${(netAnnual / grossAnnual) * 100}%`, backgroundColor: '#2F9950' }}
              />
              {deductions.map((d) => (
                <View
                  key={d.label}
                  style={{
                    width: `${(d.amount / grossAnnual) * 100}%`,
                    backgroundColor: d.color,
                  }}
                />
              ))}
            </View>
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="w-3 h-3 rounded-full bg-jade" />
                  <Text className="text-sm text-foreground">Take-Home Pay</Text>
                </View>
                <Text className="text-sm font-semibold text-foreground">
                  {formatCurrency(netAnnual)} ({((netAnnual / grossAnnual) * 100).toFixed(1)}%)
                </Text>
              </View>
              {deductions.map((d) => (
                <View key={d.label} className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <Text className="text-sm text-muted-foreground">{d.label}</Text>
                  </View>
                  <Text className="text-sm text-foreground">{formatCurrency(d.amount)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
            <Text className="text-sm text-foreground">
              💡 <Text className="font-bold">Did you know?</Text> Hawaiʻi has one of the highest state
              income tax rates in the US, up to 11%. Understanding your deductions helps you plan your
              budget effectively.
            </Text>
          </View>
        </MotiView>
      )}
    </ToolShell>
  );
}

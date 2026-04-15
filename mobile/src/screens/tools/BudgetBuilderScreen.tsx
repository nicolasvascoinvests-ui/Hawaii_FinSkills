import { useState } from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { Wallet } from 'lucide-react-native';
import ToolShell from '../../components/ToolShell';
import Input from '../../components/Input';
import { formatCurrency } from '../../lib/format';

const HI_PRESETS: Record<string, number> = {
  Housing: 35,
  Food: 15,
  Transport: 10,
  Savings: 10,
  Healthcare: 5,
  Entertainment: 5,
  Education: 5,
  'Other/Misc': 15,
};

const CATEGORY_COLORS: Record<string, string> = {
  Housing: '#3B82F6',
  Food: '#10B981',
  Transport: '#F59E0B',
  Savings: '#2F9950',
  Healthcare: '#A855F7',
  Entertainment: '#EC4899',
  Education: '#06B6D4',
  'Other/Misc': '#9CA3AF',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Housing: '🏠',
  Food: '🍔',
  Transport: '🚗',
  Savings: '💰',
  Healthcare: '🏥',
  Entertainment: '🎮',
  Education: '📚',
  'Other/Misc': '📦',
};

export default function BudgetBuilderScreen() {
  const [income, setIncome] = useState('3500');
  const [allocations, setAllocations] = useState<Record<string, number>>({ ...HI_PRESETS });

  const monthlyIncome = parseFloat(income) || 0;
  const totalPct = Object.values(allocations).reduce((a, b) => a + b, 0);
  const isOver = totalPct > 100;
  const remaining = 100 - totalPct;

  const setAlloc = (cat: string, val: number) =>
    setAllocations((prev) => ({ ...prev, [cat]: Math.round(val) }));

  const pillStyle = isOver
    ? 'bg-destructive/10'
    : remaining === 0
      ? 'bg-jade/10'
      : 'bg-muted';
  const pillText = isOver
    ? 'text-destructive'
    : remaining === 0
      ? 'text-jade'
      : 'text-muted-foreground';
  const pillLabel = isOver
    ? `${totalPct}% — over budget`
    : remaining === 0
      ? '100% allocated ✓'
      : `${remaining}% unallocated`;

  return (
    <ToolShell
      title="Budget Builder"
      description="Allocate your income across categories — Hawaiʻi cost-of-living presets included"
      gradient={['#FF6B4A', '#F43F5E']}
      standards={['SP-2', 'SP-3']}
      Icon={({ color, size }) => <Wallet color={color} size={size} />}
    >
      <View className="bg-card rounded-2xl p-5 mb-4">
        <Input
          label="Monthly Take-Home Income ($)"
          value={income}
          onChangeText={setIncome}
          keyboardType="decimal-pad"
          placeholder="3500"
        />
      </View>

      <View className="bg-card rounded-2xl p-5 mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="font-semibold text-foreground">Budget Allocation</Text>
          <View className={`px-2 py-0.5 rounded-full ${pillStyle}`}>
            <Text className={`text-xs font-bold ${pillText}`}>{pillLabel}</Text>
          </View>
        </View>

        <View className="h-5 rounded-full overflow-hidden flex-row mb-5 bg-muted">
          {Object.entries(allocations).map(([cat, pct]) =>
            pct > 0 ? (
              <View
                key={cat}
                style={{
                  width: `${Math.min(pct, 100)}%`,
                  backgroundColor: CATEGORY_COLORS[cat],
                }}
              />
            ) : null
          )}
        </View>

        <View className="gap-4">
          {Object.entries(allocations).map(([cat, pct]) => (
            <View key={cat}>
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center gap-1.5">
                  <Text>{CATEGORY_EMOJIS[cat]}</Text>
                  <Text className="text-sm text-foreground">{cat}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs text-muted-foreground">{pct}%</Text>
                  <Text className="text-xs font-semibold text-foreground">
                    {formatCurrency((monthlyIncome * pct) / 100)}
                  </Text>
                </View>
              </View>
              <Slider
                value={pct}
                minimumValue={0}
                maximumValue={60}
                step={1}
                onValueChange={(v) => setAlloc(cat, v)}
                minimumTrackTintColor={CATEGORY_COLORS[cat]}
                maximumTrackTintColor="#E5E7EB"
                thumbTintColor={CATEGORY_COLORS[cat]}
                accessibilityLabel={`${cat} allocation`}
              />
            </View>
          ))}
        </View>
      </View>

      {monthlyIncome > 0 && (
        <View className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
          <Text className="text-sm text-foreground">
            💡 <Text className="font-bold">50/30/20 Rule:</Text> Financial experts recommend 50% for
            needs (housing, food, transport), 30% for wants, and 20% for savings and debt repayment.
            Hawaiʻi's high cost of living may require adjusting these ratios.
          </Text>
        </View>
      )}
    </ToolShell>
  );
}

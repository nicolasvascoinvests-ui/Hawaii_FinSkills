import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Shield, Check } from 'lucide-react-native';
import ToolShell from '../../components/ToolShell';
import { formatCurrency } from '../../lib/format';

type CoverageType = 'minimum' | 'standard' | 'full';

interface InsuranceOption {
  type: CoverageType;
  label: string;
  autoMonthly: number;
  healthMonthly: number;
  autoDetails: string[];
  healthDetails: string[];
}

const OPTIONS: InsuranceOption[] = [
  {
    type: 'minimum',
    label: 'Minimum / Basic',
    autoMonthly: 85,
    healthMonthly: 180,
    autoDetails: [
      'Liability only: $20K/$40K bodily injury',
      '$10K property damage',
      'No collision or comprehensive',
      'Meets HI legal minimum',
    ],
    healthDetails: [
      'High deductible plan ($6,000+)',
      'Preventive care covered',
      'Limited specialist access',
      'Higher out-of-pocket costs',
    ],
  },
  {
    type: 'standard',
    label: 'Standard',
    autoMonthly: 155,
    healthMonthly: 350,
    autoDetails: [
      'Liability: $50K/$100K bodily injury',
      '$50K property damage',
      'Collision ($1,000 deductible)',
      'Uninsured motorist coverage',
    ],
    healthDetails: [
      'Moderate deductible ($2,000)',
      'Wider doctor network',
      'Specialist visits covered',
      'Prescription drug coverage',
    ],
  },
  {
    type: 'full',
    label: 'Full / Premium',
    autoMonthly: 240,
    healthMonthly: 550,
    autoDetails: [
      'Liability: $100K/$300K bodily injury',
      '$100K property damage',
      'Collision ($500 deductible)',
      'Comprehensive (theft, weather, etc.)',
      'Roadside assistance and rental car',
    ],
    healthDetails: [
      'Low deductible ($500)',
      'Broad PPO network',
      'Low copays for specialists',
      'Dental and vision included',
      'Mental health coverage',
    ],
  },
];

export default function InsuranceEstimatorScreen() {
  const [selectedAuto, setSelectedAuto] = useState<CoverageType>('minimum');
  const [selectedHealth, setSelectedHealth] = useState<CoverageType>('standard');

  const auto = OPTIONS.find((o) => o.type === selectedAuto)!;
  const health = OPTIONS.find((o) => o.type === selectedHealth)!;
  const totalMonthly = auto.autoMonthly + health.healthMonthly;

  return (
    <ToolShell
      title="Insurance Cost Estimator"
      description="Compare auto liability vs full coverage and health insurance tiers"
      gradient={['#14B8A6', '#06B6D4']}
      standards={['MR-2', 'MR-3']}
      Icon={({ color, size }) => <Shield color={color} size={size} />}
    >
      <View className="bg-card rounded-2xl p-5 mb-4">
        <Text className="font-semibold text-foreground mb-3">Auto Insurance</Text>
        <View className="flex-row gap-2 mb-4">
          {OPTIONS.map((o) => (
            <Pressable
              key={o.type}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedAuto === o.type }}
              onPress={() => setSelectedAuto(o.type)}
              className={`flex-1 py-2 rounded-xl border ${selectedAuto === o.type ? 'bg-primary border-primary' : 'bg-card border-border'}`}
            >
              <Text
                className={`text-xs font-medium text-center ${selectedAuto === o.type ? 'text-primary-foreground' : 'text-foreground'}`}
              >
                {o.label.split(' ')[0]}
              </Text>
              <Text
                className={`text-xs text-center ${selectedAuto === o.type ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
              >
                {formatCurrency(o.autoMonthly)}/mo
              </Text>
            </Pressable>
          ))}
        </View>
        <View className="gap-1.5">
          {auto.autoDetails.map((d) => (
            <View key={d} className="flex-row items-start gap-2">
              <Check color="#14B8A6" size={14} />
              <Text className="text-sm text-muted-foreground flex-1">{d}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="bg-card rounded-2xl p-5 mb-4">
        <Text className="font-semibold text-foreground mb-3">Health Insurance</Text>
        <View className="flex-row gap-2 mb-4">
          {OPTIONS.map((o) => (
            <Pressable
              key={o.type}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedHealth === o.type }}
              onPress={() => setSelectedHealth(o.type)}
              className={`flex-1 py-2 rounded-xl border ${selectedHealth === o.type ? 'bg-primary border-primary' : 'bg-card border-border'}`}
            >
              <Text
                className={`text-xs font-medium text-center ${selectedHealth === o.type ? 'text-primary-foreground' : 'text-foreground'}`}
              >
                {o.label.split(' ')[0]}
              </Text>
              <Text
                className={`text-xs text-center ${selectedHealth === o.type ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
              >
                {formatCurrency(o.healthMonthly)}/mo
              </Text>
            </Pressable>
          ))}
        </View>
        <View className="gap-1.5">
          {health.healthDetails.map((d) => (
            <View key={d} className="flex-row items-start gap-2">
              <Check color="#14B8A6" size={14} />
              <Text className="text-sm text-muted-foreground flex-1">{d}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="bg-primary rounded-2xl p-5 mb-4">
        <Text className="text-xs uppercase font-semibold text-primary-foreground/80 mb-1">
          Total Monthly Premium
        </Text>
        <Text className="text-3xl font-bold text-primary-foreground">
          {formatCurrency(totalMonthly)}
        </Text>
        <Text className="text-sm text-primary-foreground/80 mt-1">
          That's {formatCurrency(totalMonthly * 12)} per year.
        </Text>
      </View>

      <View className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
        <Text className="text-sm text-foreground">
          💡 Hawaiʻi requires auto liability insurance by law. Going without it risks legal penalties
          and huge out-of-pocket costs after an accident. Higher coverage costs more monthly but
          protects your savings when something goes wrong.
        </Text>
      </View>
    </ToolShell>
  );
}

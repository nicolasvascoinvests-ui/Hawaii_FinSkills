import { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Wallet, Check, X, RotateCcw, AlertTriangle, Target } from 'lucide-react-native';
import ToolShell from '../../components/ToolShell';
import Button from '../../components/Button';
import type { RootStackScreenProps } from '../../navigation/types';

type CardType = 'need' | 'want' | 'savings';

interface ScenarioCard {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  type: CardType;
  buyLabel?: string;
  skipLabel?: string;
}

const INCOME = 2400;

const CARDS: ScenarioCard[] = [
  {
    id: 'rent',
    title: 'Rent share',
    subtitle: 'Your portion of rent, due this month',
    amount: 800,
    type: 'need',
  },
  {
    id: 'groceries',
    title: 'Monthly groceries',
    subtitle: 'Food for the month at home',
    amount: 300,
    type: 'need',
  },
  {
    id: 'phone',
    title: 'Phone bill',
    subtitle: 'Prepaid plan auto-renew',
    amount: 60,
    type: 'need',
  },
  {
    id: 'car-repair',
    title: 'Emergency car repair',
    subtitle: 'Your alternator died — fix it or take the bus',
    amount: 400,
    type: 'need',
  },
  {
    id: 'iphone',
    title: 'New iPhone',
    subtitle: 'Your current phone still works fine',
    amount: 1200,
    type: 'want',
  },
  {
    id: 'boba',
    title: 'Daily boba habit',
    subtitle: '$5 every day for a month',
    amount: 150,
    type: 'want',
  },
  {
    id: 'streams',
    title: 'Streaming bundle',
    subtitle: 'Netflix + Disney+ + Spotify',
    amount: 45,
    type: 'want',
  },
  {
    id: 'concert',
    title: 'Concert tickets',
    subtitle: 'Your favorite artist is in Honolulu',
    amount: 180,
    type: 'want',
  },
  {
    id: 'savings',
    title: 'Emergency fund',
    subtitle: 'Transfer to your high-yield savings',
    amount: 300,
    type: 'savings',
    buyLabel: 'Contribute',
  },
  {
    id: 'roth',
    title: 'Roth IRA contribution',
    subtitle: 'Tax-free growth for retirement',
    amount: 150,
    type: 'savings',
    buyLabel: 'Contribute',
  },
  {
    id: 'electric',
    title: 'HECO electric bill',
    subtitle: 'Hawaii has the highest electric rates in the US',
    amount: 120,
    type: 'need',
  },
  {
    id: 'car-insurance',
    title: 'Car insurance premium',
    subtitle: 'Liability coverage — required to drive in Hawaii',
    amount: 175,
    type: 'need',
  },
  {
    id: 'north-shore',
    title: 'North Shore day trip',
    subtitle: 'Gas, shave ice, and poke with friends',
    amount: 85,
    type: 'want',
  },
  {
    id: 'gym',
    title: 'Gym membership',
    subtitle: 'Signed up in January, used it twice',
    amount: 45,
    type: 'want',
  },
  {
    id: 'index-fund',
    title: 'Index fund investment',
    subtitle: 'Auto-invest into a total market ETF',
    amount: 250,
    type: 'savings',
    buyLabel: 'Invest',
  },
];

const TYPE_STYLES: Record<CardType, { label: string; color: string; bg: string }> = {
  need: { label: 'Need', color: '#B91C1C', bg: '#FEE2E2' },
  want: { label: 'Want', color: '#B45309', bg: '#FEF3C7' },
  savings: { label: 'Savings', color: '#047857', bg: '#D1FAE5' },
};

function formatMoney(n: number): string {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

const TOLERANCE = 5;

interface CategoryMiss {
  label: string;
  actualPct: number;
  targetPct: number;
  direction: 'over' | 'under';
}

function computeMisses(needsPct: number, wantsPct: number, savingsPct: number): CategoryMiss[] {
  const rows = [
    { label: 'Needs', actualPct: needsPct, targetPct: 50 },
    { label: 'Wants', actualPct: wantsPct, targetPct: 30 },
    { label: 'Savings', actualPct: savingsPct, targetPct: 20 },
  ];
  return rows
    .filter((r) => Math.abs(r.actualPct - r.targetPct) > TOLERANCE)
    .map((r) => ({
      ...r,
      direction: r.actualPct > r.targetPct ? ('over' as const) : ('under' as const),
    }));
}

function buildHarshFeedback(misses: CategoryMiss[], savingsPct: number): string {
  if (savingsPct < 5) {
    return "You saved almost nothing. One surprise bill and you're in debt — every month has to leave something behind.";
  }
  const wantsMiss = misses.find((m) => m.label === 'Wants' && m.direction === 'over');
  if (wantsMiss) {
    return `Wants blew past 30% — impulse spending is the fastest way to kill a budget. Cut wants first, savings next.`;
  }
  const savingsMiss = misses.find((m) => m.label === 'Savings' && m.direction === 'under');
  if (savingsMiss) {
    return 'Savings below 20% means no cushion for emergencies and no progress on long-term goals. Pay yourself first.';
  }
  const needsMiss = misses.find((m) => m.label === 'Needs' && m.direction === 'over');
  if (needsMiss) {
    return 'Needs over 50% means your fixed costs are crowding out everything else. Hawaii is expensive — either earn more or cut a recurring bill.';
  }
  return 'Close, but not there. Every category has to land within 5% of the 50/30/20 target to pass.';
}

export default function BudgetBlitzScreen(_props: RootStackScreenProps<'BudgetBlitz'>) {
  const [index, setIndex] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, 'buy' | 'skip'>>({});

  const totals = useMemo(() => {
    let needs = 0;
    let wants = 0;
    let savings = 0;
    for (const card of CARDS) {
      if (decisions[card.id] === 'buy') {
        if (card.type === 'need') needs += card.amount;
        if (card.type === 'want') wants += card.amount;
        if (card.type === 'savings') savings += card.amount;
      }
    }
    const spent = needs + wants + savings;
    return { needs, wants, savings, spent, balance: INCOME - spent };
  }, [decisions]);

  const currentCard = CARDS[index];
  const finished = index >= CARDS.length;

  function decide(action: 'buy' | 'skip') {
    if (!currentCard) return;
    if (action === 'buy' && totals.balance < currentCard.amount) {
      // Can't afford — force skip
      setDecisions((d) => ({ ...d, [currentCard.id]: 'skip' }));
    } else {
      setDecisions((d) => ({ ...d, [currentCard.id]: action }));
    }
    setIndex((i) => i + 1);
  }

  function reset() {
    setIndex(0);
    setDecisions({});
  }

  const needsPct = (totals.needs / INCOME) * 100;
  const wantsPct = (totals.wants / INCOME) * 100;
  const savingsPct = ((totals.savings + totals.balance) / INCOME) * 100;

  const deviation =
    Math.abs(needsPct - 50) + Math.abs(wantsPct - 30) + Math.abs(savingsPct - 20);
  const score = Math.max(0, Math.round(100 - deviation));

  // Penalty: skipped rent or emergency repair
  const skippedCritical =
    (decisions['rent'] === 'skip' ? 20 : 0) + (decisions['car-repair'] === 'skip' ? 10 : 0);
  const finalScore = Math.max(0, score - skippedCritical);

  return (
    <ToolShell
      title="Budget Blitz"
      description="Monthly income of $2,400. Make the call on each expense and land near 50/30/20."
      gradient={['#FF6B4A', '#F43F5E']}
      standards={['SP-1', 'SP-2', 'SV-1']}
      Icon={({ color, size }) => <Wallet color={color} size={size} />}
      backLabel="Back to games"
    >
      <View className="bg-card rounded-2xl p-4 mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-xs text-muted-foreground uppercase tracking-wide">Balance</Text>
          <Text className="text-xs text-muted-foreground">
            Card {Math.min(index + 1, CARDS.length)} of {CARDS.length}
          </Text>
        </View>
        <Text className="text-3xl font-bold text-foreground">{formatMoney(totals.balance)}</Text>
        <View className="flex-row gap-3 mt-3">
          <View className="flex-1">
            <Text className="text-[10px] text-muted-foreground">Needs</Text>
            <Text className="text-sm font-semibold text-foreground">
              {formatMoney(totals.needs)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-[10px] text-muted-foreground">Wants</Text>
            <Text className="text-sm font-semibold text-foreground">
              {formatMoney(totals.wants)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-[10px] text-muted-foreground">Savings</Text>
            <Text className="text-sm font-semibold text-foreground">
              {formatMoney(totals.savings)}
            </Text>
          </View>
        </View>
      </View>

      <AnimatePresence exitBeforeEnter>
        {!finished && currentCard && (
          <MotiView
            key={currentCard.id}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -20 }}
            transition={{ type: 'timing', duration: 250 }}
            className="bg-card rounded-2xl p-6 mb-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <View
              className="self-start rounded-full px-2 py-0.5 mb-3"
              style={{ backgroundColor: TYPE_STYLES[currentCard.type].bg }}
            >
              <Text className="text-[10px] font-semibold" style={{ color: TYPE_STYLES[currentCard.type].color }}>
                {TYPE_STYLES[currentCard.type].label.toUpperCase()}
              </Text>
            </View>
            <Text className="text-xl font-bold text-card-foreground">{currentCard.title}</Text>
            <Text className="text-sm text-muted-foreground mt-1">{currentCard.subtitle}</Text>
            <Text className="text-2xl font-bold text-foreground mt-4">
              {formatMoney(currentCard.amount)}
            </Text>

            {totals.balance < currentCard.amount && currentCard.type !== 'savings' ? (
              <Text className="text-xs text-destructive mt-2">
                You can't afford this — it will be skipped.
              </Text>
            ) : null}

            <View className="flex-row gap-3 mt-5">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={currentCard.skipLabel ?? 'Skip'}
                onPress={() => decide('skip')}
                className="flex-1 h-12 rounded-2xl flex-row items-center justify-center bg-secondary active:bg-gray-200"
              >
                <X color="#374151" size={18} />
                <Text className="ml-1 font-semibold text-secondary-foreground">
                  {currentCard.skipLabel ?? 'Skip'}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={currentCard.buyLabel ?? 'Buy'}
                onPress={() => decide('buy')}
                disabled={totals.balance < currentCard.amount}
                className={`flex-1 h-12 rounded-2xl flex-row items-center justify-center ${
                  currentCard.type === 'savings'
                    ? 'bg-primary active:bg-ocean-deep'
                    : 'bg-coral active:bg-coral-hover'
                } ${totals.balance < currentCard.amount ? 'opacity-50' : ''}`}
              >
                <Check color="white" size={18} />
                <Text className="ml-1 font-semibold text-white">
                  {currentCard.buyLabel ?? 'Buy'}
                </Text>
              </Pressable>
            </View>
          </MotiView>
        )}
      </AnimatePresence>

      {finished && (() => {
        const misses = computeMisses(needsPct, wantsPct, savingsPct);
        const passed = misses.length === 0 && skippedCritical === 0;
        return (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="bg-card rounded-2xl overflow-hidden mb-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View
              className="p-5"
              style={{ backgroundColor: passed ? '#059669' : '#DC2626' }}
            >
              <View className="flex-row items-center gap-2">
                {passed ? (
                  <Check color="white" size={24} />
                ) : (
                  <AlertTriangle color="white" size={24} />
                )}
                <Text className="text-2xl font-bold text-white">
                  {passed ? 'PASSED' : 'FAILED'}
                </Text>
              </View>
              <Text className="text-white/90 text-sm mt-1">
                {passed
                  ? "You hit the 50/30/20 target. That's how real budgets work."
                  : 'You did not hit the 50/30/20 target this month.'}
              </Text>
            </View>

            <View className="p-6">
              <View className="flex-row items-center gap-2 mb-2">
                <Target color="#0B5E8C" size={18} />
                <Text className="text-sm font-semibold text-foreground">
                  Goal: 50% Needs · 30% Wants · 20% Savings
                </Text>
              </View>
              <Text className="text-xs text-muted-foreground mb-4">
                Every category must land within {TOLERANCE}% of its target to pass.
              </Text>

              <ScoreRow label="Needs" actualPct={needsPct} targetPct={50} amount={totals.needs} />
              <ScoreRow label="Wants" actualPct={wantsPct} targetPct={30} amount={totals.wants} />
              <ScoreRow
                label="Savings"
                actualPct={savingsPct}
                targetPct={20}
                amount={totals.savings + totals.balance}
              />

              {!passed && misses.length > 0 && (
                <View className="bg-red-50 border border-red-200 rounded-xl p-3 mt-3">
                  <Text className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1.5">
                    Missed targets
                  </Text>
                  {misses.map((m) => (
                    <Text key={m.label} className="text-sm text-red-800">
                      • {m.label} was {Math.round(m.actualPct)}% —{' '}
                      {Math.round(Math.abs(m.actualPct - m.targetPct))}%{' '}
                      {m.direction} the {m.targetPct}% target
                    </Text>
                  ))}
                </View>
              )}

              {skippedCritical > 0 && (
                <View className="bg-red-50 border border-red-200 rounded-xl p-3 mt-3">
                  <Text className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1.5">
                    Essential bills skipped
                  </Text>
                  <Text className="text-sm text-red-800">
                    Skipping rent or a required car repair isn't a budget win — it's late fees, eviction risk, or a broken car.
                  </Text>
                </View>
              )}

              <View className="h-px bg-border my-4" />

              <Text className="text-xs text-muted-foreground uppercase tracking-wide">Budget health</Text>
              <Text className="text-4xl font-bold text-foreground">
                {finalScore}
                <Text className="text-xl text-muted-foreground">/100</Text>
              </Text>
              {!passed && (
                <Text className="text-sm text-foreground mt-3 leading-5">
                  {buildHarshFeedback(misses, savingsPct)}
                </Text>
              )}

              <View className="mt-5">
                <Button onPress={reset} leftIcon={<RotateCcw color="white" size={18} />} fullWidth>
                  {passed ? 'Play again' : 'Try again'}
                </Button>
              </View>
            </View>
          </MotiView>
        );
      })()}
    </ToolShell>
  );
}

interface ScoreRowProps {
  label: string;
  actualPct: number;
  targetPct: number;
  amount: number;
}

function ScoreRow({ label, actualPct, targetPct, amount }: ScoreRowProps) {
  const diff = actualPct - targetPct;
  const diffColor = Math.abs(diff) <= 5 ? '#047857' : Math.abs(diff) <= 15 ? '#B45309' : '#B91C1C';
  return (
    <View className="mb-3">
      <View className="flex-row justify-between items-baseline mb-1">
        <Text className="text-sm font-semibold text-foreground">{label}</Text>
        <Text className="text-xs text-muted-foreground">
          {formatMoney(amount)} · {Math.round(actualPct)}% (target {targetPct}%)
        </Text>
      </View>
      <View className="h-2 bg-muted rounded-full overflow-hidden">
        <View
          style={{
            width: `${Math.min(100, actualPct)}%`,
            height: '100%',
            backgroundColor: diffColor,
          }}
        />
      </View>
    </View>
  );
}

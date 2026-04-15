import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';
import {
  Shuffle,
  Check,
  X,
  RotateCcw,
  ArrowLeft,
  Trophy,
  Flame,
} from 'lucide-react-native';
import ToolShell from '../../components/ToolShell';
import Button from '../../components/Button';
import type { RootStackScreenProps } from '../../navigation/types';

interface SortItem {
  id: string;
  label: string;
  bucket: string;
  hint?: string;
}

interface Bucket {
  id: string;
  label: string;
  color: string;
}

interface Round {
  id: string;
  title: string;
  subtitle: string;
  gradient: [string, string];
  buckets: Bucket[];
  items: SortItem[];
  standards: string[];
}

const ROUNDS: Round[] = [
  {
    id: 'debt',
    title: 'Good Debt vs Bad Debt',
    subtitle: 'Some debt builds wealth. Some drains it.',
    gradient: ['#0EA5E9', '#2563EB'],
    standards: ['MC-1', 'MC-2'],
    buckets: [
      { id: 'good', label: 'Good Debt', color: '#059669' },
      { id: 'bad', label: 'Bad Debt', color: '#DC2626' },
    ],
    items: [
      { id: 'mortgage', label: 'Mortgage on a modest home', bucket: 'good', hint: 'Builds equity; interest may be deductible.' },
      { id: 'cc-balance', label: 'Credit card balance at 24% APR', bucket: 'bad', hint: 'High-interest revolving debt destroys wealth.' },
      { id: 'student-loan', label: 'Federal student loan for a career-path degree', bucket: 'good', hint: 'Invests in earning potential at a low rate.' },
      { id: 'payday', label: 'Payday loan at 400% APR', bucket: 'bad', hint: 'Predatory short-term debt — among the worst.' },
      { id: 'biz-loan', label: 'Small-business loan for an SBA-approved venture', bucket: 'good', hint: 'Debt that produces income is good debt.' },
      { id: 'bnpl', label: '"Buy Now Pay Later" on concert tickets', bucket: 'bad', hint: 'Financing a want stretches impulse spending.' },
      { id: 'luxury-car', label: '7-year loan on a luxury SUV', bucket: 'bad', hint: 'The car depreciates faster than you pay it off.' },
      { id: 'low-apr-auto', label: 'Low-APR auto loan on a reliable used car', bucket: 'good', hint: 'Reasonable rate on a depreciating but necessary asset.' },
      { id: 'heloc', label: 'HELOC to gamble on crypto', bucket: 'bad', hint: 'Secured by your house, bet on volatility — terrible.' },
      { id: 'trade-school', label: 'Loan for a licensed trade program', bucket: 'good', hint: 'High-ROI education is textbook good debt.' },
    ],
  },
  {
    id: 'categories',
    title: 'Needs vs Wants vs Savings',
    subtitle: 'The 50/30/20 categories — sort each expense.',
    gradient: ['#FF6B4A', '#F43F5E'],
    standards: ['SP-1', 'SP-2', 'SV-1'],
    buckets: [
      { id: 'need', label: 'Need', color: '#B91C1C' },
      { id: 'want', label: 'Want', color: '#B45309' },
      { id: 'savings', label: 'Savings', color: '#047857' },
    ],
    items: [
      { id: 'rent', label: 'Rent', bucket: 'need' },
      { id: 'heco', label: 'HECO electric bill', bucket: 'need' },
      { id: 'groceries', label: 'Groceries for the week', bucket: 'need' },
      { id: 'streaming', label: 'Netflix + Disney+ + Spotify', bucket: 'want' },
      { id: 'concert', label: 'Concert tickets', bucket: 'want' },
      { id: 'boba', label: 'Daily boba habit', bucket: 'want' },
      { id: 'roth', label: 'Roth IRA contribution', bucket: 'savings' },
      { id: 'emergency', label: 'Emergency fund transfer', bucket: 'savings' },
      { id: 'insurance', label: 'Car insurance premium', bucket: 'need' },
      { id: 'etf', label: 'Index fund auto-invest', bucket: 'savings' },
    ],
  },
  {
    id: 'assets',
    title: 'Stocks vs Bonds vs Real Estate',
    subtitle: 'Know your asset classes before you invest.',
    gradient: ['#8B5CF6', '#6366F1'],
    standards: ['IN-1', 'IN-2', 'IN-3'],
    buckets: [
      { id: 'stocks', label: 'Stocks', color: '#2563EB' },
      { id: 'bonds', label: 'Bonds', color: '#0891B2' },
      { id: 'realestate', label: 'Real Estate', color: '#B45309' },
    ],
    items: [
      { id: 'aapl', label: 'One share of Apple', bucket: 'stocks' },
      { id: 'spy', label: 'S&P 500 ETF', bucket: 'stocks' },
      { id: 'treasury', label: '10-year US Treasury bond', bucket: 'bonds' },
      { id: 'muni', label: 'Hawaii municipal bond', bucket: 'bonds' },
      { id: 'reit', label: 'REIT (real estate investment trust)', bucket: 'realestate' },
      { id: 'rental', label: 'Rental duplex in Hilo', bucket: 'realestate' },
      { id: 'corp-bond', label: 'Corporate bond from a Fortune 500 firm', bucket: 'bonds' },
      { id: 'mutual-eq', label: 'Equity mutual fund', bucket: 'stocks' },
      { id: 'primary-home', label: 'Purchasing a primary residence', bucket: 'realestate' },
      { id: 'dividend', label: 'Dividend-paying stock', bucket: 'stocks' },
    ],
  },
  {
    id: 'deductions',
    title: 'Tax Deduction or Not?',
    subtitle: 'Know what the IRS actually lets you deduct.',
    gradient: ['#14B8A6', '#059669'],
    standards: ['EI-1', 'SV-5'],
    buckets: [
      { id: 'deduction', label: 'Deductible', color: '#059669' },
      { id: 'not', label: 'Not a Deduction', color: '#DC2626' },
    ],
    items: [
      { id: 'mortgage-int', label: 'Mortgage interest on primary home', bucket: 'deduction' },
      { id: 'charity', label: 'Donation to a 501(c)(3) charity', bucket: 'deduction' },
      { id: 'student-int', label: 'Student loan interest (up to $2,500)', bucket: 'deduction' },
      { id: 'hsa', label: 'HSA contributions', bucket: 'deduction' },
      { id: 'gym', label: 'Personal gym membership', bucket: 'not' },
      { id: 'commute', label: 'Daily commute to your W-2 job', bucket: 'not' },
      { id: 'work-clothes', label: 'Regular clothes you wear to the office', bucket: 'not' },
      { id: 'trad-ira', label: 'Traditional IRA contribution', bucket: 'deduction' },
      { id: 'wedding', label: 'Your wedding reception', bucket: 'not' },
      { id: 'se-health', label: 'Self-employed health insurance premiums', bucket: 'deduction' },
    ],
  },
];

type GameState = 'select' | 'playing' | 'done';

export default function MoneySortScreen(_props: RootStackScreenProps<'MoneySort'>) {
  const [state, setState] = useState<GameState>('select');
  const [round, setRound] = useState<Round | null>(null);
  const [index, setIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [log, setLog] = useState<{ itemId: string; correct: boolean; picked: string }[]>([]);
  const [flash, setFlash] = useState<{ bucketId: string; correct: boolean } | null>(null);

  function startRound(r: Round) {
    setRound(r);
    setIndex(0);
    setStreak(0);
    setBestStreak(0);
    setScore(0);
    setLog([]);
    setFlash(null);
    setState('playing');
  }

  function goToSelect() {
    setState('select');
    setRound(null);
  }

  function handleTap(bucketId: string) {
    if (!round || flash) return;
    const item = round.items[index];
    if (!item) return;
    const correct = item.bucket === bucketId;

    setLog((l) => [...l, { itemId: item.id, correct, picked: bucketId }]);
    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));
      setScore((s) => s + 10 + (newStreak - 1) * 2);
    } else {
      setStreak(0);
    }

    setFlash({ bucketId, correct });
    setTimeout(() => {
      setFlash(null);
      if (index + 1 >= round.items.length) {
        setState('done');
      } else {
        setIndex((i) => i + 1);
      }
    }, 900);
  }

  if (state === 'select') {
    return (
      <ToolShell
        title="Money Sort"
        description="Pick a round. Tap each item into the right bucket. Streaks earn bonus points."
        gradient={['#14B8A6', '#0EA5E9']}
        standards={['Mixed']}
        Icon={({ color, size }) => <Shuffle color={color} size={size} />}
        backLabel="Back to games"
      >
        <View className="gap-3">
          {ROUNDS.map((r, i) => (
            <MotiView
              key={r.id}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: i * 60 }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={r.title}
                onPress={() => startRound(r)}
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
                  colors={r.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ height: 6 }}
                />
                <View className="p-4">
                  <Text className="font-semibold text-card-foreground">{r.title}</Text>
                  <Text className="text-sm text-muted-foreground mt-0.5">{r.subtitle}</Text>
                  <View className="flex-row gap-1.5 mt-2">
                    {r.buckets.map((b) => (
                      <View
                        key={b.id}
                        className="rounded-full px-2 py-0.5"
                        style={{ backgroundColor: `${b.color}15` }}
                      >
                        <Text className="text-[10px] font-semibold" style={{ color: b.color }}>
                          {b.label}
                        </Text>
                      </View>
                    ))}
                    <View className="ml-auto bg-muted rounded-full px-2 py-0.5">
                      <Text className="text-[10px] text-muted-foreground">
                        {r.items.length} items
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            </MotiView>
          ))}
        </View>
      </ToolShell>
    );
  }

  if (!round) return null;

  if (state === 'done') {
    const correctCount = log.filter((l) => l.correct).length;
    const perfect = correctCount === round.items.length;
    return (
      <ToolShell
        title="Money Sort"
        description={round.title}
        gradient={round.gradient}
        standards={round.standards}
        Icon={({ color, size }) => <Shuffle color={color} size={size} />}
        backLabel="Back to games"
      >
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
          <View className="p-5" style={{ backgroundColor: perfect ? '#059669' : '#0B5E8C' }}>
            <View className="flex-row items-center gap-2">
              <Trophy color="white" size={24} />
              <Text className="text-2xl font-bold text-white">
                {perfect ? 'PERFECT!' : 'Round complete'}
              </Text>
            </View>
            <Text className="text-white/90 text-sm mt-1">
              {correctCount} of {round.items.length} correct.
            </Text>
          </View>

          <View className="p-6">
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-muted rounded-2xl p-4">
                <Text className="text-xs text-muted-foreground">Score</Text>
                <Text className="text-3xl font-bold text-foreground">{score}</Text>
              </View>
              <View className="flex-1 bg-muted rounded-2xl p-4">
                <View className="flex-row items-center gap-1">
                  <Flame color="#F97316" size={14} />
                  <Text className="text-xs text-muted-foreground">Best streak</Text>
                </View>
                <Text className="text-3xl font-bold text-foreground">{bestStreak}</Text>
              </View>
            </View>

            <Text className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Review
            </Text>
            {round.items.map((item, i) => {
              const entry = log[i];
              const bucket = round.buckets.find((b) => b.id === item.bucket);
              return (
                <View
                  key={item.id}
                  className="flex-row items-start gap-2 py-2 border-b border-border"
                >
                  {entry?.correct ? (
                    <Check color="#059669" size={16} />
                  ) : (
                    <X color="#DC2626" size={16} />
                  )}
                  <View className="flex-1">
                    <Text className="text-sm text-foreground">{item.label}</Text>
                    <Text className="text-xs text-muted-foreground mt-0.5">
                      Correct bucket: {bucket?.label}
                      {item.hint ? ` · ${item.hint}` : ''}
                    </Text>
                  </View>
                </View>
              );
            })}

            <View className="mt-5 gap-2">
              <Button
                onPress={() => startRound(round)}
                leftIcon={<RotateCcw color="white" size={18} />}
                fullWidth
              >
                Play again
              </Button>
              <Button
                onPress={goToSelect}
                variant="secondary"
                leftIcon={<ArrowLeft color="#374151" size={18} />}
                fullWidth
              >
                Pick another round
              </Button>
            </View>
          </View>
        </MotiView>
      </ToolShell>
    );
  }

  // Playing state
  const currentItem = round.items[index];
  const correctBucket = round.buckets.find((b) => b.id === currentItem.bucket);

  return (
    <ToolShell
      title="Money Sort"
      description={round.title}
      gradient={round.gradient}
      standards={round.standards}
      Icon={({ color, size }) => <Shuffle color={color} size={size} />}
      backLabel="Back to games"
    >
      <View className="flex-row gap-3 mb-3">
        <View className="flex-1 bg-card rounded-2xl p-3">
          <Text className="text-[10px] text-muted-foreground uppercase tracking-wide">Score</Text>
          <Text className="text-lg font-bold text-foreground">{score}</Text>
        </View>
        <View className="flex-1 bg-card rounded-2xl p-3">
          <View className="flex-row items-center gap-1">
            <Flame color="#F97316" size={12} />
            <Text className="text-[10px] text-muted-foreground uppercase tracking-wide">Streak</Text>
          </View>
          <Text className="text-lg font-bold text-foreground">{streak}</Text>
        </View>
        <View className="flex-1 bg-card rounded-2xl p-3">
          <Text className="text-[10px] text-muted-foreground uppercase tracking-wide">Item</Text>
          <Text className="text-lg font-bold text-foreground">
            {index + 1}
            <Text className="text-sm text-muted-foreground">/{round.items.length}</Text>
          </Text>
        </View>
      </View>

      <AnimatePresence exitBeforeEnter>
        <MotiView
          key={currentItem.id + (flash ? '-flash' : '')}
          from={{ opacity: 0, translateX: 40 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: -40 }}
          transition={{ type: 'timing', duration: 220 }}
          className="bg-card rounded-2xl p-6 mb-4 min-h-[140px] justify-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          {flash ? (
            <View>
              <View className="flex-row items-center gap-2 mb-2">
                {flash.correct ? (
                  <>
                    <Check color="#059669" size={20} />
                    <Text className="font-bold text-emerald-700">Correct!</Text>
                  </>
                ) : (
                  <>
                    <X color="#DC2626" size={20} />
                    <Text className="font-bold text-red-700">Wrong bucket</Text>
                  </>
                )}
                <View className="ml-auto rounded-full px-2 py-0.5" style={{ backgroundColor: `${correctBucket?.color ?? '#000'}15` }}>
                  <Text className="text-[10px] font-semibold" style={{ color: correctBucket?.color }}>
                    {correctBucket?.label}
                  </Text>
                </View>
              </View>
              <Text className="text-base font-semibold text-card-foreground">
                {currentItem.label}
              </Text>
              {currentItem.hint && (
                <Text className="text-sm text-muted-foreground mt-1">{currentItem.hint}</Text>
              )}
            </View>
          ) : (
            <View className="items-center">
              <Text className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
                Sort this into the right bucket
              </Text>
              <Text className="text-xl font-bold text-card-foreground text-center">
                {currentItem.label}
              </Text>
            </View>
          )}
        </MotiView>
      </AnimatePresence>

      <View className={round.buckets.length === 2 ? 'flex-row gap-3' : 'gap-3'}>
        {round.buckets.map((b) => {
          const isFlashing = flash?.bucketId === b.id;
          const flashBg = isFlashing
            ? flash.correct
              ? '#059669'
              : '#DC2626'
            : b.color;
          return (
            <Pressable
              key={b.id}
              accessibilityRole="button"
              accessibilityLabel={b.label}
              disabled={!!flash}
              onPress={() => handleTap(b.id)}
              className={`rounded-2xl items-center justify-center ${round.buckets.length === 2 ? 'flex-1 h-20' : 'h-16'} ${flash && !isFlashing ? 'opacity-40' : ''}`}
              style={{ backgroundColor: flashBg }}
            >
              <Text className="text-white font-bold text-lg">{b.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </ToolShell>
  );
}

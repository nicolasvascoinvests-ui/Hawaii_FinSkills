import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Wallet, Zap, Shuffle } from 'lucide-react-native';
import Screen from '../components/Screen';
import type { MainTabScreenProps } from '../navigation/types';
import type { RootStackParamList } from '../navigation/types';

interface Game {
  Icon: typeof Wallet;
  title: string;
  desc: string;
  route: keyof RootStackParamList;
  gradient: [string, string];
  standards: string[];
  duration: string;
}

const GAMES: Game[] = [
  {
    Icon: Wallet,
    title: 'Budget Blitz',
    desc: 'Swipe through a month of expenses and land near the 50/30/20 rule',
    route: 'BudgetBlitz',
    gradient: ['#FF6B4A', '#F43F5E'],
    standards: ['SP-1', 'SP-2', 'SV-1'],
    duration: '~2 min',
  },
  {
    Icon: Zap,
    title: 'Myth Buster',
    desc: 'FACT or MYTH? Tap fast and build a streak for bonus points',
    route: 'MythBuster',
    gradient: ['#8B5CF6', '#6366F1'],
    standards: ['Mixed'],
    duration: '~90 sec',
  },
  {
    Icon: Shuffle,
    title: 'Money Sort',
    desc: 'Drop items into the right bucket — good/bad debt, asset classes, deductions',
    route: 'MoneySort',
    gradient: ['#14B8A6', '#0EA5E9'],
    standards: ['MC-1', 'IN-2', 'SP-1'],
    duration: '~1 min/round',
  },
];

export default function GamesScreen({ navigation }: MainTabScreenProps<'Games'>) {
  return (
    <Screen>
      <View className="px-4 py-6">
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }}>
          <Text className="text-2xl font-bold text-foreground mb-1">Practice Games</Text>
          <Text className="text-muted-foreground text-sm mb-6">
            Short, replayable games to sharpen the money skills you're learning.
          </Text>
        </MotiView>

        <View className="gap-3">
          {GAMES.map((game, i) => (
            <MotiView
              key={game.title}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: i * 80 }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={game.title}
                onPress={() => navigation.navigate(game.route as never)}
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
                  colors={game.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ height: 6 }}
                />
                <View className="p-5 flex-row items-start gap-4">
                  <LinearGradient
                    colors={game.gradient}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <game.Icon color="white" size={22} />
                  </LinearGradient>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="font-semibold text-card-foreground">{game.title}</Text>
                      <View className="bg-muted rounded-full px-2 py-0.5">
                        <Text className="text-[10px] text-muted-foreground">{game.duration}</Text>
                      </View>
                    </View>
                    <Text className="text-sm text-muted-foreground mt-0.5">{game.desc}</Text>
                    <View className="flex-row flex-wrap gap-1.5 mt-2">
                      {game.standards.map((code) => (
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

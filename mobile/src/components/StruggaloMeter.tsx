import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Skull, Trophy } from 'lucide-react-native';
import { useStruggaloProgress } from '../hooks/useStruggaloProgress';

const STRUGGALO_HAPPY = require('../../assets/struggalo/struggalo-happy.jpeg');
const STRUGGALO_MAD = require('../../assets/struggalo/struggalo-mad.jpeg');

export default function StruggaloMeter() {
  const progress = useStruggaloProgress();

  if (progress.allDefeated) {
    return <FinalVictory defeatedCount={progress.defeatedCount} />;
  }

  const { activeTheme, currentHP, maxHP, defeatedCount, totalThemes } = progress;
  const hpPercent = (currentHP / maxHP) * 100;
  const damagePercent = 100 - hpPercent;
  const bossNumber = defeatedCount + 1;

  const taunt =
    hpPercent === 100
      ? 'Pass quizzes to defeat the struggle 💥'
      : hpPercent < 20
        ? 'Almost done — finish him! 🔥'
        : hpPercent < 50
          ? 'Keep hitting! He\'s wobbling 😵‍💫'
          : `${Math.round(damagePercent)}% defeated`;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: 25 }}
      style={{ marginBottom: 16 }}
      accessibilityRole="progressbar"
      accessibilityLabel={`Boss ${bossNumber} of ${totalThemes}: ${activeTheme.label} Struggalo. ${Math.round(currentHP)} of ${maxHP} HP remaining. ${Math.round(damagePercent)} percent defeated.`}
    >
      <LinearGradient
        colors={['#4c1d95', '#3b0764']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor: 'rgba(168,85,247,0.35)',
        }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <Skull color="#fbbf24" size={14} />
            <Text className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              Boss {bossNumber} of {totalThemes}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Text className="text-[10px] text-white/70 uppercase font-semibold">
              {activeTheme.icon} {activeTheme.label}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-3">
          <MotiView
            from={{ rotate: hpPercent < 33 ? '-5deg' : '-3deg' }}
            animate={{ rotate: hpPercent < 33 ? '5deg' : '3deg' }}
            transition={{
              type: 'timing',
              duration: hpPercent < 33 ? 220 : 1800,
              loop: true,
              repeatReverse: true,
            }}
          >
            <StruggaloAliveAvatar hpPercent={hpPercent} />
          </MotiView>

          <View className="flex-1">
            <View className="flex-row items-baseline justify-between mb-1.5">
              <Text className="text-white font-bold text-base">Struggalo</Text>
              <Text className="text-amber-300 text-xs font-mono">
                {Math.round(currentHP)} / {maxHP} HP
              </Text>
            </View>

            <View
              className="h-3 rounded-full overflow-hidden"
              style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
              }}
            >
              <View style={{ width: `${hpPercent}%`, height: '100%' }}>
                <LinearGradient
                  colors={['#dc2626', '#f59e0b']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1, borderRadius: 999 }}
                />
              </View>
            </View>

            <Text className="text-white/70 text-xs mt-2">{taunt}</Text>
          </View>
        </View>
      </LinearGradient>
    </MotiView>
  );
}

function FinalVictory({ defeatedCount }: { defeatedCount: number }) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 25, type: 'spring' }}
      style={{ marginBottom: 16 }}
      accessibilityRole="text"
      accessibilityLabel={`All ${defeatedCount} Struggalos defeated. Financial literacy mastered.`}
    >
      <LinearGradient
        colors={['#fbbf24', '#f97316']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 20, padding: 16 }}
      >
        <View className="flex-row items-center gap-3">
          <Trophy color="#fff" size={36} />
          <View className="flex-1">
            <Text className="text-white font-bold text-base">
              All {defeatedCount} Struggalos Defeated!
            </Text>
            <Text className="text-white/90 text-xs mt-0.5">
              You sent the struggle packing across all six themes 🏆
            </Text>
          </View>
        </View>
      </LinearGradient>
    </MotiView>
  );
}

function StruggaloAliveAvatar({ hpPercent }: { hpPercent: number }) {
  const isHurt = hpPercent < 33;
  const isHealthy = hpPercent > 66;
  const source = isHurt ? STRUGGALO_MAD : STRUGGALO_HAPPY;
  const ringColor = isHurt
    ? 'rgba(220,38,38,0.7)'
    : isHealthy
      ? 'rgba(251,191,36,0.65)'
      : 'rgba(244,114,182,0.6)';

  return (
    <View style={{ width: 72, height: 72, position: 'relative' }}>
      <Image
        source={source}
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          borderWidth: 2,
          borderColor: ringColor,
        }}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
      {isHealthy && (
        <Text
          style={{
            position: 'absolute',
            right: -4,
            top: -2,
            fontSize: 16,
            zIndex: 2,
          }}
        >
          💰
        </Text>
      )}
      {isHurt && (
        <Text
          style={{
            position: 'absolute',
            right: -2,
            top: 2,
            fontSize: 14,
            zIndex: 2,
          }}
        >
          💢
        </Text>
      )}
    </View>
  );
}

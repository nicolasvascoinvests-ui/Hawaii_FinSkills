import { useMemo } from 'react';
import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

const STRUGGALO_MAD = require('../../assets/struggalo/struggalo-mad.jpeg');
const STRUGGALO_HAPPY = require('../../assets/struggalo/struggalo-happy.jpeg');

type StruggaloVariant = 'defeated' | 'taunting';

interface StruggaloProps {
  learnerName: string;
  variant?: StruggaloVariant;
}

const DEFEAT_LINES = [
  'Ugh... you actually KNOW this stuff?!',
  'Curses! Foiled by financial literacy!',
  'How did you ace every single one?!',
  'Fine. You win this round, money master.',
  "I'll get you when you forget compound interest...",
  'You broke free from the struggle. For now.',
  'Bah! My budget-busting powers are useless against you!',
  "Don't get cocky — debt never sleeps...",
];

const TAUNT_LINES = [
  'Welcome to the struggle, kid. Plenty of room down here.',
  "Heh heh — you're gonna end up just like me. Broke and beautiful.",
  "Compound interest? Never heard of her. We're twins now.",
  'Future overdraft buddy in the making! I love it.',
  "Don't worry, the struggle bus has open seats.",
  "That's it... let the bad money habits flow through you.",
  "Ahhh, another one for Team Living-Paycheck-to-Paycheck!",
  "Keep guessing like that and we'll be roommates by 25.",
];

export default function Struggalo({
  learnerName,
  variant = 'defeated',
}: StruggaloProps) {
  const isTaunting = variant === 'taunting';
  const lines = isTaunting ? TAUNT_LINES : DEFEAT_LINES;
  const line = useMemo(
    () => lines[Math.floor(Math.random() * lines.length)],
    [lines],
  );

  const headerText = isTaunting
    ? '😈 Struggalo, gloating'
    : '💥 Struggalo, defeated';
  const headerAccent = isTaunting ? 'text-pink-300' : 'text-amber-300';
  const tagText = isTaunting ? 'Time to study' : 'Perfect score';
  const gradientColors: [string, string] = isTaunting
    ? ['#831843', '#3b0764']
    : ['#4c1d95', '#3b0764'];
  const borderColor = isTaunting
    ? 'rgba(244,114,182,0.4)'
    : 'rgba(168,85,247,0.35)';
  const bubbleBorder = isTaunting
    ? 'rgba(244,114,182,0.3)'
    : 'rgba(168,85,247,0.25)';
  const a11yLabel = isTaunting
    ? `Struggalo is taunting you. He says: ${line}`
    : `Struggalo defeated. He says: ${line}`;

  return (
    <MotiView
      from={{ opacity: 0, translateY: -16, scale: 0.85 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ delay: 350, type: 'spring', damping: 12 }}
      style={{ width: '100%', marginBottom: 16 }}
      accessible
      accessibilityLabel={a11yLabel}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor,
        }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <Text
              className={`text-[10px] font-bold uppercase tracking-wider ${headerAccent}`}
            >
              {headerText}
            </Text>
          </View>
          <Text className="text-[10px] text-white/70 uppercase font-semibold">
            {tagText}
          </Text>
        </View>

        <View className="flex-row items-start gap-3">
          <MotiView
            from={{ scale: 0.2, rotate: '0deg', translateY: -8 }}
            animate={
              isTaunting
                ? {
                    scale: [
                      { value: 1.15, duration: 280 },
                      { value: 0.97, duration: 180 },
                      { value: 1, duration: 160 },
                    ],
                    rotate: [
                      { value: '-8deg', duration: 220 },
                      { value: '8deg', duration: 240 },
                      { value: '-6deg', duration: 240 },
                      { value: '6deg', duration: 240 },
                      { value: '-3deg', duration: 240 },
                      { value: '0deg', duration: 360 },
                    ],
                    translateY: [
                      { value: -4, duration: 240 },
                      { value: 2, duration: 220 },
                      { value: -2, duration: 220 },
                      { value: 0, duration: 200 },
                    ],
                  }
                : {
                    scale: [
                      { value: 1.25, duration: 280 },
                      { value: 0.95, duration: 180 },
                      { value: 1, duration: 160 },
                    ],
                    rotate: [
                      { value: '-20deg', duration: 180 },
                      { value: '20deg', duration: 200 },
                      { value: '-16deg', duration: 200 },
                      { value: '14deg', duration: 200 },
                      { value: '-10deg', duration: 200 },
                      { value: '8deg', duration: 200 },
                      { value: '-4deg', duration: 200 },
                      { value: '0deg', duration: 320 },
                    ],
                    translateY: [
                      { value: 4, duration: 220 },
                      { value: -2, duration: 180 },
                      { value: 0, duration: 200 },
                    ],
                  }
            }
          >
            <StruggaloAvatar variant={variant} />
          </MotiView>

          <View className="flex-1">
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderRadius: 14,
                padding: 10,
                borderWidth: 1,
                borderColor: bubbleBorder,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontStyle: 'italic',
                  color: '#1e1b4b',
                  lineHeight: 18,
                }}
              >
                "{line}"
              </Text>
            </View>
            {isTaunting ? (
              <Text className="text-white/80 text-xs mt-2">
                Don't let him win,{' '}
                <Text className="text-pink-300 font-bold">{learnerName}</Text>.
                Review the lesson and run it back. 💪
              </Text>
            ) : (
              <Text className="text-white/80 text-xs mt-2">
                You sent the struggle packing,{' '}
                <Text className="text-amber-300 font-bold">{learnerName}</Text>.
                ⚡
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>
    </MotiView>
  );
}

function StruggaloAvatar({ variant }: { variant: StruggaloVariant }) {
  const isTaunting = variant === 'taunting';
  const source = isTaunting ? STRUGGALO_HAPPY : STRUGGALO_MAD;
  const ringColor = isTaunting
    ? 'rgba(244,114,182,0.7)'
    : 'rgba(251,191,36,0.65)';
  const sparkColor = isTaunting ? '#f472b6' : '#fbbf24';

  return (
    <View style={{ width: 88, height: 88, position: 'relative' }}>
      <Image
        source={source}
        style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          borderWidth: 2,
          borderColor: ringColor,
        }}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />

      <Text
        style={{
          position: 'absolute',
          left: -4,
          top: 0,
          fontSize: 14,
          color: sparkColor,
          zIndex: 2,
        }}
      >
        {isTaunting ? '★' : '✦'}
      </Text>
      <Text
        style={{
          position: 'absolute',
          right: -2,
          top: 6,
          fontSize: 11,
          color: sparkColor,
          zIndex: 2,
        }}
      >
        {isTaunting ? '★' : '✦'}
      </Text>
      <Text
        style={{
          position: 'absolute',
          right: -6,
          top: 28,
          fontSize: 9,
          color: sparkColor,
          zIndex: 2,
        }}
      >
        {isTaunting ? '★' : '✦'}
      </Text>
    </View>
  );
}

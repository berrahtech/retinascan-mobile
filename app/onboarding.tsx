import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RetinaPulse } from '@/components/RetinaPulse';
import { SeverityScale } from '@/components/SeverityScale';
import { StepFlow } from '@/components/StepFlow';
import { DISCLAIMER_TEXT } from '@/data/legal';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { Txt } from '@/components/ui/Text';
import { useSettings } from '@/store/settings';
import { useTheme } from '@/theme';
import { haptics } from '@/utils/haptics';

const SLIDES = [
  {
    key: 'intro',
    title: 'Votre rétine parle de votre santé',
    body: "Le fond d'œil est le seul endroit du corps où l'on observe directement les vaisseaux sanguins. Le diabète y laisse ses premières traces bien avant que la vision ne baisse.",
  },
  {
    key: 'flow',
    title: 'Trois gestes, une évaluation',
    body: "Photographiez la rétine, laissez le modèle analyser l'image, recevez un rapport clair avec la conduite à tenir et un PDF partageable avec votre médecin.",
  },
  {
    key: 'scope',
    title: 'Un outil d’aide, pas un diagnostic',
    body: DISCLAIMER_TEXT,
  },
];

export default function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const completeOnboarding = useSettings((s) => s.completeOnboarding);

  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    if (next !== index) {
      setIndex(next);
      haptics.select();
    }
  };

  const finish = () => {
    haptics.success();
    completeOnboarding();
    router.replace('/');
  };

  const goNext = () => {
    if (isLast) finish();
    else scrollRef.current?.scrollTo({ x: (index + 1) * screenWidth, animated: true });
  };

  /** Illustration propre à chaque diapositive. */
  const illustration = (key: string) => {
    if (key === 'intro') return <RetinaPulse size={190} />;
    if (key === 'flow') {
      return (
        <View style={{ width: screenWidth - 96 }}>
          <StepFlow />
        </View>
      );
    }
    return (
      <View style={{ width: screenWidth - 96, gap: 24 }}>
        <SeverityScale value={2} showLabel />
        <View
          style={[
            styles.scopeCard,
            {
              backgroundColor: theme.colors.surfaceStrong,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.lg,
            },
          ]}
        >
          <Ionicons name="medkit-outline" size={20} color={theme.colors.accent} />
          <Txt variant="caption" color="secondary" style={{ flex: 1 }}>
            Le rapport se lit en consultation : stade, signes détectés et délai de
            recontrôle recommandé.
          </Txt>
        </View>
      </View>
    );
  };

  return (
    <Screen>
      <View style={[styles.topBar, { paddingHorizontal: theme.spacing.xl }]}>
        <View style={[styles.brand, { gap: theme.spacing.sm }]}>
          <Ionicons name="eye" size={18} color={theme.colors.accent} />
          <View>
            <Txt variant="caption" weight="800">
              RetinaScan
            </Txt>
            <Txt variant="micro" color="muted">
              Voir au-delà, diagnostiquer avec précision
            </Txt>
          </View>
        </View>
        {!isLast && (
          <PressableScale onPress={finish} activeScale={0.94}>
            <Txt variant="caption" color="muted">
              Passer
            </Txt>
          </PressableScale>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, slideIndex) => (
          <View key={slide.key} style={[styles.slide, { width: screenWidth }]}>
            <Animated.View
              entering={FadeIn.delay(slideIndex === 0 ? 120 : 0).duration(600)}
              style={styles.illustration}
            >
              {illustration(slide.key)}
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200).duration(500)}>
              <Txt variant="display" align="center">
                {slide.title}
              </Txt>
              <Txt
                variant="body"
                color="secondary"
                align="center"
                style={{ marginTop: theme.spacing.lg }}
              >
                {slide.body}
              </Txt>
            </Animated.View>
          </View>
        ))}
      </ScrollView>

      <Animated.View
        entering={FadeInDown.delay(300).duration(500)}
        style={[
          styles.footer,
          {
            paddingHorizontal: theme.spacing.xxl,
            paddingBottom: Math.max(insets.bottom, theme.spacing.xl),
            gap: theme.spacing.xl,
          },
        ]}
      >
        <View style={styles.dots}>
          {SLIDES.map((slide, dotIndex) => (
            <View
              key={slide.key}
              style={{
                width: dotIndex === index ? 22 : 7,
                height: 7,
                borderRadius: 4,
                backgroundColor:
                  dotIndex === index ? theme.colors.primary : theme.colors.surfaceStrong,
              }}
            />
          ))}
        </View>

        <Button
          label={isLast ? "J'ai compris, commencer" : 'Continuer'}
          icon={isLast ? 'checkmark' : 'arrow-forward'}
          iconRight={!isLast}
          block
          size="lg"
          onPress={goNext}
        />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  brand: { flexDirection: 'row', alignItems: 'center' },
  // Pas de `flex` ici : la largeur d'une diapositive est exactement celle de
  // l'écran, sinon la pagination et le retour à la ligne se décalent.
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  illustration: { height: 230, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  footer: { alignItems: 'center' },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scopeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
});

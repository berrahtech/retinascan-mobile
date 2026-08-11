import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Screen } from '@/components/ui/Screen';
import { Txt } from '@/components/ui/Text';
import { ANALYSIS_STAGES, analyzeRetina, isAbortError } from '@/services/analysis';
import { persistScanImage } from '@/services/imageStore';
import { useScans } from '@/store/scans';
import { useTheme } from '@/theme';
import type { Eye } from '@/types';
import { haptics } from '@/utils/haptics';

const PREVIEW = 190;

export default function AnalyzingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ uri: string; eye?: Eye }>();
  const addScan = useScans((s) => s.addScan);

  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const sweep = useSharedValue(0);
  const halo = useSharedValue(0);

  useEffect(() => {
    sweep.value = withRepeat(
      withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    halo.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [halo, sweep]);

  useEffect(() => {
    if (!params.uri) {
      setError("Aucune image à analyser.");
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    let cancelled = false;

    analyzeRetina(params.uri, {
      eye: params.eye ?? 'unknown',
      signal: controller.signal,
      onProgress: ({ stageIndex: index, progress: value }) => {
        if (cancelled) return;
        setStageIndex(index);
        setProgress(value);
      },
    })
      .then(async (result) => {
        if (cancelled) return;
        // On met l'image à l'abri des purges de cache avant d'enregistrer le
        // scan, pour que la vignette, l'aperçu et le PDF la conservent.
        const imageUri = await persistScanImage(result.imageUri, result.id);
        if (cancelled) return;
        addScan({ ...result, imageUri });
        haptics.success();
        router.replace(`/result/${result.id}`);
      })
      .catch((err: unknown) => {
        if (cancelled || isAbortError(err)) return;
        haptics.error();
        setError(
          err instanceof Error ? err.message : "L'analyse n'a pas pu être menée à son terme.",
        );
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
    // L'analyse ne doit être lancée qu'une fois, à l'arrivée sur l'écran.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(sweep.value, [0, 1], [-PREVIEW / 2, PREVIEW / 2]) }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + halo.value * 0.08 }],
    opacity: 0.25 + halo.value * 0.3,
  }));

  const cancel = () => {
    controllerRef.current?.abort();
    router.back();
  };

  /* --- Erreur ------------------------------------------------------- */
  if (error) {
    return (
      <Screen>
        <View style={styles.centerScreen}>
          <View
            style={[
              styles.errorIcon,
              { backgroundColor: theme.colors.dangerSoft, borderRadius: theme.radius.xxl },
            ]}
          >
            <Ionicons name="alert-circle-outline" size={32} color={theme.colors.danger} />
          </View>
          <Txt variant="title" align="center" style={{ marginTop: theme.spacing.xl }}>
            Analyse interrompue
          </Txt>
          <Txt
            variant="body"
            color="secondary"
            align="center"
            style={{ marginTop: theme.spacing.sm, maxWidth: 320 }}
          >
            {error}
          </Txt>
          <Button
            label="Reprendre une photo"
            icon="camera"
            onPress={() => router.replace('/scan/capture')}
            style={{ marginTop: theme.spacing.xxl }}
            size="lg"
          />
          <Button
            label="Retour à l’accueil"
            variant="ghost"
            onPress={() => router.replace('/')}
            style={{ marginTop: theme.spacing.xs }}
          />
        </View>
      </Screen>
    );
  }

  /* --- Analyse en cours --------------------------------------------- */
  const currentStage = ANALYSIS_STAGES[stageIndex];

  return (
    <Screen>
      <View style={[styles.centerScreen, { paddingHorizontal: theme.spacing.xxl }]}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.previewWrap}>
          {/* Halo pulsé derrière l'aperçu. */}
          <Animated.View
            style={[
              styles.halo,
              haloStyle,
              { backgroundColor: theme.colors.primary, borderRadius: PREVIEW },
            ]}
          />

          <ProgressRing
            progress={progress}
            size={PREVIEW + 34}
            thickness={5}
            color={theme.colors.accent}
            colorEnd={theme.colors.primary}
            duration={480}
            gradientId="analysis"
          >
            <View
              style={[
                styles.preview,
                { borderRadius: PREVIEW / 2, borderColor: theme.colors.border },
              ]}
            >
              <Image
                source={{ uri: params.uri }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={300}
              />
              {/* Trame d'analyse superposée à l'image. */}
              <Svg width={PREVIEW} height={PREVIEW} style={StyleSheet.absoluteFill}>
                {[0.32, 0.58, 0.84].map((r) => (
                  <Circle
                    key={r}
                    cx={PREVIEW / 2}
                    cy={PREVIEW / 2}
                    r={(PREVIEW / 2) * r}
                    stroke={theme.colors.accent}
                    strokeWidth={0.8}
                    strokeDasharray="2 7"
                    fill="none"
                    opacity={0.5}
                  />
                ))}
              </Svg>
              <Animated.View style={[styles.sweepWrap, sweepStyle]}>
                <LinearGradient
                  colors={['transparent', `${theme.colors.accent}EE`, 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.sweepLine}
                />
              </Animated.View>
            </View>
          </ProgressRing>
        </Animated.View>

        <Txt variant="title" align="center" style={{ marginTop: theme.spacing.xxxl }}>
          Analyse en cours
        </Txt>
        <Txt
          variant="body"
          color="secondary"
          align="center"
          style={{ marginTop: theme.spacing.xs }}
        >
          {currentStage?.label ?? 'Préparation'}
        </Txt>
        <Txt variant="metric" color={theme.colors.accent} style={{ marginTop: theme.spacing.md }}>
          {Math.round(progress * 100)}%
        </Txt>

        {/* Détail des étapes. */}
        <View style={{ marginTop: theme.spacing.xxxl, alignSelf: 'stretch', gap: theme.spacing.sm }}>
          {ANALYSIS_STAGES.map((stage, index) => {
            const done = index < stageIndex;
            const active = index === stageIndex;
            return (
              <Animated.View
                key={stage.key}
                entering={FadeInDown.delay(index * 70).duration(360)}
                style={[styles.stageRow, { gap: theme.spacing.md }]}
              >
                <View
                  style={[
                    styles.stageDot,
                    {
                      borderRadius: 11,
                      backgroundColor: done
                        ? theme.colors.success
                        : active
                          ? theme.colors.accentSoft
                          : theme.colors.surfaceStrong,
                      borderColor: active ? theme.colors.accent : 'transparent',
                    },
                  ]}
                >
                  {done ? (
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  ) : (
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: active ? theme.colors.accent : theme.colors.textMuted,
                      }}
                    />
                  )}
                </View>
                <Txt
                  variant="caption"
                  color={done ? 'secondary' : active ? 'default' : 'muted'}
                  weight={active ? '700' : '400'}
                  style={{ flex: 1 }}
                >
                  {stage.label}
                </Txt>
              </Animated.View>
            );
          })}
        </View>

        <Button
          label="Annuler"
          variant="ghost"
          size="sm"
          onPress={cancel}
          style={{ marginTop: theme.spacing.xxl }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorIcon: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center' },

  previewWrap: { alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: PREVIEW, height: PREVIEW },
  preview: {
    width: PREVIEW,
    height: PREVIEW,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth * 2,
    backgroundColor: '#0E0A1F',
  },
  sweepWrap: { position: 'absolute', left: 0, right: 0, height: 3, alignItems: 'center' },
  sweepLine: { width: '100%', height: 3 },

  stageRow: { flexDirection: 'row', alignItems: 'center' },
  stageDot: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
});

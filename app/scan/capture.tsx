import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScanReticle } from '@/components/ScanReticle';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Txt } from '@/components/ui/Text';
import { pickRetinaImage } from '@/services/pickImage';
import { useTheme } from '@/theme';
import type { Eye } from '@/types';
import { haptics } from '@/utils/haptics';

/** Conseils affichés en rotation sous le repère de visée. */
const TIPS = [
  'Cadrez la rétine dans le cercle, pupille bien centrée.',
  'Tenez l’appareil à environ 10 cm de l’objectif du rétinographe.',
  'Évitez les reflets : éteignez les sources lumineuses directes.',
  'Restez immobile jusqu’à la fin de la capture.',
];

export default function CaptureScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const cameraRef = useRef<CameraView>(null);

  const reticleSize = Math.min(screenWidth - 56, 330);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [torch, setTorch] = useState(false);
  const [eye, setEye] = useState<Eye>('right');
  const [capturing, setCapturing] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  const flash = useSharedValue(0);

  useEffect(() => {
    const timer = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 4200);
    return () => clearInterval(timer);
  }, []);

  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));

  const goToAnalysis = (uri: string) => {
    router.replace({ pathname: '/scan/analyzing', params: { uri, eye } });
  };

  const handleCapture = async () => {
    if (capturing || !cameraRef.current) return;
    setCapturing(true);
    haptics.shutter();
    // Éclair blanc synchronisé avec l'obturateur.
    flash.value = withSequence(
      withTiming(0.85, { duration: 70, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 240 }),
    );

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.92, exif: false });
      if (photo?.uri) goToAnalysis(photo.uri);
      else setCapturing(false);
    } catch {
      haptics.error();
      setCapturing(false);
    }
  };

  const handleImport = async () => {
    const uri = await pickRetinaImage();
    if (uri) goToAnalysis(uri);
  };

  /* --- Permission non accordée ------------------------------------- */
  if (!permission?.granted) {
    return (
      <Screen>
        <View style={[styles.permission, { padding: theme.spacing.xxl }]}>
          <View
            style={[
              styles.permissionIcon,
              { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.xxl },
            ]}
          >
            <Ionicons name="camera-outline" size={32} color={theme.colors.primary} />
          </View>
          <Txt variant="title" align="center" style={{ marginTop: theme.spacing.xl }}>
            Accès à la caméra
          </Txt>
          <Txt
            variant="body"
            color="secondary"
            align="center"
            style={{ marginTop: theme.spacing.sm, maxWidth: 320 }}
          >
            RetinaScan a besoin de l’appareil photo pour capturer l’image du fond
            d’œil. Aucune image n’est envoyée sans votre action.
          </Txt>
          <Button
            label="Autoriser la caméra"
            icon="lock-open-outline"
            onPress={requestPermission}
            style={{ marginTop: theme.spacing.xxl }}
            size="lg"
          />
          <Button
            label="Importer une image"
            variant="ghost"
            icon="images-outline"
            onPress={handleImport}
            style={{ marginTop: theme.spacing.xs }}
          />
          <Button
            label="Retour"
            variant="ghost"
            onPress={() => router.back()}
            style={{ marginTop: theme.spacing.lg }}
            size="sm"
          />
        </View>
      </Screen>
    );
  }

  /* --- Caméra ------------------------------------------------------- */
  return (
    <Screen plain topInset={false}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        enableTorch={torch}
        // La rétine est photographiée de très près : le mode macro du système
        // n'est pas disponible, on laisse l'autofocus continu opérer.
        autofocus="on"
      />

      <ScanReticle size={reticleSize} tone={theme.colors.accent} active={!capturing} />

      {/* Éclair de capture. */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: '#FFFFFF', pointerEvents: 'none' },
          flashStyle,
        ]}
      />

      {/* Barre supérieure. */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.topBar, { paddingTop: insets.top + 8, paddingHorizontal: theme.spacing.xl }]}
      >
        <PressableScale
          onPress={() => router.back()}
          accessibilityLabel="Fermer"
          activeScale={0.9}
          style={styles.roundButton}
        >
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </PressableScale>

        <View
          style={[
            styles.titlePill,
            { borderRadius: theme.radius.pill, paddingHorizontal: theme.spacing.lg },
          ]}
        >
          <Txt variant="caption" color="#FFFFFF" weight="700">
            Capture du fond d’œil
          </Txt>
        </View>

        <PressableScale
          onPress={() => setTorch((t) => !t)}
          accessibilityLabel={torch ? 'Éteindre la lampe' : 'Allumer la lampe'}
          activeScale={0.9}
          style={[
            styles.roundButton,
            { backgroundColor: torch ? theme.colors.accent : OVERLAY_BUTTON },
          ]}
        >
          <Ionicons
            name={torch ? 'flashlight' : 'flashlight-outline'}
            size={20}
            color={torch ? '#04070F' : '#FFFFFF'}
          />
        </PressableScale>
      </Animated.View>

      {/* Conseil de cadrage. */}
      {/* Le conseil se pose juste sous le cercle de visée, quel que soit l'écran. */}
      <View style={[styles.tip, { top: (screenHeight + reticleSize) / 2 + 16 }]}>
        <Animated.View
          key={tipIndex}
          entering={FadeIn.duration(400)}
          style={[
            styles.tipPill,
            {
              borderRadius: theme.radius.pill,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.sm,
            },
          ]}
        >
          <Ionicons name="information-circle-outline" size={14} color={theme.colors.accent} />
          <Txt variant="micro" color="#E8EEF9" style={{ flex: 1 }}>
            {TIPS[tipIndex]}
          </Txt>
        </Animated.View>
      </View>

      {/* Commandes basses. */}
      <Animated.View
        entering={FadeInDown.duration(420)}
        style={[
          styles.bottomBar,
          {
            paddingBottom: Math.max(insets.bottom, theme.spacing.xl),
            paddingHorizontal: theme.spacing.xl,
            gap: theme.spacing.xl,
          },
        ]}
      >
        <SegmentedControl
          options={[
            { value: 'right', label: 'Œil droit' },
            { value: 'left', label: 'Œil gauche' },
            { value: 'unknown', label: 'Non précisé' },
          ]}
          value={eye}
          onChange={(value) => setEye(value as Eye)}
          style={{ backgroundColor: 'rgba(10,15,28,0.75)', borderColor: 'rgba(255,255,255,0.14)' }}
        />

        <View style={styles.controls}>
          <PressableScale
            onPress={handleImport}
            accessibilityLabel="Importer depuis la galerie"
            activeScale={0.9}
            style={styles.sideButton}
          >
            <Ionicons name="images-outline" size={22} color="#FFFFFF" />
          </PressableScale>

          <PressableScale
            onPress={handleCapture}
            disabled={capturing}
            accessibilityLabel="Capturer"
            feedback={null}
            activeScale={0.9}
            style={styles.shutterOuter}
          >
            <View
              style={[
                styles.shutterInner,
                {
                  backgroundColor: capturing ? theme.colors.accent : '#FFFFFF',
                },
              ]}
            />
          </PressableScale>

          <PressableScale
            onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
            accessibilityLabel="Changer de caméra"
            activeScale={0.9}
            style={styles.sideButton}
          >
            <Ionicons name="camera-reverse-outline" size={22} color="#FFFFFF" />
          </PressableScale>
        </View>
      </Animated.View>
    </Screen>
  );
}

const OVERLAY_BUTTON = 'rgba(12,18,32,0.55)';

const styles = StyleSheet.create({
  permission: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  permissionIcon: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center' },

  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roundButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OVERLAY_BUTTON,
  },
  titlePill: {
    height: 34,
    justifyContent: 'center',
    backgroundColor: OVERLAY_BUTTON,
  },

  tip: { position: 'absolute', left: 0, right: 0, alignItems: 'center', paddingHorizontal: 28 },
  tipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(8,12,24,0.8)',
    maxWidth: 340,
  },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sideButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OVERLAY_BUTTON,
  },
  shutterOuter: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      default: { elevation: 6 },
    }),
  },
  shutterInner: { width: 64, height: 64, borderRadius: 32 },
});

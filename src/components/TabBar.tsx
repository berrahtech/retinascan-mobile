import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { haptics } from '@/utils/haptics';
import { PressableScale } from './ui/PressableScale';
import { Txt } from './ui/Text';

const ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap; label: string }> = {
  index: { active: 'home', inactive: 'home-outline', label: 'Accueil' },
  history: { active: 'time', inactive: 'time-outline', label: 'Historique' },
  learn: { active: 'library', inactive: 'library-outline', label: 'Savoir' },
  profile: { active: 'person', inactive: 'person-outline', label: 'Profil' },
};

/** Ordre d'affichage ; `scan` est le bouton central, il ne correspond à aucun onglet. */
const LAYOUT = ['index', 'history', 'scan', 'learn', 'profile'] as const;

/**
 * Espace à réserver en bas des contenus défilants pour que la barre flottante
 * ne recouvre jamais le dernier élément.
 */
export const TAB_BAR_SPACE = 108;

function TabItem({
  routeName,
  focused,
  onPress,
}: {
  routeName: string;
  focused: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const config = ICONS[routeName];

  const progress = useDerivedValue(() => withSpring(focused ? 1 : 0, theme.motion.springSoft));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -progress.value * 2 }, { scale: 1 + progress.value * 0.06 }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.4 + progress.value * 0.6 }],
  }));

  if (!config) return null;

  return (
    <PressableScale
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={config.label}
      onPress={onPress}
      activeScale={0.9}
      activeOpacity={0.7}
      style={styles.tabItem}
    >
      <Animated.View style={[styles.tabIcon, iconStyle]}>
        <Ionicons
          name={focused ? config.active : config.inactive}
          size={22}
          color={focused ? theme.colors.primary : theme.colors.textMuted}
        />
      </Animated.View>
      <Txt
        variant="micro"
        color={focused ? 'primary' : 'muted'}
        weight={focused ? '700' : '500'}
        numberOfLines={1}
      >
        {config.label}
      </Txt>
      <Animated.View
        style={[
          styles.dot,
          dotStyle,
          { backgroundColor: theme.colors.primary, borderRadius: 3 },
        ]}
      />
    </PressableScale>
  );
}

/**
 * Barre d'onglets flottante avec bouton de scan central.
 *
 * Le bouton central n'est pas un onglet : il pousse l'écran caméra en modal,
 * pour que le retour ramène l'utilisateur exactement là où il était.
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const activeRouteName = state.routes[state.index]?.name;

  return (
    <View
      style={[
        styles.root,
        { paddingBottom: Math.max(insets.bottom, theme.spacing.md), left: 0, right: 0 },
      ]}
    >
      <View style={[styles.bar, { marginHorizontal: theme.spacing.lg }]}>
        {/* Le fond est isolé dans sa propre couche : elle rogne le flou aux
            coins arrondis, pendant que la barre laisse déborder le bouton. */}
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.barSurface,
            {
              borderRadius: theme.radius.xxl,
              borderColor: theme.colors.border,
              backgroundColor:
                Platform.OS === 'android' ? theme.colors.tabBar : 'transparent',
              ...theme.elevation(3),
            },
          ]}
        >
          {Platform.OS !== 'android' && (
            <BlurView
              intensity={theme.scheme === 'dark' ? 40 : 70}
              tint={theme.colors.blurTint}
              style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.tabBar }]}
            />
          )}
        </View>

        {LAYOUT.map((name) => {
          if (name === 'scan') {
            return (
              <View key="scan" style={styles.fabSlot}>
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel="Lancer un scan"
                  feedback="press"
                  activeScale={0.9}
                  onPress={() => router.push('/scan/capture')}
                  style={[
                    styles.fab,
                    { borderRadius: 30, borderColor: theme.colors.background },
                    theme.elevation(3),
                  ]}
                >
                  <LinearGradient
                    colors={[...theme.colors.primaryGradient]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Ionicons name="scan" size={26} color="#FFFFFF" />
                </PressableScale>
              </View>
            );
          }

          const route = state.routes.find((r) => r.name === name);
          if (!route) return null;
          const focused = activeRouteName === name;

          return (
            <TabItem
              key={name}
              routeName={name}
              focused={focused}
              onPress={() => {
                if (focused) return;
                haptics.select();
                navigation.navigate(route.name);
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: 'absolute', bottom: 0 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 66,
    paddingHorizontal: 6,
  },
  barSurface: { overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth * 2 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, height: '100%' },
  tabIcon: { height: 24, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 6, height: 6, position: 'absolute', bottom: 4 },
  fabSlot: { width: 74, alignItems: 'center', justifyContent: 'center' },
  fab: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -26,
    borderWidth: 4,
    overflow: 'hidden',
  },
});

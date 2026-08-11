import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useScans } from '@/store/scans';
import { useSettings } from '@/store/settings';
import { ThemeProvider, useTheme } from '@/theme';

// Le splash reste affiché tant que les préférences n'ont pas été relues :
// cela évite un passage visible par l'onboarding chez un utilisateur connu.
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const theme = useTheme();
  const router = useRouter();
  const segments = useSegments();

  const settingsHydrated = useSettings((s) => s.hydrated);
  const scansHydrated = useScans((s) => s.hydrated);
  const onboardingDone = useSettings((s) => s.onboardingDone);

  const ready = settingsHydrated && scansHydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!onboardingDone && !inOnboarding) {
      router.replace('/onboarding');
    } else if (onboardingDone && inOnboarding) {
      router.replace('/');
    }
  }, [onboardingDone, ready, router, segments]);

  return (
    <>
      <StatusBar style={theme.colors.statusBar} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="scan/capture"
          options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
        />
        <Stack.Screen
          name="scan/analyzing"
          options={{ animation: 'fade', gestureEnabled: false }}
        />
        <Stack.Screen name="result/[id]" />
        <Stack.Screen name="condition/[slug]" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

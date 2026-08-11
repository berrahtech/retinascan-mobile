import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { BrandLogo } from '@/components/BrandLogo';
import { DisclaimerCard } from '@/components/DisclaimerCard';
import { deleteScanImage } from '@/services/imageStore';
import { TAB_BAR_SPACE } from '@/components/TabBar';
import { Card } from '@/components/ui/Card';
import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Txt } from '@/components/ui/Text';
import { ENGINE_NAME, isRemoteEngine } from '@/services/analysis';
import { computeStats, useScans } from '@/store/scans';
import { useSettings, type PatientProfile, type ThemePreference } from '@/store/settings';
import { useTheme } from '@/theme';
import { haptics } from '@/utils/haptics';

const DIABETES_OPTIONS: { value: PatientProfile['diabetesType']; label: string }[] = [
  { value: 'type1', label: 'Type 1' },
  { value: 'type2', label: 'Type 2' },
  { value: 'gestationnel', label: 'Gestat.' },
  { value: 'aucun', label: 'Aucun' },
];

const REMINDER_OPTIONS = [3, 6, 12];

export default function ProfileScreen() {
  const theme = useTheme();

  const profile = useSettings((s) => s.profile);
  const updateProfile = useSettings((s) => s.updateProfile);
  const themePreference = useSettings((s) => s.themePreference);
  const setThemePreference = useSettings((s) => s.setThemePreference);
  const hapticsEnabled = useSettings((s) => s.hapticsEnabled);
  const setHapticsEnabled = useSettings((s) => s.setHapticsEnabled);
  const reminderMonths = useSettings((s) => s.reminderMonths);
  const setReminderMonths = useSettings((s) => s.setReminderMonths);
  const resetOnboarding = useSettings((s) => s.resetOnboarding);

  const scans = useScans((s) => s.scans);
  const clearAll = useScans((s) => s.clearAll);
  const stats = computeStats(scans);

  const inputStyle = {
    backgroundColor: theme.colors.surfaceStrong,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: 15,
  };

  const confirmClear = () => {
    Alert.alert(
      'Effacer toutes les analyses ?',
      `${scans.length} analyse(s) seront définitivement supprimées de cet appareil.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tout effacer',
          style: 'destructive',
          onPress: () => {
            scans.forEach((s) => deleteScanImage(s.id));
            clearAll();
            haptics.warning();
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.md,
          paddingBottom: TAB_BAR_SPACE,
          gap: theme.spacing.xxl,
        }}
      >
        {/* En-tête ------------------------------------------------------- */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.identity}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.avatar, { borderRadius: theme.radius.pill }]}
          >
            <Txt variant="title" color="#FFFFFF">
              {(profile.firstName || 'R').charAt(0).toUpperCase()}
            </Txt>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Txt variant="title">{profile.firstName || 'Votre profil'}</Txt>
            <Txt variant="caption" color="muted" style={{ marginTop: 2 }}>
              {stats.total === 0
                ? 'Aucune analyse enregistrée'
                : `${stats.total} analyse${stats.total > 1 ? 's' : ''} · qualité moyenne ${stats.averageQuality}/100`}
            </Txt>
          </View>
        </Animated.View>

        {/* Informations médicales ---------------------------------------- */}
        <Animated.View entering={FadeInDown.delay(60).duration(420)}>
          <SectionHeader
            title="Informations"
            subtitle="Utilisées uniquement pour personnaliser vos rapports"
          />
          <Card padding={theme.spacing.lg}>
            <Txt variant="caption" color="muted">
              Prénom
            </Txt>
            <TextInput
              value={profile.firstName}
              onChangeText={(firstName) => updateProfile({ firstName })}
              placeholder="Votre prénom"
              placeholderTextColor={theme.colors.textMuted}
              style={[inputStyle, { marginTop: theme.spacing.xs }]}
              maxLength={30}
            />

            <Txt variant="caption" color="muted" style={{ marginTop: theme.spacing.lg }}>
              Type de diabète
            </Txt>
            <SegmentedControl
              options={DIABETES_OPTIONS}
              value={profile.diabetesType}
              onChange={(diabetesType) => updateProfile({ diabetesType })}
              style={{ marginTop: theme.spacing.xs }}
            />

            <Txt variant="caption" color="muted" style={{ marginTop: theme.spacing.lg }}>
              Année du diagnostic
            </Txt>
            <TextInput
              value={profile.diagnosisYear}
              onChangeText={(diagnosisYear) =>
                updateProfile({ diagnosisYear: diagnosisYear.replace(/[^0-9]/g, '') })
              }
              placeholder="2018"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="number-pad"
              maxLength={4}
              style={[inputStyle, { marginTop: theme.spacing.xs }]}
            />
          </Card>
        </Animated.View>

        {/* Préférences ---------------------------------------------------- */}
        <Animated.View entering={FadeInDown.delay(110).duration(420)}>
          <SectionHeader title="Préférences" />
          <Card padding={theme.spacing.lg}>
            <Txt variant="caption" color="muted">
              Apparence
            </Txt>
            <SegmentedControl
              options={[
                { value: 'dark', label: 'Sombre' },
                { value: 'light', label: 'Clair' },
                { value: 'system', label: 'Système' },
              ]}
              value={themePreference}
              onChange={(value) => setThemePreference(value as ThemePreference)}
              style={{ marginTop: theme.spacing.xs }}
            />

            <View style={{ marginTop: theme.spacing.lg }}>
              <Txt variant="caption" color="muted">
                Rappel de dépistage
              </Txt>
              <SegmentedControl
                options={REMINDER_OPTIONS.map((months) => ({
                  value: String(months),
                  label: `${months} mois`,
                }))}
                value={String(reminderMonths)}
                onChange={(value) => setReminderMonths(Number(value))}
                style={{ marginTop: theme.spacing.xs }}
              />
            </View>

            <View style={{ marginTop: theme.spacing.xs }}>
              <ListRow
                icon="phone-portrait-outline"
                title="Retour haptique"
                subtitle="Vibrations lors des interactions"
                right={
                  <Switch
                    value={hapticsEnabled}
                    onValueChange={setHapticsEnabled}
                    trackColor={{ false: theme.colors.surfaceStrong, true: theme.colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                }
              />
            </View>
          </Card>
        </Animated.View>

        {/* Données -------------------------------------------------------- */}
        <Animated.View entering={FadeInDown.delay(160).duration(420)}>
          <SectionHeader title="Vos données" subtitle="Tout reste sur cet appareil" />
          <Card padding={theme.spacing.lg}>
            <ListRow
              icon="phone-portrait-outline"
              tone={theme.colors.success}
              title="Stockage local"
              subtitle="Aucune image n’est envoyée sans votre action"
              value={`${scans.length}`}
            />
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <ListRow
              icon="refresh-outline"
              title="Revoir la présentation"
              subtitle="Relancer l’introduction de l’application"
              onPress={() => {
                haptics.tap();
                resetOnboarding();
              }}
            />
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <ListRow
              icon="trash-outline"
              title="Effacer toutes les analyses"
              subtitle="Action définitive"
              danger
              onPress={confirmClear}
            />
          </Card>
        </Animated.View>

        {/* À propos -------------------------------------------------------- */}
        <Animated.View entering={FadeInDown.delay(210).duration(420)}>
          <SectionHeader title="À propos" />
          <Card padding={theme.spacing.lg}>
            <ListRow
              icon="hardware-chip-outline"
              tone={theme.colors.accent}
              title="Moteur d’analyse"
              subtitle={isRemoteEngine ? 'Inférence distante' : 'Inférence embarquée'}
              value={ENGINE_NAME}
            />
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <ListRow
              icon="information-circle-outline"
              title="Version"
              value={Constants.expoConfig?.version ?? '1.0.0'}
            />
          </Card>
        </Animated.View>

        <DisclaimerCard />

        <View style={styles.footer}>
          <BrandLogo height={132} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  divider: { height: StyleSheet.hairlineWidth * 2, marginLeft: 46 },
  footer: { alignItems: 'center', justifyContent: 'center', paddingTop: 8 },
});

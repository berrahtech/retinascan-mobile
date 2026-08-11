import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { DisclaimerCard } from '@/components/DisclaimerCard';
import { RetinaPulse } from '@/components/RetinaPulse';
import { ScanCard } from '@/components/ScanCard';
import { StatTile } from '@/components/StatTile';
import { StepFlow } from '@/components/StepFlow';
import { TAB_BAR_SPACE } from '@/components/TabBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Txt } from '@/components/ui/Text';
import { CONDITIONS } from '@/data/conditions';
import { GRADES } from '@/data/grades';
import { pickRetinaImage } from '@/services/pickImage';
import { computeStats, nextScreeningDate, useScans } from '@/store/scans';
import { useSettings } from '@/store/settings';
import { useTheme } from '@/theme';
import { formatDate } from '@/utils/format';

const WEEKDAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

function greeting(hour: number) {
  if (hour < 6) return 'Bonne nuit';
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const scans = useScans((s) => s.scans);
  const profile = useSettings((s) => s.profile);
  const reminderMonths = useSettings((s) => s.reminderMonths);
  const [importing, setImporting] = useState(false);

  const stats = useMemo(() => computeStats(scans), [scans]);
  const nextScreening = useMemo(
    () => nextScreeningDate(scans, reminderMonths),
    [reminderMonths, scans],
  );
  const recent = scans.slice(0, 3);

  const now = new Date();
  const worstGrade = stats.worstGrade;

  const handleImport = async () => {
    setImporting(true);
    try {
      const uri = await pickRetinaImage();
      if (uri) {
        router.push({ pathname: '/scan/analyzing', params: { uri, eye: 'unknown' } });
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xl,
          paddingBottom: TAB_BAR_SPACE,
          gap: theme.spacing.xxl,
        }}
      >
        {/* En-tête ------------------------------------------------------ */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[styles.header, { paddingTop: theme.spacing.md }]}
        >
          <View style={{ flex: 1 }}>
            <Txt variant="caption" color="muted">
              {WEEKDAYS[now.getDay()]} {formatDate(now.getTime())}
            </Txt>
            <Txt variant="title" style={{ marginTop: 2 }}>
              {greeting(now.getHours())}
              {profile.firstName ? `, ${profile.firstName}` : ''}
            </Txt>
          </View>
          <PressableScale
            onPress={() => router.push('/profile')}
            accessibilityLabel="Ouvrir le profil"
            activeScale={0.92}
            style={[
              styles.avatar,
              {
                backgroundColor: theme.colors.surfaceStrong,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.pill,
              },
            ]}
          >
            <Ionicons name="person-outline" size={19} color={theme.colors.textSecondary} />
          </PressableScale>
        </Animated.View>

        {/* Carte d'accroche --------------------------------------------- */}
        <Animated.View entering={FadeInDown.delay(80).duration(460)}>
          <Card variant="glow" tone={theme.colors.accent} padding={theme.spacing.xl}>
            <View style={styles.heroTop}>
              <View style={{ flex: 1, paddingRight: theme.spacing.md }}>
                <Badge label="Dépistage rétinien" icon="pulse" tone={theme.colors.accent} size="sm" />
                <Txt variant="heading" style={{ marginTop: theme.spacing.md }}>
                  Détectez la rétinopathie avant les symptômes
                </Txt>
                <Txt variant="caption" color="secondary" style={{ marginTop: theme.spacing.xs }}>
                  Une photo du fond d’œil suffit pour obtenir une première
                  évaluation en moins d’une minute.
                </Txt>
              </View>
              <RetinaPulse size={92} />
            </View>

            <View style={{ marginTop: theme.spacing.xl }}>
              <StepFlow />
            </View>

            <Button
              label="Prendre une photo"
              icon="camera"
              block
              size="lg"
              onPress={() => router.push('/scan/capture')}
              style={{ marginTop: theme.spacing.xl }}
            />
            <Button
              label={importing ? 'Ouverture…' : 'Importer une image existante'}
              icon="images-outline"
              variant="ghost"
              block
              loading={importing}
              onPress={handleImport}
              style={{ marginTop: theme.spacing.xs }}
            />
          </Card>
        </Animated.View>

        {/* Indicateurs --------------------------------------------------- */}
        {stats.total > 0 && (
          <Animated.View entering={FadeInDown.delay(140).duration(440)}>
            <View style={[styles.stats, { gap: theme.spacing.md }]}>
              <StatTile icon="scan-outline" label="Analyses" value={stats.total} />
              <StatTile
                icon="alert-circle-outline"
                label="Stade le plus élevé"
                text={worstGrade !== null ? GRADES[worstGrade].code : '—'}
                tone={worstGrade !== null ? theme.severityScale[worstGrade] : undefined}
              />
              <StatTile
                icon="aperture-outline"
                label="Qualité moyenne"
                value={stats.averageQuality}
                suffix="/100"
                tone={theme.colors.accent}
              />
            </View>
          </Animated.View>
        )}

        {/* Prochain dépistage -------------------------------------------- */}
        {nextScreening && (
          <Animated.View entering={FadeInDown.delay(180).duration(440)}>
            <Card padding={theme.spacing.lg}>
              <View style={[styles.reminder, { gap: theme.spacing.md }]}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.reminderIcon, { borderRadius: theme.radius.md }]}
                >
                  <Ionicons name="calendar-outline" size={19} color="#FFFFFF" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Txt variant="bodyStrong">Prochain contrôle conseillé</Txt>
                  <Txt variant="caption" color="muted" style={{ marginTop: 1 }}>
                    {formatDate(nextScreening.date)} · dans{' '}
                    {nextScreening.months < 1
                      ? `${Math.round(nextScreening.months * 4)} semaines`
                      : `${nextScreening.months} mois`}
                  </Txt>
                </View>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Derniers scans ------------------------------------------------ */}
        <Animated.View entering={FadeInUp.delay(220).duration(440)}>
          <SectionHeader
            title="Vos derniers scans"
            actionLabel={scans.length > 3 ? 'Tout voir' : undefined}
            onAction={scans.length > 3 ? () => router.push('/history') : undefined}
          />
          {recent.length === 0 ? (
            <Card variant="flat" style={{ backgroundColor: theme.colors.surfaceStrong }}>
              <EmptyState
                icon="eye-outline"
                title="Aucune analyse pour le moment"
                message="Prenez une première photo de rétine pour démarrer votre suivi."
                actionLabel="Commencer"
                onAction={() => router.push('/scan/capture')}
              />
            </Card>
          ) : (
            <View style={{ gap: theme.spacing.md }}>
              {recent.map((scan) => (
                <ScanCard
                  key={scan.id}
                  scan={scan}
                  onPress={() => router.push(`/result/${scan.id}`)}
                />
              ))}
            </View>
          )}
        </Animated.View>

        {/* Bibliothèque -------------------------------------------------- */}
        <Animated.View entering={FadeInUp.delay(260).duration(440)}>
          <SectionHeader
            title="Comprendre sa rétine"
            subtitle="Les pathologies que l’application dépiste"
            actionLabel="Explorer"
            onAction={() => router.push('/learn')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: theme.spacing.md, paddingRight: theme.spacing.xl }}
          >
            {CONDITIONS.slice(0, 4).map((condition) => (
              <PressableScale
                key={condition.slug}
                onPress={() => router.push(`/condition/${condition.slug}`)}
                activeScale={0.96}
                style={[
                  styles.conditionCard,
                  {
                    backgroundColor:
                      theme.scheme === 'dark' ? theme.colors.surface : theme.colors.surfaceSolid,
                    borderColor: theme.colors.border,
                    borderRadius: theme.radius.lg,
                    padding: theme.spacing.lg,
                    ...theme.elevation(1),
                  },
                ]}
              >
                <View
                  style={[
                    styles.conditionIcon,
                    {
                      backgroundColor: `${theme.colors[condition.tone]}1F`,
                      borderRadius: theme.radius.sm,
                    },
                  ]}
                >
                  <Ionicons
                    name={condition.icon as never}
                    size={18}
                    color={theme.colors[condition.tone]}
                  />
                </View>
                <Txt variant="bodyStrong" numberOfLines={2} style={{ marginTop: theme.spacing.md }}>
                  {condition.name}
                </Txt>
                <Txt variant="micro" color="muted" numberOfLines={3} style={{ marginTop: 4 }}>
                  {condition.tagline}
                </Txt>
              </PressableScale>
            ))}
          </ScrollView>
        </Animated.View>

        <DisclaimerCard compact />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center' },
  stats: { flexDirection: 'row' },
  reminder: { flexDirection: 'row', alignItems: 'center' },
  reminderIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  conditionCard: {
    width: 168,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  conditionIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
});

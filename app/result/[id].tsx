import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';

import { DisclaimerCard } from '@/components/DisclaimerCard';
import { HeatmapOverlay } from '@/components/HeatmapOverlay';
import { QualityMeter } from '@/components/QualityMeter';
import { SeverityScale } from '@/components/SeverityScale';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PressableScale } from '@/components/ui/PressableScale';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Screen } from '@/components/ui/Screen';
import { Txt } from '@/components/ui/Text';
import { GRADES, URGENCY_LABEL } from '@/data/grades';
import { getLesion } from '@/data/lesions';
import { exportScanReport } from '@/services/report';
import { useScans } from '@/store/scans';
import { useSettings } from '@/store/settings';
import { useTheme } from '@/theme';
import { formatDateTime, formatDuration, formatPercent, plural } from '@/utils/format';
import { haptics } from '@/utils/haptics';

const EYE_LABEL = {
  right: 'Œil droit',
  left: 'Œil gauche',
  unknown: 'Œil non précisé',
} as const;

const URGENCY_ICON = {
  routine: 'checkmark-circle-outline',
  programmee: 'calendar-outline',
  rapide: 'time-outline',
  urgente: 'warning-outline',
} as const;

export default function ResultScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width: screenWidth } = useWindowDimensions();

  const scan = useScans((s) => s.scans.find((item) => item.id === id));
  const removeScan = useScans((s) => s.removeScan);
  const profile = useSettings((s) => s.profile);

  const [showHeatmap, setShowHeatmap] = useState(true);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const heroSize = Math.min(screenWidth - theme.spacing.xl * 2, 520);
  const info = scan ? GRADES[scan.grade] : null;
  const tone = scan ? theme.severityScale[scan.grade] : theme.colors.primary;

  const lesionTotal = useMemo(
    () => scan?.findings.reduce((sum, f) => sum + (f.count ?? 0), 0) ?? 0,
    [scan],
  );

  if (!scan || !info) {
    return (
      <Screen>
        <View style={styles.missing}>
          <Ionicons name="document-outline" size={34} color={theme.colors.textMuted} />
          <Txt variant="subheading" style={{ marginTop: theme.spacing.lg }}>
            Analyse introuvable
          </Txt>
          <Txt variant="caption" color="muted" align="center" style={{ marginTop: 4 }}>
            Ce rapport a peut-être été supprimé.
          </Txt>
          <Button
            label="Retour"
            variant="ghost"
            onPress={() => router.back()}
            style={{ marginTop: theme.spacing.xl }}
          />
        </View>
      </Screen>
    );
  }

  const handleExport = async () => {
    setExporting(true);
    try {
      const shared = await exportScanReport(scan, profile);
      if (!shared) {
        Alert.alert('Partage indisponible', "Le PDF a été généré mais l'appareil ne propose pas de partage.");
      }
    } catch {
      haptics.error();
      Alert.alert('Export impossible', "Le rapport n'a pas pu être généré.");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Supprimer cette analyse ?', 'Cette action est définitive.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          removeScan(scan.id);
          haptics.warning();
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen>
      {/* En-tête ------------------------------------------------------- */}
      <View style={[styles.header, { paddingHorizontal: theme.spacing.xl }]}>
        <PressableScale
          onPress={() => router.back()}
          accessibilityLabel="Retour"
          activeScale={0.9}
          style={[
            styles.headerButton,
            { backgroundColor: theme.colors.surfaceStrong, borderColor: theme.colors.border },
          ]}
        >
          <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
        </PressableScale>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <Txt variant="caption" weight="700">
            Rapport d’analyse
          </Txt>
          <Txt variant="micro" color="muted">
            {formatDateTime(scan.createdAt)}
          </Txt>
        </View>

        <PressableScale
          onPress={handleDelete}
          accessibilityLabel="Supprimer l’analyse"
          activeScale={0.9}
          style={[
            styles.headerButton,
            { backgroundColor: theme.colors.surfaceStrong, borderColor: theme.colors.border },
          ]}
        >
          <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
        </PressableScale>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xl,
          paddingBottom: theme.spacing.huge,
          gap: theme.spacing.lg,
        }}
      >
        {/* Image et carte d'activation --------------------------------- */}
        <Animated.View entering={FadeIn.duration(420)}>
          <View
            style={[
              styles.hero,
              {
                width: heroSize,
                height: heroSize,
                borderRadius: theme.radius.xl,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Image
              source={{ uri: scan.imageUri }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={300}
            />
            {showHeatmap && scan.findings.length > 0 && (
              <HeatmapOverlay findings={scan.findings} size={heroSize} focusId={focusId} />
            )}

            {/* Dégradé de lisibilité pour les incrustations. */}
            <LinearGradient
              colors={['rgba(4,6,14,0.72)', 'transparent', 'rgba(4,6,14,0.78)']}
              locations={[0, 0.35, 1]}
              style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}
            />

            <View style={[styles.heroTop, { padding: theme.spacing.md }]}>
              <View
                style={[
                  styles.gradeChip,
                  { backgroundColor: tone, borderRadius: theme.radius.sm },
                ]}
              >
                <Txt variant="caption" color="#FFFFFF" weight="800">
                  {info.code}
                </Txt>
              </View>
              <Badge
                label={EYE_LABEL[scan.eye]}
                tone="#FFFFFF"
                variant="outline"
                size="sm"
                style={{ backgroundColor: 'rgba(6,10,20,0.5)' }}
              />
            </View>

            {scan.findings.length > 0 && (
              <View style={[styles.heroBottom, { padding: theme.spacing.md }]}>
                <Txt variant="micro" color="#D6E0F0" style={{ flex: 1 }}>
                  {focusId
                    ? scan.findings.find((f) => f.id === focusId)?.label
                    : `${plural(lesionTotal, 'lésion')} localisée${lesionTotal > 1 ? 's' : ''}`}
                </Txt>
                <PressableScale
                  onPress={() => setShowHeatmap((v) => !v)}
                  accessibilityLabel={
                    showHeatmap ? 'Masquer la carte d’activation' : 'Afficher la carte d’activation'
                  }
                  activeScale={0.92}
                  style={[styles.heroToggle, { borderRadius: theme.radius.pill }]}
                >
                  <Ionicons
                    name={showHeatmap ? 'eye' : 'eye-off'}
                    size={13}
                    color={theme.colors.accent}
                  />
                  <Txt variant="micro" color={theme.colors.accent} weight="700">
                    Zones
                  </Txt>
                </PressableScale>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Verdict ----------------------------------------------------- */}
        <Animated.View entering={FadeInDown.delay(60).duration(440)}>
          <Card variant="glow" tone={tone} padding={theme.spacing.xl}>
            <View style={styles.verdictTop}>
              <View style={{ flex: 1, paddingRight: theme.spacing.lg }}>
                <Txt variant="overline" color="muted" uppercase>
                  Résultat
                </Txt>
                <Txt variant="heading" color={tone} style={{ marginTop: 4 }}>
                  {info.label}
                </Txt>
              </View>
              <ProgressRing
                progress={scan.confidence}
                size={74}
                thickness={6}
                color={tone}
                gradientId="confidence"
              >
                <AnimatedNumber
                  value={scan.confidence * 100}
                  suffix="%"
                  variant="subheading"
                  color={tone}
                />
                <Txt variant="micro" color="muted">
                  fiabilité
                </Txt>
              </ProgressRing>
            </View>

            <Txt variant="body" color="secondary" style={{ marginTop: theme.spacing.lg }}>
              {info.summary}
            </Txt>

            <View style={{ marginTop: theme.spacing.xl }}>
              <SeverityScale value={scan.grade} />
            </View>

            {scan.maculopathy && (
              <View
                style={{
                  marginTop: theme.spacing.lg,
                  padding: theme.spacing.md,
                  borderRadius: theme.radius.md,
                  backgroundColor: theme.colors.warningSoft,
                  flexDirection: 'row',
                  gap: theme.spacing.sm,
                }}
              >
                <Ionicons name="ellipse-outline" size={16} color={theme.colors.warning} />
                <Txt variant="caption" color="warning" style={{ flex: 1 }}>
                  Œdème maculaire suspecté : un examen OCT est recommandé pour confirmer
                  l’atteinte du centre de la rétine.
                </Txt>
              </View>
            )}
          </Card>
        </Animated.View>

        {/* Conduite à tenir -------------------------------------------- */}
        <Animated.View entering={FadeInDown.delay(110).duration(440)}>
          <Card padding={theme.spacing.xl}>
            <View style={[styles.rowBetween, { marginBottom: theme.spacing.md }]}>
              <Txt variant="subheading">Conduite à tenir</Txt>
              <Badge
                label={URGENCY_LABEL[info.urgency]}
                tone={tone}
                icon={URGENCY_ICON[info.urgency]}
                size="sm"
              />
            </View>

            <Txt variant="body" color="secondary">
              {info.referral}
            </Txt>

            <View
              style={{
                marginTop: theme.spacing.lg,
                padding: theme.spacing.md,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.surfaceStrong,
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.md,
              }}
            >
              <Ionicons name="calendar-clear-outline" size={18} color={theme.colors.primary} />
              <View style={{ flex: 1 }}>
                <Txt variant="caption" color="muted">
                  Prochain contrôle
                </Txt>
                <Txt variant="bodyStrong">{info.followUp}</Txt>
              </View>
            </View>

            <View style={{ marginTop: theme.spacing.lg, gap: theme.spacing.sm }}>
              {info.advice.map((advice) => (
                <View key={advice} style={[styles.adviceRow, { gap: theme.spacing.sm }]}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={theme.colors.success}
                    style={{ marginTop: 2 }}
                  />
                  <Txt variant="caption" color="secondary" style={{ flex: 1 }}>
                    {advice}
                  </Txt>
                </View>
              ))}
            </View>
          </Card>
        </Animated.View>

        {/* Signes détectés --------------------------------------------- */}
        <Animated.View entering={FadeInDown.delay(160).duration(440)}>
          <Card padding={theme.spacing.xl}>
            <View style={[styles.rowBetween, { marginBottom: theme.spacing.md }]}>
              <Txt variant="subheading">Signes détectés</Txt>
              {scan.findings.length > 0 && (
                <Txt variant="micro" color="muted">
                  Touchez pour isoler
                </Txt>
              )}
            </View>

            {scan.findings.length === 0 ? (
              <View style={[styles.adviceRow, { gap: theme.spacing.sm }]}>
                <Ionicons name="shield-checkmark" size={18} color={theme.colors.success} />
                <Txt variant="body" color="secondary" style={{ flex: 1 }}>
                  Aucun signe de rétinopathie n’a été relevé sur cette image.
                </Txt>
              </View>
            ) : (
              <View style={{ gap: theme.spacing.sm }}>
                {scan.findings.map((finding) => {
                  const active = focusId === finding.id;
                  const lesion = getLesion(finding.id);
                  const severityTone =
                    finding.severity === 'high'
                      ? theme.colors.danger
                      : finding.severity === 'moderate'
                        ? theme.colors.warning
                        : theme.colors.accent;

                  return (
                    <Animated.View key={finding.id} layout={LinearTransition.duration(220)}>
                      <PressableScale
                        onPress={() => setFocusId(active ? null : finding.id)}
                        activeScale={0.985}
                        style={[
                          styles.finding,
                          {
                            borderRadius: theme.radius.md,
                            padding: theme.spacing.md,
                            backgroundColor: active
                              ? `${severityTone}14`
                              : theme.colors.surfaceStrong,
                            borderColor: active ? `${severityTone}66` : 'transparent',
                          },
                        ]}
                      >
                        <View style={[styles.rowBetween, { gap: theme.spacing.sm }]}>
                          <View style={[styles.findingTitle, { gap: theme.spacing.sm }]}>
                            <View
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: severityTone,
                              }}
                            />
                            <Txt variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
                              {finding.label}
                            </Txt>
                          </View>
                          <Txt variant="caption" color={severityTone} weight="700">
                            {finding.count !== null ? finding.count : 'présent'}
                          </Txt>
                        </View>

                        {active && lesion && (
                          <Animated.View entering={FadeIn.duration(200)}>
                            <Txt
                              variant="caption"
                              color="muted"
                              style={{ marginTop: theme.spacing.sm }}
                            >
                              {lesion.description}
                            </Txt>
                            <Txt variant="micro" color="muted" style={{ marginTop: 6 }}>
                              Confiance du modèle : {formatPercent(finding.confidence)}
                            </Txt>
                          </Animated.View>
                        )}
                      </PressableScale>
                    </Animated.View>
                  );
                })}
              </View>
            )}
          </Card>
        </Animated.View>

        {/* Distribution des stades ------------------------------------- */}
        <Animated.View entering={FadeInDown.delay(200).duration(440)}>
          <Card padding={theme.spacing.xl}>
            <Txt variant="subheading">Distribution des stades</Txt>
            <Txt variant="caption" color="muted" style={{ marginTop: 2 }}>
              Probabilité attribuée par le modèle à chaque stade ICDR
            </Txt>

            <View style={{ marginTop: theme.spacing.lg, gap: theme.spacing.sm }}>
              {scan.probabilities.map((probability, grade) => (
                <View key={grade} style={[styles.probRow, { gap: theme.spacing.md }]}>
                  <Txt
                    variant="caption"
                    weight="700"
                    color={grade === scan.grade ? theme.severityScale[grade] : 'muted'}
                    style={{ width: 24 }}
                  >
                    {GRADES[grade as 0].code}
                  </Txt>
                  <View
                    style={[
                      styles.probTrack,
                      {
                        backgroundColor: theme.colors.surfaceStrong,
                        borderRadius: theme.radius.pill,
                      },
                    ]}
                  >
                    <View
                      style={{
                        width: `${Math.max(1.5, probability * 100)}%`,
                        height: '100%',
                        borderRadius: theme.radius.pill,
                        backgroundColor: theme.severityScale[grade],
                        opacity: grade === scan.grade ? 1 : 0.4,
                      }}
                    />
                  </View>
                  <Txt
                    variant="micro"
                    color={grade === scan.grade ? 'default' : 'muted'}
                    style={{ width: 46, textAlign: 'right' }}
                  >
                    {formatPercent(probability, 1)}
                  </Txt>
                </View>
              ))}
            </View>
          </Card>
        </Animated.View>

        {/* Qualité ----------------------------------------------------- */}
        <Animated.View entering={FadeInDown.delay(240).duration(440)}>
          <Card padding={theme.spacing.xl}>
            <QualityMeter quality={scan.quality} />
          </Card>
        </Animated.View>

        {/* Métadonnées ------------------------------------------------- */}
        <Animated.View entering={FadeInDown.delay(280).duration(440)}>
          <Card padding={theme.spacing.lg} variant="flat" style={{ backgroundColor: theme.colors.surfaceStrong }}>
            <View style={styles.metaGrid}>
              {[
                { label: 'Moteur', value: scan.engine },
                { label: 'Durée', value: formatDuration(scan.processingMs) },
                { label: 'Identifiant', value: scan.id.slice(-8).toUpperCase() },
              ].map((item) => (
                <View key={item.label} style={{ flex: 1 }}>
                  <Txt variant="micro" color="muted" uppercase>
                    {item.label}
                  </Txt>
                  <Txt variant="caption" numberOfLines={1} style={{ marginTop: 2 }}>
                    {item.value}
                  </Txt>
                </View>
              ))}
            </View>
          </Card>
        </Animated.View>

        {/* Actions ----------------------------------------------------- */}
        <Button
          label={exporting ? 'Génération du PDF…' : 'Exporter le rapport PDF'}
          icon="share-outline"
          block
          size="lg"
          loading={exporting}
          onPress={handleExport}
        />
        <Button
          label="Nouvelle analyse"
          icon="camera-outline"
          variant="secondary"
          block
          onPress={() => router.replace('/scan/capture')}
        />

        <DisclaimerCard />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },

  hero: { overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth * 2, backgroundColor: '#0E0A1F' },
  heroTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(6,10,20,0.68)',
  },
  gradeChip: { paddingHorizontal: 9, paddingVertical: 4 },

  verdictTop: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  adviceRow: { flexDirection: 'row', alignItems: 'flex-start' },

  finding: { borderWidth: StyleSheet.hairlineWidth * 2 },
  findingTitle: { flexDirection: 'row', alignItems: 'center', flex: 1 },

  probRow: { flexDirection: 'row', alignItems: 'center' },
  probTrack: { flex: 1, height: 8, overflow: 'hidden' },

  metaGrid: { flexDirection: 'row', gap: 12 },
});

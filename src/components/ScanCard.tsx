import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { GRADES } from '@/data/grades';
import { useTheme } from '@/theme';
import type { ScanResult } from '@/types';
import { formatPercent, formatRelative } from '@/utils/format';
import { Badge } from './ui/Badge';
import { PressableScale } from './ui/PressableScale';
import { Txt } from './ui/Text';

export type ScanCardProps = {
  scan: ScanResult;
  onPress: () => void;
  /** Format réduit pour les listes horizontales de l'accueil. */
  compact?: boolean;
};

const EYE_LABEL: Record<ScanResult['eye'], string> = {
  right: 'Œil droit',
  left: 'Œil gauche',
  unknown: 'Œil non précisé',
};

export function ScanCard({ scan, onPress, compact }: ScanCardProps) {
  const theme = useTheme();
  const info = GRADES[scan.grade];
  const tone = theme.severityScale[scan.grade];
  const thumb = compact ? 64 : 72;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Scan du ${formatRelative(scan.createdAt)}, stade ${info.code}`}
      activeScale={0.98}
      style={[
        styles.root,
        {
          backgroundColor: theme.scheme === 'dark' ? theme.colors.surface : theme.colors.surfaceSolid,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.md,
          gap: theme.spacing.md,
          ...theme.elevation(1),
        },
      ]}
    >
      <View>
        <Image
          source={{ uri: scan.imageUri }}
          style={{ width: thumb, height: thumb, borderRadius: theme.radius.md }}
          contentFit="cover"
          transition={220}
        />
        {/* Pastille de stade, ancrée sur la vignette. */}
        <View
          style={[
            styles.gradeDot,
            {
              backgroundColor: tone,
              borderColor: theme.colors.background,
              borderRadius: theme.radius.sm,
            },
          ]}
        >
          <Txt variant="micro" color="#FFFFFF" weight="800">
            {info.code}
          </Txt>
        </View>
      </View>

      <View style={styles.body}>
        <Txt variant="bodyStrong" numberOfLines={1}>
          {info.shortLabel === 'Aucune' ? 'Rétine saine' : `Rétinopathie ${info.shortLabel.toLowerCase()}`}
        </Txt>
        <Txt variant="caption" color="muted" numberOfLines={1} style={{ marginTop: 1 }}>
          {EYE_LABEL[scan.eye]} · {formatRelative(scan.createdAt)}
        </Txt>

        <View style={[styles.meta, { marginTop: theme.spacing.sm, gap: theme.spacing.xs }]}>
          <Badge
            label={`Confiance ${formatPercent(scan.confidence)}`}
            tone={theme.colors.textSecondary}
            size="sm"
          />
          {scan.quality.verdict === 'insuffisant' && (
            <Badge label="Qualité faible" tone={theme.colors.warning} size="sm" icon="alert-circle" />
          )}
          {scan.maculopathy && (
            <Badge label="Œdème" tone={theme.colors.warning} size="sm" />
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  body: { flex: 1 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  gradeDot: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
  },
});

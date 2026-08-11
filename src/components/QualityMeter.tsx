import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { QUALITY_LABEL } from '@/services/quality';
import { useTheme } from '@/theme';
import type { QualityReport } from '@/types';
import { AnimatedNumber } from './ui/AnimatedNumber';
import { Txt } from './ui/Text';

const METRIC_LABELS: Record<keyof QualityReport['metrics'], string> = {
  resolution: 'Définition',
  nettete: 'Netteté',
  eclairage: 'Éclairage',
  cadrage: 'Cadrage',
};

export type QualityMeterProps = {
  quality: QualityReport;
};

/** Détail de la qualité de la prise de vue, sous-score par sous-score. */
export function QualityMeter({ quality }: QualityMeterProps) {
  const theme = useTheme();

  const toneFor = (score: number) =>
    score >= 80 ? theme.colors.success : score >= 60 ? theme.colors.warning : theme.colors.danger;

  const globalTone = toneFor(quality.score);

  return (
    <View>
      <View style={styles.header}>
        <View>
          <Txt variant="overline" color="muted" uppercase>
            Qualité de l’image
          </Txt>
          <Txt variant="subheading" color={globalTone} style={{ marginTop: 2 }}>
            {QUALITY_LABEL[quality.verdict]}
          </Txt>
        </View>
        <View style={styles.score}>
          <AnimatedNumber value={quality.score} variant="title" color={globalTone} />
          <Txt variant="caption" color="muted" style={{ marginBottom: 4 }}>
            /100
          </Txt>
        </View>
      </View>

      <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
        {(Object.keys(METRIC_LABELS) as (keyof QualityReport['metrics'])[]).map((key, index) => {
          const value = quality.metrics[key];
          return (
            <Animated.View key={key} entering={FadeInDown.delay(index * 60).duration(320)}>
              <View style={styles.metricHeader}>
                <Txt variant="caption" color="secondary">
                  {METRIC_LABELS[key]}
                </Txt>
                <Txt variant="caption" color={toneFor(value)} weight="700">
                  {value}
                </Txt>
              </View>
              <View
                style={[
                  styles.track,
                  {
                    backgroundColor: theme.colors.surfaceStrong,
                    borderRadius: theme.radius.pill,
                    marginTop: 6,
                  },
                ]}
              >
                <View
                  style={{
                    width: `${value}%`,
                    height: '100%',
                    backgroundColor: toneFor(value),
                    borderRadius: theme.radius.pill,
                  }}
                />
              </View>
            </Animated.View>
          );
        })}
      </View>

      {quality.issues.length > 0 && (
        <View
          style={{
            marginTop: theme.spacing.lg,
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.warningSoft,
            gap: theme.spacing.xs,
          }}
        >
          {quality.issues.map((issue) => (
            <Txt key={issue} variant="caption" color="warning">
              • {issue}
            </Txt>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  score: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  track: { height: 6, overflow: 'hidden' },
});

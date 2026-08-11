import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { GRADES } from '@/data/grades';
import { useTheme } from '@/theme';
import type { Grade } from '@/types';
import { Txt } from './ui/Text';

export type SeverityScaleProps = {
  value: Grade;
  /** Affiche le libellé du stade sous la barre. */
  showLabel?: boolean;
  compact?: boolean;
};

/**
 * Échelle ICDR à cinq crans. Le stade retenu est mis en avant ; les stades
 * inférieurs restent colorés pour montrer le chemin parcouru.
 */
export function SeverityScale({ value, showLabel = true, compact }: SeverityScaleProps) {
  const theme = useTheme();
  const height = compact ? 6 : 10;

  return (
    <View>
      <View style={[styles.track, { gap: compact ? 4 : 6 }]}>
        {([0, 1, 2, 3, 4] as Grade[]).map((grade) => {
          const reached = grade <= value;
          return (
            // L'animation d'entrée pilote l'opacité : le cran est peint dans une
            // vue interne pour que les deux ne se marchent pas dessus.
            <Animated.View
              key={grade}
              entering={FadeIn.delay(grade * 70).duration(320)}
              style={{ flex: grade === value ? 1.5 : 1, height }}
            >
              <View
                style={{
                  flex: 1,
                  borderRadius: theme.radius.pill,
                  backgroundColor: reached
                    ? theme.severityScale[grade]
                    : theme.colors.surfaceStrong,
                  opacity: reached ? (grade === value ? 1 : 0.5) : 0.55,
                }}
              />
            </Animated.View>
          );
        })}
      </View>

      {showLabel && (
        <View style={[styles.legend, { marginTop: theme.spacing.sm }]}>
          <Txt variant="micro" color="muted" uppercase>
            R0 · aucune
          </Txt>
          <Txt variant="micro" color={theme.severityScale[value]} weight="700">
            {GRADES[value].code} · {GRADES[value].shortLabel}
          </Txt>
          <Txt variant="micro" color="muted" uppercase>
            R4 · sévère
          </Txt>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', alignItems: 'center' },
  legend: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});

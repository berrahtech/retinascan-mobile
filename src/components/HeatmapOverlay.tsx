import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/theme';
import type { Finding } from '@/types';

export type HeatmapOverlayProps = {
  findings: Finding[];
  /** Largeur et hauteur du conteneur, en points. */
  size: number;
  /** N'affiche que ce signe. `null` affiche tout. */
  focusId?: string | null;
  opacity?: number;
};

const SEVERITY_TONE = {
  low: 'warning',
  moderate: 'warning',
  high: 'danger',
} as const;

/**
 * Carte d'activation superposée à l'image : matérialise les zones qui ont
 * pesé dans la décision du modèle.
 */
export function HeatmapOverlay({
  findings,
  size,
  focusId = null,
  opacity = 1,
}: HeatmapOverlayProps) {
  const theme = useTheme();

  const visible = focusId ? findings.filter((f) => f.id === focusId) : findings;

  return (
    <Svg width={size} height={size} style={[StyleSheet.absoluteFill, { opacity }]}>
      <Defs>
        <RadialGradient id="hot-low" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={theme.colors.warning} stopOpacity="0.85" />
          <Stop offset="0.55" stopColor={theme.colors.warning} stopOpacity="0.28" />
          <Stop offset="1" stopColor={theme.colors.warning} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="hot-high" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={theme.colors.danger} stopOpacity="0.9" />
          <Stop offset="0.55" stopColor={theme.colors.danger} stopOpacity="0.3" />
          <Stop offset="1" stopColor={theme.colors.danger} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {visible.flatMap((finding) =>
        finding.regions.map((region, index) => {
          const tone = SEVERITY_TONE[finding.severity];
          return (
            <React.Fragment key={`${finding.id}-${index}`}>
              {/* Halo diffus : lisibilité de la zone même sur fond clair. */}
              <Circle
                cx={region.x * size}
                cy={region.y * size}
                r={region.r * size * 2.4}
                fill={tone === 'danger' ? 'url(#hot-high)' : 'url(#hot-low)'}
                opacity={0.35 + region.weight * 0.45}
              />
              {/* Contour net : marque le centre exact de la lésion. */}
              <Circle
                cx={region.x * size}
                cy={region.y * size}
                r={region.r * size}
                stroke={tone === 'danger' ? theme.colors.danger : theme.colors.warning}
                strokeWidth={1.4}
                fill="none"
                opacity={0.75}
              />
            </React.Fragment>
          );
        }),
      )}
    </Svg>
  );
}

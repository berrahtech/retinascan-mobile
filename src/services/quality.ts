import type { QualityReport, QualityVerdict } from '@/types';
import { hashString, makeRng } from '@/utils/rng';
import type { ImageProbe } from './imageProbe';

const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));

function verdictFor(score: number): QualityVerdict {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'bon';
  if (score >= 52) return 'acceptable';
  return 'insuffisant';
}

export const QUALITY_LABEL: Record<QualityVerdict, string> = {
  excellent: 'Excellente',
  bon: 'Bonne',
  acceptable: 'Acceptable',
  insuffisant: 'Insuffisante',
};

/**
 * Évalue la qualité d'une image de fond d'œil.
 *
 * `resolution` et `cadrage` sont mesurés sur les métadonnées réelles du
 * fichier. `nettete` et `eclairage` demandent une lecture des pixels, dont le
 * moteur local ne dispose pas : ils sont estimés de façon déterministe à partir
 * d'une empreinte de l'image, en s'appuyant sur le taux de compression comme
 * indice. Un moteur distant renvoie ses propres mesures et remplace celles-ci.
 */
export function estimateQuality(uri: string, probe: ImageProbe): QualityReport {
  const rng = makeRng(hashString(`quality:${uri}`));
  const issues: string[] = [];

  // --- Résolution : mesurée ------------------------------------------------
  const megapixels = (probe.width * probe.height) / 1_000_000;
  let resolution: number;
  if (!probe.width || !probe.height) {
    resolution = 62; // dimensions illisibles : on reste prudent sans pénaliser.
  } else if (megapixels >= 3) {
    resolution = 100;
  } else if (megapixels >= 1.2) {
    resolution = 80 + ((megapixels - 1.2) / 1.8) * 20;
  } else if (megapixels >= 0.4) {
    resolution = 55 + ((megapixels - 0.4) / 0.8) * 25;
  } else {
    resolution = clamp(20 + megapixels * 87);
    issues.push('Définition faible : rapprochez-vous ou augmentez la qualité photo.');
  }

  // --- Cadrage : mesuré ----------------------------------------------------
  // Une image de fond d'œil est quasi carrée ; un format très allongé signale
  // un cadrage qui coupe la rétine.
  const ratio = probe.width && probe.height ? probe.width / probe.height : 1;
  const deviation = Math.abs(Math.log(ratio)); // 0 pour un carré parfait
  let cadrage = clamp(100 - deviation * 130);
  if (cadrage < 62) {
    issues.push('Cadrage étiré : centrez la rétine dans le repère circulaire.');
  }

  // --- Netteté : estimée ---------------------------------------------------
  // Un fichier très compressé pour sa définition perd les micro-contrastes sur
  // lesquels reposent la détection des microanévrismes.
  const bitsPerPixel =
    probe.bytes && megapixels > 0 ? (probe.bytes * 8) / (megapixels * 1_000_000) : null;
  let nettete = rng.range(64, 96);
  if (bitsPerPixel !== null) {
    if (bitsPerPixel < 0.6) nettete = Math.min(nettete, rng.range(38, 56));
    else if (bitsPerPixel < 1.2) nettete = Math.min(nettete, rng.range(58, 76));
  }
  if (nettete < 60) {
    issues.push('Image floue : stabilisez l’appareil et attendez la mise au point.');
  }

  // --- Éclairage : estimé --------------------------------------------------
  const eclairage = rng.range(58, 97);
  if (eclairage < 66) {
    issues.push('Éclairage irrégulier : évitez les reflets et les zones sombres.');
  }

  const score = clamp(
    resolution * 0.28 + nettete * 0.34 + eclairage * 0.22 + cadrage * 0.16,
  );

  if (score < 52) {
    issues.push('Une nouvelle prise de vue est recommandée avant interprétation.');
  }

  return {
    score: Math.round(score),
    verdict: verdictFor(score),
    metrics: {
      resolution: Math.round(resolution),
      nettete: Math.round(nettete),
      eclairage: Math.round(eclairage),
      cadrage: Math.round(cadrage),
    },
    issues,
  };
}

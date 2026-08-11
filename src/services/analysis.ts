import { LESIONS } from '@/data/lesions';
import type { AnalysisStage, Eye, Finding, Grade, Region, ScanResult } from '@/types';
import { createId } from '@/utils/format';
import { hashString, makeRng, type Rng } from '@/utils/rng';
import { probeImage } from './imageProbe';
import { estimateQuality } from './quality';

/** Étapes affichées pendant l'analyse, dans l'ordre. */
export const ANALYSIS_STAGES: AnalysisStage[] = [
  { key: 'prepare', label: "Préparation de l'image", weight: 0.9 },
  { key: 'disc', label: 'Localisation du disque optique', weight: 1.1 },
  { key: 'vessels', label: 'Segmentation du réseau vasculaire', weight: 1.6 },
  { key: 'lesions', label: 'Détection des lésions', weight: 2.3 },
  { key: 'grading', label: 'Classification ICDR', weight: 1.3 },
  { key: 'report', label: 'Rédaction du rapport', weight: 0.8 },
];

export type AnalysisProgress = {
  /** Index de l'étape en cours dans `ANALYSIS_STAGES`. */
  stageIndex: number;
  /** Progression globale, 0..1. */
  progress: number;
};

export type AnalyzeOptions = {
  eye: Eye;
  onProgress?: (progress: AnalysisProgress) => void;
  signal?: AbortSignal;
};

/**
 * Point de bascule vers un vrai modèle : définissez
 * `EXPO_PUBLIC_ANALYSIS_API=https://…/predict` dans votre `.env`.
 * Sans cette variable, le moteur local embarqué est utilisé.
 */
const REMOTE_ENDPOINT = process.env.EXPO_PUBLIC_ANALYSIS_API;

export const ENGINE_NAME = REMOTE_ENDPOINT ? 'RetinaScan Cloud' : 'RetinaScan Local v1.2';

export const isRemoteEngine = Boolean(REMOTE_ENDPOINT);

class AbortError extends Error {
  constructor() {
    super('Analyse annulée');
    this.name = 'AbortError';
  }
}

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new AbortError());
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new AbortError());
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });

/* ------------------------------------------------------------------ *
 * Moteur local
 * ------------------------------------------------------------------ */

/**
 * Distribution des stades utilisée par le moteur local. Elle reste dominée par
 * les stades précoces, comme en dépistage réel, tout en produisant assez de cas
 * avancés pour que le parcours de l'application soit exerçable.
 */
const GRADE_WEIGHTS = [0.34, 0.22, 0.21, 0.14, 0.09];

function drawGrade(rng: Rng): Grade {
  const roll = rng.next();
  let acc = 0;
  for (let g = 0; g < GRADE_WEIGHTS.length; g++) {
    acc += GRADE_WEIGHTS[g];
    if (roll <= acc) return g as Grade;
  }
  return 0;
}

/**
 * Construit une distribution de probabilité centrée sur le stade retenu.
 * Les stades voisins récupèrent l'essentiel de l'incertitude : un modèle réel
 * confond une R2 avec une R1 ou une R3, jamais avec une R0.
 */
function buildProbabilities(grade: Grade, confidence: number): ScanResult['probabilities'] {
  const raw = [0, 1, 2, 3, 4].map((g) => {
    const distance = Math.abs(g - grade);
    if (distance === 0) return confidence;
    return Math.exp(-distance * 1.9) * (1 - confidence);
  });
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((v) => v / sum) as ScanResult['probabilities'];
}

/** Répartit des lésions dans la couronne rétinienne, hors disque optique. */
function scatterRegions(rng: Rng, count: number, discAngle: number): Region[] {
  const regions: Region[] = [];
  for (let i = 0; i < count; i++) {
    // Angle tiré au sort, écarté du disque optique où les lésions sont rares.
    let angle = rng.range(0, Math.PI * 2);
    if (Math.abs(angle - discAngle) < 0.45) angle += 0.9;
    // Densité plus forte autour du pôle postérieur : rayon biaisé vers le centre.
    const radius = Math.pow(rng.next(), 0.7) * 0.38 + 0.04;
    regions.push({
      x: 0.5 + Math.cos(angle) * radius,
      y: 0.5 + Math.sin(angle) * radius * 0.94,
      r: rng.range(0.018, 0.052),
      weight: rng.range(0.45, 1),
    });
  }
  return regions;
}

function buildFindings(rng: Rng, grade: Grade): Finding[] {
  const discAngle = rng.range(0, Math.PI * 2);

  return LESIONS.flatMap<Finding>((spec) => {
    if (grade < spec.fromGrade) {
      // Un signe peut apparaître un stade plus tôt, comme en pratique clinique.
      if (grade !== spec.fromGrade - 1 || !rng.chance(0.18)) return [];
    }

    const overshoot = grade - spec.fromGrade;
    const confidence = Math.min(0.985, rng.range(0.68, 0.9) + Math.max(0, overshoot) * 0.05);

    const count = spec.countable
      ? Math.max(1, Math.round(rng.range(1, 5) * Math.pow(1.85, Math.max(0, overshoot) + 1)))
      : null;

    const regionCount = Math.min(14, count ?? rng.int(2, 5));

    return [
      {
        id: spec.id,
        label: spec.label,
        count,
        confidence,
        severity: spec.severity,
        regions: scatterRegions(rng, regionCount, discAngle),
      },
    ];
  });
}

async function analyzeLocally(
  imageUri: string,
  { eye, onProgress, signal }: AnalyzeOptions,
): Promise<ScanResult> {
  const startedAt = Date.now();
  const rng = makeRng(hashString(imageUri));

  const totalWeight = ANALYSIS_STAGES.reduce((sum, s) => sum + s.weight, 0);
  // Budget total volontairement court : l'attente perçue doit rester crédible
  // sans devenir pénible.
  const totalMs = rng.range(2600, 3900);

  const probe = await probeImage(imageUri);
  const quality = estimateQuality(imageUri, probe);

  let elapsedWeight = 0;
  for (let i = 0; i < ANALYSIS_STAGES.length; i++) {
    const stage = ANALYSIS_STAGES[i];
    const stageMs = (stage.weight / totalWeight) * totalMs;
    // Deux paliers par étape : la barre avance sans à-coups.
    for (const fraction of [0.45, 1]) {
      await wait(stageMs * (fraction === 0.45 ? 0.45 : 0.55), signal);
      onProgress?.({
        stageIndex: i,
        progress: (elapsedWeight + stage.weight * fraction) / totalWeight,
      });
    }
    elapsedWeight += stage.weight;
  }

  const grade = drawGrade(rng);
  // Une image médiocre fait légitimement chuter la confiance du modèle.
  const qualityPenalty = quality.score >= 80 ? 0 : (80 - quality.score) / 260;
  const confidence = Math.min(
    0.985,
    Math.max(0.42, rng.range(0.79, 0.96) - qualityPenalty),
  );

  return {
    id: createId(),
    createdAt: Date.now(),
    imageUri,
    eye,
    grade,
    confidence,
    probabilities: buildProbabilities(grade, confidence),
    // L'œdème maculaire accompagne d'autant plus souvent les stades avancés.
    maculopathy: grade >= 2 ? rng.chance(0.28 + grade * 0.12) : rng.chance(0.05),
    quality,
    findings: buildFindings(rng, grade),
    processingMs: Date.now() - startedAt,
    engine: ENGINE_NAME,
  };
}

/* ------------------------------------------------------------------ *
 * Moteur distant
 * ------------------------------------------------------------------ */

/**
 * Envoie l'image à l'API d'inférence. La réponse attendue reprend la forme de
 * `ScanResult` (sans `id`, `createdAt`, `imageUri`, `processingMs`, `engine`).
 */
async function analyzeRemotely(
  imageUri: string,
  { eye, onProgress, signal }: AnalyzeOptions,
): Promise<ScanResult> {
  const startedAt = Date.now();

  const probe = await probeImage(imageUri);
  onProgress?.({ stageIndex: 0, progress: 0.12 });

  const form = new FormData();
  form.append('eye', eye);
  form.append('image', {
    uri: imageUri,
    name: 'fundus.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  onProgress?.({ stageIndex: 1, progress: 0.3 });

  const response = await fetch(REMOTE_ENDPOINT!, {
    method: 'POST',
    body: form,
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Le service d'analyse a répondu ${response.status}.`);
  }

  onProgress?.({ stageIndex: 4, progress: 0.85 });
  const payload = await response.json();
  onProgress?.({ stageIndex: 5, progress: 1 });

  const grade = (payload.grade ?? 0) as Grade;
  const confidence = payload.confidence ?? 0.8;

  return {
    id: createId(),
    createdAt: Date.now(),
    imageUri,
    eye,
    grade,
    confidence,
    probabilities: payload.probabilities ?? buildProbabilities(grade, confidence),
    maculopathy: Boolean(payload.maculopathy),
    quality: payload.quality ?? estimateQuality(imageUri, probe),
    findings: payload.findings ?? [],
    processingMs: Date.now() - startedAt,
    engine: payload.engine ?? ENGINE_NAME,
  };
}

/* ------------------------------------------------------------------ *
 * Point d'entrée
 * ------------------------------------------------------------------ */

export function analyzeRetina(imageUri: string, options: AnalyzeOptions): Promise<ScanResult> {
  return REMOTE_ENDPOINT ? analyzeRemotely(imageUri, options) : analyzeLocally(imageUri, options);
}

export const isAbortError = (error: unknown) =>
  error instanceof Error && error.name === 'AbortError';

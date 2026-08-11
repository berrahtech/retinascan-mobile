/** Types partagés du domaine RetinaScan. */

export type Eye = 'right' | 'left' | 'unknown';

/** Stade de la classification internationale (ICDR) de la rétinopathie diabétique. */
export type Grade = 0 | 1 | 2 | 3 | 4;

/** Zone d'intérêt en coordonnées normalisées (0..1) relatives à l'image. */
export type Region = {
  x: number;
  y: number;
  /** Rayon normalisé par rapport à la largeur de l'image. */
  r: number;
  /** Contribution de la zone à la décision, 0..1. */
  weight: number;
};

export type Finding = {
  id: string;
  label: string;
  /** Nombre de lésions dénombrées. `null` quand le signe n'est pas dénombrable. */
  count: number | null;
  /** Confiance du modèle sur la présence du signe, 0..1. */
  confidence: number;
  severity: 'low' | 'moderate' | 'high';
  regions: Region[];
};

export type QualityVerdict = 'excellent' | 'bon' | 'acceptable' | 'insuffisant';

export type QualityReport = {
  /** Score global 0..100. */
  score: number;
  verdict: QualityVerdict;
  /** Sous-scores 0..100. */
  metrics: {
    resolution: number;
    nettete: number;
    eclairage: number;
    cadrage: number;
  };
  /** Problèmes détectés, formulés pour l'utilisateur. */
  issues: string[];
};

export type ScanResult = {
  id: string;
  createdAt: number;
  imageUri: string;
  eye: Eye;
  grade: Grade;
  /** Confiance de la classification, 0..1. */
  confidence: number;
  /** Distribution de probabilité sur les 5 stades, somme = 1. */
  probabilities: [number, number, number, number, number];
  /** Œdème maculaire diabétique suspecté. */
  maculopathy: boolean;
  quality: QualityReport;
  findings: Finding[];
  /** Durée de l'inférence en millisecondes. */
  processingMs: number;
  /** Identifiant du moteur ayant produit le résultat. */
  engine: string;
  note?: string;
};

export type AnalysisStage = {
  key: string;
  label: string;
  /** Poids relatif de l'étape dans la barre de progression. */
  weight: number;
};

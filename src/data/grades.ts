import type { Grade } from '@/types';

export type GradeInfo = {
  grade: Grade;
  /** Code court affiché dans les badges (R0…R4). */
  code: string;
  label: string;
  shortLabel: string;
  summary: string;
  /** Conduite à tenir recommandée. */
  referral: string;
  /** Délai de recontrôle recommandé. */
  followUp: string;
  urgency: 'routine' | 'programmee' | 'rapide' | 'urgente';
  advice: string[];
};

/**
 * Classification internationale de la rétinopathie diabétique (ICDR / AAO).
 * Les délais de suivi reprennent les recommandations usuelles de dépistage ;
 * ils ne remplacent pas l'avis d'un ophtalmologiste.
 */
export const GRADES: Record<Grade, GradeInfo> = {
  0: {
    grade: 0,
    code: 'R0',
    label: 'Aucune rétinopathie apparente',
    shortLabel: 'Aucune',
    summary:
      "Aucun signe de rétinopathie diabétique n'a été détecté sur cette image. La rétine analysée présente un aspect vasculaire régulier.",
    referral: "Poursuite du dépistage annuel de routine.",
    followUp: '12 mois',
    urgency: 'routine',
    advice: [
      'Maintenez votre dépistage rétinien une fois par an.',
      'Un équilibre glycémique stable reste la meilleure protection de la rétine.',
      'Surveillez également votre tension artérielle et votre bilan lipidique.',
    ],
  },
  1: {
    grade: 1,
    code: 'R1',
    label: 'Rétinopathie non proliférante légère',
    shortLabel: 'Légère',
    summary:
      "Présence de microanévrismes isolés, sans autre lésion. C'est le tout premier stade visible de l'atteinte rétinienne, généralement sans retentissement sur la vision.",
    referral: "Contrôle ophtalmologique dans le cadre du suivi habituel.",
    followUp: '12 mois',
    urgency: 'routine',
    advice: [
      'Ce stade est réversible ou stabilisable avec un bon contrôle glycémique.',
      "Visez l'objectif d'HbA1c fixé avec votre médecin.",
      "Signalez toute baisse de vision sans attendre le prochain contrôle.",
    ],
  },
  2: {
    grade: 2,
    code: 'R2',
    label: 'Rétinopathie non proliférante modérée',
    shortLabel: 'Modérée',
    summary:
      "Microanévrismes associés à des hémorragies rétiniennes et/ou des exsudats. L'atteinte vasculaire progresse et mérite une surveillance rapprochée.",
    referral: 'Consultation ophtalmologique à programmer.',
    followUp: '3 à 6 mois',
    urgency: 'programmee',
    advice: [
      'Prenez rendez-vous avec un ophtalmologiste dans les prochains mois.',
      "Un renforcement du contrôle glycémique et tensionnel est recommandé.",
      "Un examen du fond d'œil dilaté permettra de confirmer le stade.",
    ],
  },
  3: {
    grade: 3,
    code: 'R3',
    label: 'Rétinopathie non proliférante sévère',
    shortLabel: 'Sévère',
    summary:
      "Hémorragies étendues sur plusieurs quadrants, veines en chapelet et/ou anomalies microvasculaires intrarétiniennes. Le risque d'évolution vers le stade proliférant est élevé.",
    referral: 'Avis ophtalmologique rapide nécessaire.',
    followUp: 'moins de 1 mois',
    urgency: 'rapide',
    advice: [
      "Consultez un ophtalmologiste dans le mois qui vient.",
      "Une angiographie ou un OCT sera probablement proposé.",
      "Un traitement par laser peut être envisagé pour prévenir la progression.",
    ],
  },
  4: {
    grade: 4,
    code: 'R4',
    label: 'Rétinopathie proliférante',
    shortLabel: 'Proliférante',
    summary:
      "Présence de néovaisseaux et/ou d'hémorragie prérétinienne. Ce stade menace la vision et relève d'une prise en charge spécialisée sans délai.",
    referral: 'Prise en charge ophtalmologique urgente.',
    followUp: 'sous 1 à 2 semaines',
    urgency: 'urgente',
    advice: [
      "Contactez un ophtalmologiste ou un service d'urgences ophtalmologiques.",
      'Une photocoagulation panrétinienne ou des injections intravitréennes peuvent être indiquées.',
      "N'attendez pas l'apparition d'une baisse de vision pour consulter.",
    ],
  },
};

export const URGENCY_LABEL: Record<GradeInfo['urgency'], string> = {
  routine: 'Suivi de routine',
  programmee: 'Consultation à programmer',
  rapide: 'Avis rapide',
  urgente: 'Prise en charge urgente',
};

/** Couleur d'accentuation à utiliser pour un stade donné (index de `severityScale`). */
export const gradeColorIndex = (grade: Grade) => grade;

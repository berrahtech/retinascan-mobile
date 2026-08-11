import type { Finding } from '@/types';

/** Catalogue des signes rétiniens que le moteur d'analyse sait rapporter. */
export type LesionSpec = {
  id: string;
  label: string;
  /** Explication courte affichée sous le signe dans le rapport. */
  description: string;
  countable: boolean;
  /** Stade ICDR à partir duquel le signe apparaît habituellement. */
  fromGrade: number;
  severity: Finding['severity'];
};

export const LESIONS: LesionSpec[] = [
  {
    id: 'microaneurysms',
    label: 'Microanévrismes',
    description:
      'Petites dilatations des capillaires, premier signe visible de la rétinopathie diabétique.',
    countable: true,
    fromGrade: 1,
    severity: 'low',
  },
  {
    id: 'hemorrhages',
    label: 'Hémorragies rétiniennes',
    description: 'Fuites de sang dans l’épaisseur de la rétine, en taches ou en flammèches.',
    countable: true,
    fromGrade: 2,
    severity: 'moderate',
  },
  {
    id: 'hard_exudates',
    label: 'Exsudats secs',
    description: 'Dépôts lipidiques jaunâtres à bords nets, témoins d’une fuite vasculaire.',
    countable: true,
    fromGrade: 2,
    severity: 'moderate',
  },
  {
    id: 'cotton_wool',
    label: 'Nodules cotonneux',
    description: 'Zones blanches floues traduisant une souffrance ischémique des fibres nerveuses.',
    countable: true,
    fromGrade: 3,
    severity: 'moderate',
  },
  {
    id: 'venous_beading',
    label: 'Veines en chapelet',
    description: 'Irrégularités du calibre veineux, marqueur d’ischémie rétinienne étendue.',
    countable: false,
    fromGrade: 3,
    severity: 'high',
  },
  {
    id: 'irma',
    label: 'AMIR',
    description:
      'Anomalies microvasculaires intrarétiniennes : shunts qui contournent les capillaires occlus.',
    countable: true,
    fromGrade: 3,
    severity: 'high',
  },
  {
    id: 'neovascularization',
    label: 'Néovaisseaux',
    description:
      'Vaisseaux nouvellement formés, fragiles et hémorragiques : signe de rétinopathie proliférante.',
    countable: false,
    fromGrade: 4,
    severity: 'high',
  },
];

export const getLesion = (id: string) => LESIONS.find((l) => l.id === id);

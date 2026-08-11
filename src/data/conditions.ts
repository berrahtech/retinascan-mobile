/** Bibliothèque pédagogique des pathologies rétiniennes de l'application. */

export type Condition = {
  slug: string;
  name: string;
  /** Une phrase, lisible par un patient. */
  tagline: string;
  /** Icône Ionicons. */
  icon: string;
  /** Teinte d'accent : clé de couleur du thème. */
  tone: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
  prevalence: string;
  description: string;
  signs: string[];
  risks: string[];
  actions: string[];
  /** Vrai si le moteur d'analyse sait la dépister. */
  screened: boolean;
};

export const CONDITIONS: Condition[] = [
  {
    slug: 'retinopathie-diabetique',
    name: 'Rétinopathie diabétique',
    tagline: "Atteinte des petits vaisseaux de la rétine liée au diabète.",
    icon: 'water-outline',
    tone: 'primary',
    prevalence: 'Environ 1 diabétique sur 3 après 15 ans d’évolution',
    description:
      "L'excès prolongé de sucre dans le sang fragilise la paroi des capillaires rétiniens. Ils se dilatent, laissent fuir du plasma, puis se bouchent. La rétine, mal irriguée, fabrique alors de nouveaux vaisseaux fragiles qui peuvent saigner. C'est la première cause de cécité évitable chez l'adulte en âge de travailler.",
    signs: [
      'Microanévrismes : premières dilatations punctiformes des capillaires',
      'Hémorragies rétiniennes en flammèches ou en taches',
      'Exsudats secs jaunâtres à bords nets',
      'Nodules cotonneux blancs et flous',
      'Néovaisseaux au stade proliférant',
    ],
    risks: [
      'Ancienneté du diabète',
      'HbA1c élevée durablement',
      'Hypertension artérielle',
      'Grossesse, puberté, insuffisance rénale',
    ],
    actions: [
      'Dépistage rétinien au moins une fois par an',
      'Contrôle glycémique et tensionnel',
      'Laser ou injections intravitréennes aux stades avancés',
    ],
    screened: true,
  },
  {
    slug: 'oedeme-maculaire',
    name: 'Œdème maculaire diabétique',
    tagline: "Accumulation de liquide au centre de la rétine, là où la vision est la plus fine.",
    icon: 'ellipse-outline',
    tone: 'warning',
    prevalence: 'Jusqu’à 10 % des patients diabétiques',
    description:
      "La macula est la zone centrale de la rétine, responsable de la lecture et de la reconnaissance des visages. Quand les capillaires qui l'entourent deviennent perméables, du liquide s'y accumule et l'épaissit. La vision centrale devient floue ou déformée, indépendamment du stade de la rétinopathie.",
    signs: [
      'Exsudats disposés en couronne autour de la macula',
      'Épaississement rétinien central visible en OCT',
      'Vision centrale floue ou lignes droites ondulées',
    ],
    risks: [
      'Rétinopathie diabétique déjà installée',
      'Hypertension artérielle',
      'Dyslipidémie',
    ],
    actions: [
      'Confirmation par OCT maculaire',
      'Injections intravitréennes d’anti-VEGF',
      'Contrôle strict des facteurs de risque',
    ],
    screened: true,
  },
  {
    slug: 'glaucome',
    name: 'Glaucome',
    tagline: "Atteinte progressive du nerf optique, longtemps silencieuse.",
    icon: 'eye-outline',
    tone: 'info',
    prevalence: 'Environ 2 % de la population après 40 ans',
    description:
      "Le glaucome détruit lentement les fibres du nerf optique, le plus souvent à cause d'une pression intraoculaire trop élevée. La perte du champ visuel commence en périphérie et passe inaperçue pendant des années. Sur une photographie du fond d'œil, l'excavation de la papille optique constitue le signe d'alerte principal.",
    signs: [
      'Rapport cup/disc augmenté (excavation papillaire)',
      'Amincissement de l’anneau neurorétinien',
      'Asymétrie entre les deux yeux',
    ],
    risks: [
      'Antécédents familiaux',
      'Âge supérieur à 40 ans',
      'Forte myopie, origine africaine',
      'Pression intraoculaire élevée',
    ],
    actions: [
      'Mesure de la pression intraoculaire',
      'Champ visuel et OCT du nerf optique',
      'Collyres hypotonisants au long cours',
    ],
    screened: true,
  },
  {
    slug: 'dmla',
    name: 'DMLA',
    tagline: "Dégénérescence maculaire liée à l'âge : la vision centrale s'efface.",
    icon: 'contrast-outline',
    tone: 'danger',
    prevalence: 'Première cause de malvoyance après 50 ans',
    description:
      "Avec l'âge, des déchets métaboliques appelés drusen s'accumulent sous la macula. La forme sèche évolue lentement ; la forme humide, marquée par des néovaisseaux choroïdiens, peut faire chuter la vision centrale en quelques semaines.",
    signs: [
      'Drusen : dépôts jaunâtres au pôle postérieur',
      'Altérations pigmentaires de la macula',
      'Métamorphopsies : les lignes droites paraissent ondulées',
    ],
    risks: ['Âge', 'Tabagisme', 'Antécédents familiaux', 'Alimentation pauvre en antioxydants'],
    actions: [
      'Autosurveillance par grille d’Amsler',
      'Anti-VEGF en cas de forme humide',
      'Arrêt du tabac, compléments antioxydants',
    ],
    screened: false,
  },
  {
    slug: 'cataracte',
    name: 'Cataracte',
    tagline: "Opacification du cristallin qui trouble peu à peu la vision.",
    icon: 'cloudy-outline',
    tone: 'accent',
    prevalence: 'Première cause de cécité réversible dans le monde',
    description:
      "Le cristallin est la lentille naturelle de l'œil. Avec l'âge, ses protéines s'agglomèrent et il perd sa transparence : la vision devient voilée, comme derrière un verre dépoli, avec un éblouissement accru et des couleurs ternies. La cataracte n'atteint pas la rétine, mais un cristallin opaque assombrit l'image du fond d'œil — c'est pourquoi une cataracte dense fait baisser le score de qualité de vos photos. Elle se traite par une chirurgie courte qui remplace le cristallin par un implant.",
    signs: [
      'Vision voilée ou brumeuse, non améliorée par les lunettes',
      'Éblouissement et halos autour des lumières, surtout la nuit',
      'Couleurs qui paraissent jaunies ou délavées',
      'Fond d’œil difficile à photographier : image terne, faible contraste',
    ],
    risks: [
      'Âge',
      'Diabète',
      'Exposition solaire (UV) prolongée',
      'Tabagisme, corticoïdes au long cours',
    ],
    actions: [
      'Examen ophtalmologique à la lampe à fente',
      'Chirurgie de la cataracte quand la gêne devient significative',
      'Protection solaire et contrôle du diabète en prévention',
    ],
    screened: false,
  },
  {
    slug: 'occlusion-veineuse',
    name: 'Occlusion veineuse rétinienne',
    tagline: "Un caillot bloque le drainage veineux de la rétine.",
    icon: 'git-branch-outline',
    tone: 'danger',
    prevalence: 'Deuxième cause vasculaire rétinienne après la rétinopathie diabétique',
    description:
      "Quand une veine rétinienne se bouche, le sang stagne en amont : la rétine se remplit d'hémorragies et gonfle. La baisse de vision est souvent brutale et indolore, sur un seul œil.",
    signs: [
      'Hémorragies en flammèches suivant le trajet veineux',
      'Veines dilatées et tortueuses',
      'Œdème maculaire associé',
    ],
    risks: ['Hypertension artérielle', 'Glaucome', 'Diabète', 'Troubles de la coagulation'],
    actions: [
      'Consultation ophtalmologique rapide',
      'Bilan cardiovasculaire complet',
      'Anti-VEGF si œdème maculaire',
    ],
    screened: false,
  },
  {
    slug: 'retinopathie-hypertensive',
    name: 'Rétinopathie hypertensive',
    tagline: "La tension artérielle laisse sa signature sur les vaisseaux rétiniens.",
    icon: 'pulse-outline',
    tone: 'warning',
    prevalence: 'Fréquente en cas d’hypertension mal contrôlée',
    description:
      "La rétine est le seul endroit du corps où l'on observe directement des artères. Une hypertension durable les rétrécit, les rigidifie et finit par provoquer hémorragies et œdème. Le fond d'œil devient alors un véritable indicateur du risque cardiovasculaire global.",
    signs: [
      'Rétrécissement artériolaire diffus',
      'Signe du croisement artério-veineux',
      'Nodules cotonneux, hémorragies en flammèches',
      'Œdème papillaire dans les formes malignes',
    ],
    risks: ['Hypertension non traitée', 'Tabagisme', 'Insuffisance rénale'],
    actions: [
      'Normalisation de la pression artérielle',
      'Bilan cardiovasculaire',
      'Surveillance du fond d’œil',
    ],
    screened: false,
  },
];

export const getCondition = (slug: string) => CONDITIONS.find((c) => c.slug === slug);

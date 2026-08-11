# RetinaScan

Application mobile de dépistage de la **rétinopathie diabétique** à partir d'une
photographie du fond d'œil. Prise de vue guidée, analyse, rapport clair et
exportable en PDF.

> RetinaScan est un outil d'aide au dépistage. Il ne pose pas de diagnostic et
> ne remplace pas l'examen d'un ophtalmologiste.

## Démarrer

```bash
npm install
```

```bash
npx expo start
```

Scannez le QR code avec Expo Go, ou pressez `a` / `i` / `w` pour Android, iOS ou
le web. La caméra n'est pas disponible dans Expo Go sur web : l'écran de capture
propose alors l'import depuis la galerie.

## Parcours

| Écran | Route | Rôle |
| --- | --- | --- |
| Introduction | `/onboarding` | Trois écrans, dont la portée médicale de l'outil |
| Accueil | `/` | Tableau de bord, lancement du scan, derniers résultats |
| Capture | `/scan/capture` | Caméra plein écran, repère de visée, choix de l'œil |
| Analyse | `/scan/analyzing` | Progression par étapes, annulable |
| Rapport | `/result/[id]` | Stade ICDR, carte des lésions, conduite à tenir, export PDF |
| Historique | `/history` | Analyses groupées par jour, filtrables |
| Bibliothèque | `/learn`, `/condition/[slug]` | Fiches pathologies |
| Profil | `/profile` | Informations, thème, rappels, données |

## Architecture

```
app/                  Routes expo-router
src/
  theme/              Jetons de design (couleurs, espacements, typographie, motion)
  components/ui/      Primitives : Button, Card, Badge, ProgressRing, Txt…
  components/         Composants métier : ScanReticle, HeatmapOverlay, SeverityScale…
  services/           Analyse, qualité d'image, export PDF, sélection d'image
  store/              État persistant (zustand + AsyncStorage)
  data/               Grades ICDR, lésions, fiches pathologies, mentions légales
  utils/              Formatage, aléatoire déterministe, haptique
scripts/              Génération procédurale des icônes
```

Aucune couleur ni valeur d'espacement n'est écrite en dur dans un composant :
tout passe par `src/theme/tokens.ts`, ce qui rend les thèmes sombre et clair
interchangeables à chaud.

## Le moteur d'analyse

`src/services/analysis.ts` expose un point d'entrée unique :

```ts
const result = await analyzeRetina(imageUri, { eye, onProgress, signal });
```

Deux implémentations se cachent derrière :

- **Moteur local** (par défaut). Il produit un résultat complet et **déterministe**
  pour une image donnée — même image, même rapport — à partir d'une empreinte de
  l'URI. La définition et le cadrage de l'image sont réellement mesurés ; la
  netteté et l'éclairage sont estimés. Il sert à faire tourner et démontrer tout
  le parcours sans dépendre d'un serveur.
- **Moteur distant**. Activé dès que `EXPO_PUBLIC_ANALYSIS_API` est défini :

  ```bash
  EXPO_PUBLIC_ANALYSIS_API=https://votre-api/predict
  ```

  L'image est postée en `multipart/form-data` (champs `image` et `eye`). La
  réponse JSON attendue reprend la forme de `ScanResult` sans les champs
  `id`, `createdAt`, `imageUri`, `processingMs` et `engine`, renseignés côté
  application :

  ```json
  {
    "grade": 2,
    "confidence": 0.88,
    "probabilities": [0.02, 0.05, 0.88, 0.03, 0.02],
    "maculopathy": true,
    "quality": { "score": 78, "verdict": "bon", "metrics": {}, "issues": [] },
    "findings": [
      { "id": "microaneurysms", "label": "Microanévrismes", "count": 14,
        "confidence": 0.91, "severity": "low",
        "regions": [{ "x": 0.62, "y": 0.41, "r": 0.03, "weight": 0.8 }] }
    ]
  }
  ```

  Les `regions` sont en coordonnées normalisées (0–1) : ce sont elles que la
  carte d'activation superpose à l'image du rapport.

Brancher un vrai modèle ne demande donc aucune modification de l'interface.

## Classification

Les cinq stades suivent la classification internationale (ICDR) : `R0` aucune
rétinopathie, `R1` légère, `R2` modérée, `R3` sévère, `R4` proliférante. Chaque
stade porte sa conduite à tenir et son délai de recontrôle (`src/data/grades.ts`).

## Données

Tout est stocké **localement** sur l'appareil via AsyncStorage. Aucune image
n'est transmise sans action explicite de l'utilisateur — et uniquement vers
l'API d'inférence si elle est configurée.

## Assets

Les icônes sont générées par un script, sans dépendance native :

```bash
node scripts/generate-assets.js
```

## Vérifications

```bash
npm run typecheck
```

/**
 * Générateur pseudo-aléatoire déterministe.
 *
 * Le moteur d'analyse local s'en sert pour qu'une même image produise toujours
 * le même résultat : sans cela, rouvrir un scan donnerait des chiffres
 * différents à chaque fois et l'application paraîtrait incohérente.
 */

/** Hachage FNV-1a 32 bits d'une chaîne. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Suite pseudo-aléatoire mulberry32, uniforme sur [0, 1). */
export function makeRng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    /** Réel dans [min, max). */
    range: (min: number, max: number) => min + next() * (max - min),
    /** Entier dans [min, max] inclus. */
    int: (min: number, max: number) => Math.floor(min + next() * (max - min + 1)),
    /** Vrai avec la probabilité `p`. */
    chance: (p: number) => next() < p,
    pick: <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)],
  };
}

export type Rng = ReturnType<typeof makeRng>;

import React, { useEffect, useRef, useState } from 'react';

import { Txt, type TxtProps } from './Text';

export type AnimatedNumberProps = Omit<TxtProps, 'children'> & {
  value: number;
  /** Durée du comptage, en ms. */
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Compteur qui monte jusqu'à sa valeur.
 *
 * Piloté en JS plutôt que par Reanimated : le contenu d'un `<Text>` ne peut pas
 * être animé sur le thread UI, et une seule valeur sur ~900 ms ne pèse rien.
 */
export function AnimatedNumber({
  value,
  duration = 900,
  decimals = 0,
  suffix = '',
  prefix = '',
  ...textProps
}: AnimatedNumberProps) {
  const [displayed, setDisplayed] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const start = Date.now();
    let frame: number;

    const settle = () => {
      fromRef.current = value;
      setDisplayed(value);
    };

    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / duration);
      if (t < 1) {
        setDisplayed(from + (value - from) * easeOutCubic(t));
        frame = requestAnimationFrame(tick);
      } else {
        settle();
      }
    };

    frame = requestAnimationFrame(tick);
    // Filet de sécurité : `requestAnimationFrame` est suspendu quand l'écran
    // n'est pas composité. Sans cela, le compteur resterait figé sur 0.
    const guard = setTimeout(settle, duration + 120);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(guard);
    };
  }, [duration, value]);

  return (
    <Txt {...textProps}>
      {prefix}
      {displayed.toFixed(decimals).replace('.', ',')}
      {suffix}
    </Txt>
  );
}

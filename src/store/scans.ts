import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Grade, ScanResult } from '@/types';

type ScansState = {
  /** Du plus récent au plus ancien. */
  scans: ScanResult[];
  hydrated: boolean;

  addScan: (scan: ScanResult) => void;
  removeScan: (id: string) => void;
  updateNote: (id: string, note: string) => void;
  clearAll: () => void;
};

export const useScans = create<ScansState>()(
  persist(
    (set) => ({
      scans: [],
      hydrated: false,

      addScan: (scan) => set((state) => ({ scans: [scan, ...state.scans] })),
      removeScan: (id) => set((state) => ({ scans: state.scans.filter((s) => s.id !== id) })),
      updateNote: (id, note) =>
        set((state) => ({
          scans: state.scans.map((s) => (s.id === id ? { ...s, note } : s)),
        })),
      clearAll: () => set({ scans: [] }),
    }),
    {
      name: 'retinascan.scans',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated: _, ...rest }) => rest as ScansState,
      onRehydrateStorage: () => () => useScans.setState({ hydrated: true }),
    },
  ),
);

/* ------------------------------------------------------------------ *
 * Sélecteurs
 * ------------------------------------------------------------------ */

export const selectScanById = (id?: string) => (state: ScansState) =>
  id ? state.scans.find((s) => s.id === id) : undefined;

export type ScanStats = {
  total: number;
  /** Stade le plus élevé observé sur les scans retenus. */
  worstGrade: Grade | null;
  /** Moyenne des scores de qualité, arrondie. */
  averageQuality: number;
  lastScanAt: number | null;
  /** Nombre de scans nécessitant un avis (stade ≥ 2). */
  needsAttention: number;
};

export function computeStats(scans: ScanResult[]): ScanStats {
  if (scans.length === 0) {
    return { total: 0, worstGrade: null, averageQuality: 0, lastScanAt: null, needsAttention: 0 };
  }
  return {
    total: scans.length,
    worstGrade: scans.reduce<Grade>((max, s) => (s.grade > max ? s.grade : max), 0),
    averageQuality: Math.round(
      scans.reduce((sum, s) => sum + s.quality.score, 0) / scans.length,
    ),
    lastScanAt: Math.max(...scans.map((s) => s.createdAt)),
    needsAttention: scans.filter((s) => s.grade >= 2).length,
  };
}

/** Date du prochain dépistage conseillé, d'après le dernier scan. */
export function nextScreeningDate(
  scans: ScanResult[],
  fallbackMonths: number,
): { date: number; months: number } | null {
  if (scans.length === 0) return null;
  const latest = scans.reduce((a, b) => (a.createdAt > b.createdAt ? a : b));
  const monthsByGrade: Record<Grade, number> = { 0: 12, 1: 12, 2: 4, 3: 1, 4: 0.5 };
  const months = Math.min(fallbackMonths || 12, monthsByGrade[latest.grade]);
  return { date: latest.createdAt + months * 30 * 24 * 3600 * 1000, months };
}

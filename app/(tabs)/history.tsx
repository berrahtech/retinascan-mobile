import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ScanCard } from '@/components/ScanCard';
import { TAB_BAR_SPACE } from '@/components/TabBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Txt } from '@/components/ui/Text';
import { useScans } from '@/store/scans';
import { useTheme } from '@/theme';
import type { ScanResult } from '@/types';
import { formatDate, plural } from '@/utils/format';

type Filter = 'all' | 'normal' | 'attention';

/** Regroupe les analyses par jour, du plus récent au plus ancien. */
function groupByDay(scans: ScanResult[]) {
  const groups = new Map<string, ScanResult[]>();
  for (const scan of scans) {
    const key = formatDate(scan.createdAt);
    const bucket = groups.get(key);
    if (bucket) bucket.push(scan);
    else groups.set(key, [scan]);
  }
  return Array.from(groups, ([title, data]) => ({ title, data }));
}

export default function HistoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const scans = useScans((s) => s.scans);
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    if (filter === 'normal') return scans.filter((s) => s.grade <= 1);
    if (filter === 'attention') return scans.filter((s) => s.grade >= 2);
    return scans;
  }, [filter, scans]);

  const sections = useMemo(() => groupByDay(filtered), [filtered]);

  return (
    <Screen>
      <View style={{ paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.md }}>
        <Txt variant="title">Historique</Txt>
        <Txt variant="caption" color="muted" style={{ marginTop: 2 }}>
          {scans.length === 0
            ? 'Vos analyses apparaîtront ici'
            : `${plural(scans.length, 'analyse')} enregistrée${scans.length > 1 ? 's' : ''}`}
        </Txt>

        {scans.length > 0 && (
          <SegmentedControl
            options={[
              { value: 'all', label: 'Toutes' },
              { value: 'normal', label: 'R0 – R1' },
              { value: 'attention', label: 'À surveiller' },
            ]}
            value={filter}
            onChange={(value) => setFilter(value as Filter)}
            style={{ marginTop: theme.spacing.lg }}
          />
        )}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.xl,
          paddingBottom: TAB_BAR_SPACE,
          gap: theme.spacing.md,
        }}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { marginTop: theme.spacing.xs }]}>
            <Txt variant="overline" color="muted" uppercase>
              {section.title}
            </Txt>
            <View style={[styles.rule, { backgroundColor: theme.colors.border }]} />
          </View>
        )}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 50).duration(360)}>
            <ScanCard scan={item} onPress={() => router.push(`/result/${item.id}`)} />
          </Animated.View>
        )}
        ListEmptyComponent={
          scans.length === 0 ? (
            <EmptyState
              icon="time-outline"
              title="Aucune analyse enregistrée"
              message="Chaque scan est conservé sur votre appareil pour suivre l’évolution de votre rétine dans le temps."
              actionLabel="Lancer un scan"
              onAction={() => router.push('/scan/capture')}
            />
          ) : (
            <EmptyState
              icon="filter-outline"
              title="Aucun résultat"
              message="Aucune analyse ne correspond à ce filtre."
            />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rule: { flex: 1, height: StyleSheet.hairlineWidth * 2 },
});

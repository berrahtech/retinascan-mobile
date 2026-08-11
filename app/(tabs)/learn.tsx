import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SeverityScale } from '@/components/SeverityScale';
import { TAB_BAR_SPACE } from '@/components/TabBar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Txt } from '@/components/ui/Text';
import { CONDITIONS } from '@/data/conditions';
import { GRADES } from '@/data/grades';
import { useTheme } from '@/theme';
import type { Grade } from '@/types';

export default function LearnScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.md,
          paddingBottom: TAB_BAR_SPACE,
          gap: theme.spacing.xxl,
        }}
      >
        <View>
          <Txt variant="title">Comprendre</Txt>
          <Txt variant="caption" color="muted" style={{ marginTop: 2 }}>
            Ce que l’application observe sur votre rétine
          </Txt>
        </View>

        {/* Échelle ICDR -------------------------------------------------- */}
        <Animated.View entering={FadeInDown.duration(420)}>
          <Card padding={theme.spacing.xl}>
            <Txt variant="subheading">L’échelle internationale</Txt>
            <Txt variant="caption" color="muted" style={{ marginTop: 2 }}>
              Cinq stades, du fond d’œil sain à la forme proliférante
            </Txt>

            <View style={{ marginTop: theme.spacing.xl }}>
              <SeverityScale value={4} showLabel={false} />
            </View>

            <View style={{ marginTop: theme.spacing.xl, gap: theme.spacing.md }}>
              {([0, 1, 2, 3, 4] as Grade[]).map((grade) => {
                const info = GRADES[grade];
                return (
                  <View key={grade} style={[styles.gradeRow, { gap: theme.spacing.md }]}>
                    <View
                      style={[
                        styles.gradeChip,
                        {
                          backgroundColor: `${theme.severityScale[grade]}22`,
                          borderColor: `${theme.severityScale[grade]}66`,
                          borderRadius: theme.radius.sm,
                        },
                      ]}
                    >
                      <Txt variant="micro" color={theme.severityScale[grade]} weight="800">
                        {info.code}
                      </Txt>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Txt variant="bodyStrong">{info.shortLabel}</Txt>
                      <Txt variant="micro" color="muted" style={{ marginTop: 1 }}>
                        Contrôle : {info.followUp}
                      </Txt>
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>
        </Animated.View>

        {/* Pathologies --------------------------------------------------- */}
        <View>
          <SectionHeader
            title="Pathologies"
            subtitle="Fiches détaillées, écrites pour être comprises"
          />
          <View style={{ gap: theme.spacing.md }}>
            {CONDITIONS.map((condition, index) => (
              <Animated.View
                key={condition.slug}
                entering={FadeInDown.delay(index * 60).duration(400)}
              >
                <PressableScale
                  onPress={() => router.push(`/condition/${condition.slug}`)}
                  activeScale={0.98}
                  style={[
                    styles.card,
                    {
                      backgroundColor:
                        theme.scheme === 'dark'
                          ? theme.colors.surface
                          : theme.colors.surfaceSolid,
                      borderColor: theme.colors.border,
                      borderRadius: theme.radius.lg,
                      padding: theme.spacing.lg,
                      gap: theme.spacing.md,
                      ...theme.elevation(1),
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.icon,
                      {
                        backgroundColor: `${theme.colors[condition.tone]}1F`,
                        borderRadius: theme.radius.md,
                      },
                    ]}
                  >
                    <Ionicons
                      name={condition.icon as never}
                      size={21}
                      color={theme.colors[condition.tone]}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={[styles.titleRow, { gap: theme.spacing.sm }]}>
                      <Txt variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
                        {condition.name}
                      </Txt>
                      {condition.screened && (
                        <Badge
                          label="Dépisté"
                          tone={theme.colors.success}
                          size="sm"
                          icon="checkmark-circle"
                        />
                      )}
                    </View>
                    <Txt variant="caption" color="muted" numberOfLines={2} style={{ marginTop: 2 }}>
                      {condition.tagline}
                    </Txt>
                  </View>

                  <Ionicons name="chevron-forward" size={17} color={theme.colors.textMuted} />
                </PressableScale>
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gradeRow: { flexDirection: 'row', alignItems: 'center' },
  gradeChip: {
    width: 38,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  card: { flexDirection: 'row', alignItems: 'center', borderWidth: StyleSheet.hairlineWidth * 2 },
  icon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
});

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { DisclaimerCard } from '@/components/DisclaimerCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { Txt } from '@/components/ui/Text';
import { getCondition } from '@/data/conditions';
import { useTheme } from '@/theme';

const SECTIONS = [
  { key: 'signs', title: 'Ce que l’on observe', icon: 'search-outline' },
  { key: 'risks', title: 'Facteurs de risque', icon: 'trending-up-outline' },
  { key: 'actions', title: 'Que faire', icon: 'medkit-outline' },
] as const;

export default function ConditionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const condition = getCondition(slug);

  if (!condition) {
    return (
      <Screen>
        <View style={styles.missing}>
          <Txt variant="subheading">Fiche introuvable</Txt>
          <Button label="Retour" variant="ghost" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const accent = theme.colors[condition.tone];

  return (
    <Screen>
      <View style={[styles.header, { paddingHorizontal: theme.spacing.xl }]}>
        <PressableScale
          onPress={() => router.back()}
          accessibilityLabel="Retour"
          activeScale={0.9}
          style={[
            styles.headerButton,
            { backgroundColor: theme.colors.surfaceStrong, borderColor: theme.colors.border },
          ]}
        >
          <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
        </PressableScale>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xl,
          paddingBottom: theme.spacing.huge,
          gap: theme.spacing.lg,
        }}
      >
        {/* Bandeau ------------------------------------------------------- */}
        <Animated.View entering={FadeInDown.duration(420)}>
          <View
            style={[
              styles.hero,
              { borderRadius: theme.radius.xl, padding: theme.spacing.xl, borderColor: `${accent}44` },
            ]}
          >
            <LinearGradient
              colors={[`${accent}2E`, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View
              style={[
                styles.heroIcon,
                { backgroundColor: `${accent}26`, borderRadius: theme.radius.lg },
              ]}
            >
              <Ionicons name={condition.icon as never} size={26} color={accent} />
            </View>

            <Txt variant="title" style={{ marginTop: theme.spacing.lg }}>
              {condition.name}
            </Txt>
            <Txt variant="body" color="secondary" style={{ marginTop: theme.spacing.xs }}>
              {condition.tagline}
            </Txt>

            <View style={[styles.badges, { marginTop: theme.spacing.lg, gap: theme.spacing.xs }]}>
              <Badge
                label={condition.screened ? 'Dépisté par RetinaScan' : 'Non dépisté'}
                tone={condition.screened ? theme.colors.success : theme.colors.textMuted}
                icon={condition.screened ? 'checkmark-circle' : 'information-circle'}
                size="sm"
              />
            </View>
          </View>
        </Animated.View>

        {/* Prévalence ---------------------------------------------------- */}
        <Animated.View entering={FadeInDown.delay(60).duration(420)}>
          <Card padding={theme.spacing.lg} variant="flat" style={{ backgroundColor: theme.colors.surfaceStrong }}>
            <View style={[styles.row, { gap: theme.spacing.md }]}>
              <Ionicons name="stats-chart-outline" size={18} color={accent} />
              <View style={{ flex: 1 }}>
                <Txt variant="micro" color="muted" uppercase>
                  Fréquence
                </Txt>
                <Txt variant="caption" style={{ marginTop: 2 }}>
                  {condition.prevalence}
                </Txt>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Description ---------------------------------------------------- */}
        <Animated.View entering={FadeInDown.delay(110).duration(420)}>
          <Card padding={theme.spacing.xl}>
            <Txt variant="subheading">En quelques mots</Txt>
            <Txt variant="body" color="secondary" style={{ marginTop: theme.spacing.sm }}>
              {condition.description}
            </Txt>
          </Card>
        </Animated.View>

        {/* Listes ---------------------------------------------------------- */}
        {SECTIONS.map((section, index) => (
          <Animated.View
            key={section.key}
            entering={FadeInDown.delay(160 + index * 50).duration(420)}
          >
            <Card padding={theme.spacing.xl}>
              <View style={[styles.row, { gap: theme.spacing.sm }]}>
                <Ionicons name={section.icon} size={17} color={accent} />
                <Txt variant="subheading">{section.title}</Txt>
              </View>
              <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.sm }}>
                {condition[section.key].map((item) => (
                  <View key={item} style={[styles.bulletRow, { gap: theme.spacing.sm }]}>
                    <View
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 3,
                        backgroundColor: accent,
                        marginTop: 8,
                      }}
                    />
                    <Txt variant="caption" color="secondary" style={{ flex: 1 }}>
                      {item}
                    </Txt>
                  </View>
                ))}
              </View>
            </Card>
          </Animated.View>
        ))}

        {condition.screened && (
          <Button
            label="Dépister maintenant"
            icon="scan-outline"
            block
            size="lg"
            onPress={() => router.push('/scan/capture')}
          />
        )}

        <DisclaimerCard compact />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  hero: { overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth * 2 },
  heroIcon: { width: 54, height: 54, alignItems: 'center', justifyContent: 'center' },
  badges: { flexDirection: 'row', flexWrap: 'wrap' },
  row: { flexDirection: 'row', alignItems: 'center' },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start' },
});

import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { CycleBarChart } from '../components/CycleBarChart';
import { GridSlider } from '../components/GridSlider';
import { useAppData } from '../context/AppContext';
import { colors, radius, spacing, typography } from '../theme/theme';
import { useI18n } from '../i18n';
import { diffInDays } from '../utils/date';
import { groupPeriodDays } from '../utils/cyclePredictor';

export function StatisticsScreen() {
  const { periodDays, prediction } = useAppData();
  const { t, formatDate } = useI18n();

  const groups = useMemo(() => groupPeriodDays(periodDays), [periodDays]);

  const cycleLengths = useMemo(() => {
    const lengths: number[] = [];
    for (let i = 1; i < groups.length; i++) {
      lengths.push(diffInDays(groups[i - 1].startDate, groups[i].startDate));
    }
    return lengths.slice(-8);
  }, [groups]);

  const recentPeriods = [...groups].reverse().slice(0, 12);

  const formatRange = (group: (typeof groups)[number]) =>
    formatDate(group.startDate) +
    (group.startDate !== group.endDate ? ` – ${formatDate(group.endDate)}` : '');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.title}>{t.statistics.title}</Text>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={typography.bodyMuted}>{t.statistics.avgCycleLength}</Text>
            <Text style={styles.statValue}>{t.common.days(prediction.averageCycleLength)}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={typography.bodyMuted}>{t.statistics.avgPeriodLength}</Text>
            <Text style={styles.statValue}>{t.common.days(prediction.averagePeriodLength)}</Text>
          </Card>
        </View>

        <Card style={styles.chartCard}>
          <Text style={typography.heading}>{t.statistics.cycleHistory}</Text>
          <Text style={[typography.bodyMuted, styles.chartHint]}>{t.statistics.cycleHistoryHint}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <CycleBarChart values={cycleLengths} average={prediction.averageCycleLength} />
          </ScrollView>
        </Card>

        <Card style={styles.historyCard}>
          <Text style={typography.heading}>{t.statistics.pastPeriods}</Text>
          {recentPeriods.length === 0 && (
            <Text style={typography.bodyMuted}>{t.statistics.noPeriodDays}</Text>
          )}
          <GridSlider
            data={recentPeriods}
            rows={2}
            columnsPerView={2}
            keyExtractor={(group) => group.startDate}
            itemAccessibilityLabel={(group) =>
              t.statistics.periodRange(formatRange(group), t.common.days(group.length))
            }
            pageAccessibilityLabel={t.statistics.sliderPage}
            renderItem={(group) => (
              <View style={styles.periodTile}>
                <Text style={typography.body}>{formatRange(group)}</Text>
                <Text style={typography.bodyMuted}>{t.common.days(group.length)}</Text>
              </View>
            )}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    gap: spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  chartCard: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  chartHint: {
    marginBottom: spacing.sm,
  },
  historyCard: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  periodTile: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
});

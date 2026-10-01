import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { CycleBarChart } from '../components/CycleBarChart';
import { useAppData } from '../context/AppContext';
import { colors, spacing, typography } from '../theme/theme';
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

  const recentPeriods = [...groups].reverse().slice(0, 6);

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
          {recentPeriods.map((group) => (
            <View key={group.startDate} style={styles.historyRow}>
              <Text style={typography.body}>
                {formatDate(group.startDate)}
                {group.startDate !== group.endDate ? ` – ${formatDate(group.endDate)}` : ''}
              </Text>
              <Text style={typography.bodyMuted}>{t.common.days(group.length)}</Text>
            </View>
          ))}
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
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});

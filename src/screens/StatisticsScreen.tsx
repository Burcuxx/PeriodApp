import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { CycleBarChart } from '../components/CycleBarChart';
import { Screen } from '../components/Screen';
import { useAppData } from '../context/AppContext';
import { useI18n } from '../i18n';
import { colors, fonts, spacing, typography, useLayout } from '../theme/theme';
import { FlowIntensity } from '../types';
import { groupPeriodDays } from '../utils/cyclePredictor';
import { addDaysISO, diffInDays, fromISODate } from '../utils/date';

const FLOW_SHADES: Record<FlowIntensity, string> = {
  heavy: colors.periodDay,
  medium: '#E27A9C',
  light: '#F3C3D3',
};

export function StatisticsScreen() {
  const { periodDays, symptoms, prediction } = useAppData();
  const { t, formatShortDate } = useI18n();
  const { isWide, isMedium } = useLayout();

  const groups = useMemo(() => groupPeriodDays(periodDays), [periodDays]);

  const cycles = useMemo(() => {
    const list: { length: number; label: string }[] = [];
    for (let i = 1; i < groups.length; i++) {
      list.push({
        length: diffInDays(groups[i - 1].startDate, groups[i].startDate),
        label: t.calendarLocale.monthNamesShort[fromISODate(groups[i - 1].startDate).getMonth()],
      });
    }
    return list.slice(-8);
  }, [groups, t]);

  const recentPeriods = [...groups].reverse().slice(0, 6);

  const tiles = [
    { label: t.statistics.avgCycleLength, value: String(prediction.averageCycleLength), unit: t.common.days(prediction.averageCycleLength).replace(/^\d+\s*/, ''), dark: true },
    { label: t.statistics.avgPeriodLength, value: String(prediction.averagePeriodLength), unit: t.common.days(prediction.averagePeriodLength).replace(/^\d+\s*/, ''), accent: true },
    { label: t.statistics.loggedPeriods, value: String(groups.length), unit: '' },
    { label: t.statistics.nextPeriod, value: prediction.nextPeriodStart ? formatShortDate(prediction.nextPeriodStart) : '–', unit: '', small: true },
  ];

  const chartCard = (
    <Card style={[styles.card, isWide && styles.flex]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitles}>
          <Text style={typography.title}>{t.statistics.cycleHistory}</Text>
          <Text style={typography.bodyMuted}>{t.statistics.cycleHistoryHint}</Text>
        </View>
        <View style={styles.averageKey}>
          <View style={styles.averageKeyLine} />
          <Text style={styles.averageKeyText}>{t.statistics.averageLine(prediction.averageCycleLength)}</Text>
        </View>
      </View>
      <CycleBarChart
        values={cycles.map((c) => c.length)}
        labels={cycles.map((c) => c.label)}
        average={prediction.averageCycleLength}
      />
    </Card>
  );

  const periodsCard = (
    <Card style={[styles.card, isWide && styles.flex]}>
      <Text style={typography.title}>{t.statistics.pastPeriods}</Text>
      {recentPeriods.length === 0 && <Text style={typography.bodyMuted}>{t.statistics.noPeriodDays}</Text>}
      {recentPeriods.map((group) => (
        <View key={group.startDate} style={styles.periodRow}>
          <View style={styles.periodTop}>
            <Text style={styles.periodRange}>
              {formatShortDate(group.startDate)}
              {group.startDate !== group.endDate ? ` – ${formatShortDate(group.endDate)}` : ''}
            </Text>
            <Text style={styles.periodLength}>{t.common.days(group.length)}</Text>
          </View>
          <View style={styles.flowStrip}>
            {Array.from({ length: group.length }, (_, i) => {
              const flow = symptoms[addDaysISO(group.startDate, i)]?.flow;
              return (
                <View
                  key={i}
                  style={[styles.flowDay, { backgroundColor: flow ? FLOW_SHADES[flow] : colors.predictedPeriod }]}
                />
              );
            })}
          </View>
        </View>
      ))}
    </Card>
  );

  return (
    <Screen title={t.statistics.title}>
      <View style={styles.tiles}>
        {tiles.map((tile) => (
          <View
            key={tile.label}
            style={[
              styles.tile,
              { flexBasis: isWide ? '22%' : isMedium ? '40%' : '45%' },
              tile.dark && styles.tileDark,
            ]}
          >
            <Text style={[typography.label, tile.dark && { color: colors.textOnDark }]}>{tile.label}</Text>
            <Text
              style={[
                styles.tileValue,
                !isMedium && styles.tileValueSmall,
                tile.small && styles.tileValueText,
                tile.dark && { color: colors.white },
                tile.accent && { color: '#B42756' },
              ]}
            >
              {tile.value}
              {tile.unit ? <Text style={styles.tileUnit}> {tile.unit}</Text> : null}
            </Text>
          </View>
        ))}
      </View>

      {isWide ? (
        <View style={styles.columns}>
          {chartCard}
          {periodsCard}
        </View>
      ) : (
        <>
          {chartCard}
          {periodsCard}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tile: {
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 20,
    gap: 10,
  },
  tileDark: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  tileValue: {
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 48,
    color: colors.text,
  },
  tileValueSmall: {
    fontSize: 34,
    lineHeight: 38,
  },
  tileValueText: {
    fontSize: 26,
    lineHeight: 32,
  },
  tileUnit: {
    fontFamily: fonts.medium,
    fontSize: 18,
  },
  columns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  flex: {
    flex: 1,
    minWidth: 0,
  },
  card: {
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cardTitles: {
    gap: 4,
  },
  averageKey: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  averageKeyLine: {
    width: 18,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
  },
  averageKeyText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.textSoft,
  },
  periodRow: {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: 10,
  },
  periodTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  periodRange: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
    flexShrink: 1,
  },
  periodLength: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.textMuted,
  },
  flowStrip: {
    flexDirection: 'row',
    gap: 4,
  },
  flowDay: {
    width: 28,
    height: 8,
    borderRadius: 4,
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../i18n';
import { colors, fonts, radius, spacing, typography } from '../theme/theme';

interface CycleBarChartProps {
  values: number[]; // cycle lengths in days, oldest to newest
  labels: string[]; // short label under each bar (e.g. start month)
  average: number;
}

const CHART_HEIGHT = 200;

/** Bars stretch to the card width, so the chart works from phone to desktop. */
export function CycleBarChart({ values, labels, average }: CycleBarChartProps) {
  const { t } = useI18n();

  if (values.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={typography.bodyMuted}>{t.statistics.notEnoughData}</Text>
      </View>
    );
  }

  const maxValue = Math.max(...values, average) * 1.12;
  const averageBottom = (average / maxValue) * CHART_HEIGHT;

  return (
    <View style={styles.chart}>
      <View style={styles.plot}>
        <View style={[styles.averageLine, { bottom: averageBottom }]} />
        {values.map((value, index) => {
          const isLatest = index === values.length - 1;
          return (
            <View key={index} style={styles.column}>
              <Text style={styles.value}>{value}</Text>
              <View
                style={[
                  styles.bar,
                  { height: (value / maxValue) * CHART_HEIGHT, backgroundColor: isLatest ? colors.periodDay : '#E9C9D6' },
                ]}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.labels}>
        {labels.map((label, index) => (
          <Text key={index} numberOfLines={1} style={styles.label}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    gap: spacing.sm,
  },
  plot: {
    height: CHART_HEIGHT + 24,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  averageLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    opacity: 0.55,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.text,
  },
  bar: {
    width: '100%',
    maxWidth: 48,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  labels: {
    flexDirection: 'row',
    gap: 10,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.textMuted,
  },
  empty: {
    padding: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
  },
});

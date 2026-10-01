import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Card } from '../components/Card';
import { DayDetailModal } from '../components/DayDetailModal';
import { useAppData } from '../context/AppContext';
import { colors, radius, spacing, typography } from '../theme/theme';
import { buildMarkedDates } from '../utils/calendarMarks';
import { useI18n } from '../i18n';
import { diffInDays, todayISO } from '../utils/date';

export function CalendarScreen() {
  const { periodDays, prediction } = useAppData();
  const { t, language, formatDate } = useI18n();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const markedDates = useMemo(
    () => buildMarkedDates(periodDays, prediction),
    [periodDays, prediction]
  );

  const daysUntilNextPeriod = prediction.nextPeriodStart
    ? diffInDays(todayISO(), prediction.nextPeriodStart)
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.title}>{t.calendar.title}</Text>

        <Card style={styles.summaryCard}>
          {prediction.currentCycleDay !== null && (
            <Text style={typography.heading}>{t.calendar.cycleDay(prediction.currentCycleDay)}</Text>
          )}
          {daysUntilNextPeriod !== null && (
            <Text style={typography.bodyMuted}>
              {daysUntilNextPeriod > 0
                ? t.calendar.daysUntilPeriod(daysUntilNextPeriod)
                : daysUntilNextPeriod === 0
                ? t.calendar.periodMayStartToday
                : t.calendar.predictionPassed}
            </Text>
          )}
          {prediction.nextPeriodStart && (
            <Text style={typography.bodyMuted}>
              {t.calendar.nextPeriod(formatDate(prediction.nextPeriodStart))}
            </Text>
          )}
          {prediction.ovulationDate && (
            <Text style={typography.bodyMuted}>
              {t.calendar.predictedOvulation(formatDate(prediction.ovulationDate))}
            </Text>
          )}
        </Card>

        <Card style={styles.calendarCard}>
          <Calendar
            key={language}
            markingType="multi-period"
            markedDates={markedDates}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            theme={calendarTheme}
            firstDay={1}
          />
        </Card>

        <Card style={styles.legendCard}>
          <LegendRow color={colors.periodDay} label={t.calendar.legendPeriodDay} />
          <LegendRow color={colors.predictedPeriod} label={t.calendar.legendPredictedPeriod} />
          <LegendRow color={colors.fertileWindow} label={t.calendar.legendFertileWindow} />
          <LegendRow color={colors.ovulation} label={t.calendar.legendOvulation} />
        </Card>
      </ScrollView>

      <DayDetailModal date={selectedDate} onClose={() => setSelectedDate(null)} />
    </SafeAreaView>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={typography.bodyMuted}>{label}</Text>
    </View>
  );
}

const calendarTheme = {
  backgroundColor: colors.surface,
  calendarBackground: colors.surface,
  textSectionTitleColor: colors.textMuted,
  todayTextColor: colors.primary,
  dayTextColor: colors.text,
  arrowColor: colors.primary,
  monthTextColor: colors.text,
};

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
  summaryCard: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  calendarCard: {
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  legendCard: {
    gap: spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: radius.full,
  },
});

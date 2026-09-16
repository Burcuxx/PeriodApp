import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Card } from '../components/Card';
import { DayDetailModal } from '../components/DayDetailModal';
import { useAppData } from '../context/AppContext';
import { colors, radius, spacing, typography } from '../theme/theme';
import { buildMarkedDates } from '../utils/calendarMarks';
import { diffInDays, formatDisplayDate, todayISO } from '../utils/date';

export function CalendarScreen() {
  const { periodDays, prediction } = useAppData();
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
        <Text style={typography.title}>Döngüm</Text>

        <Card style={styles.summaryCard}>
          {prediction.currentCycleDay !== null && (
            <Text style={typography.heading}>Döngü günü: {prediction.currentCycleDay}</Text>
          )}
          {daysUntilNextPeriod !== null && (
            <Text style={typography.bodyMuted}>
              {daysUntilNextPeriod > 0
                ? `Tahmini adete ${daysUntilNextPeriod} gün var`
                : daysUntilNextPeriod === 0
                ? 'Adetin bugün başlayabilir'
                : 'Adet tahmini tarihi geçti, döngünü güncelle'}
            </Text>
          )}
          {prediction.nextPeriodStart && (
            <Text style={typography.bodyMuted}>
              Sonraki adet: {formatDisplayDate(prediction.nextPeriodStart)}
            </Text>
          )}
          {prediction.ovulationDate && (
            <Text style={typography.bodyMuted}>
              Tahmini yumurtlama: {formatDisplayDate(prediction.ovulationDate)}
            </Text>
          )}
        </Card>

        <Card style={styles.calendarCard}>
          <Calendar
            markingType="multi-period"
            markedDates={markedDates}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            theme={calendarTheme}
            firstDay={1}
          />
        </Card>

        <Card style={styles.legendCard}>
          <LegendRow color={colors.periodDay} label="Adet günü" />
          <LegendRow color={colors.predictedPeriod} label="Tahmini adet" />
          <LegendRow color={colors.fertileWindow} label="Doğurgan pencere" />
          <LegendRow color={colors.ovulation} label="Tahmini yumurtlama" />
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

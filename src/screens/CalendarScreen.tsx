import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { PillButton } from '../components/Button';
import { CycleRing } from '../components/CycleRing';
import { DayDetailModal } from '../components/DayDetailModal';
import { DayLogForm } from '../components/DayLogForm';
import { MonthCalendar, monthOf, VisibleMonth } from '../components/MonthCalendar';
import { Screen } from '../components/Screen';
import { useAppData } from '../context/AppContext';
import { useI18n } from '../i18n';
import { colors, fonts, radius, spacing, typography, useLayout } from '../theme/theme';
import { diffInDays, todayISO } from '../utils/date';
import { buildDayKinds, getCyclePhase, getRingSegments } from '../utils/dayKinds';

export function CalendarScreen() {
  const { periodDays, symptoms, prediction } = useAppData();
  const { t, formatDate, formatShortDate } = useI18n();
  const { isWide, isMedium, width } = useLayout();
  const today = todayISO();

  const [visibleMonth, setVisibleMonth] = useState<VisibleMonth>(() => monthOf(today));
  // Wide screens always show a day in the side panel; phones open it in a modal.
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [modalOpen, setModalOpen] = useState(false);

  const kinds = useMemo(() => buildDayKinds(periodDays, prediction), [periodDays, prediction]);
  const segments = getRingSegments(prediction);
  const phase = getCyclePhase(today, periodDays, prediction);

  const daysUntilNextPeriod = prediction.nextPeriodStart ? diffInDays(today, prediction.nextPeriodStart) : null;
  const countdown = daysUntilNextPeriod !== null && daysUntilNextPeriod > 0;
  const statusLine =
    daysUntilNextPeriod === null
      ? null
      : daysUntilNextPeriod > 0
      ? t.calendar.daysUntilPeriod(daysUntilNextPeriod)
      : daysUntilNextPeriod === 0
      ? t.calendar.periodMayStartToday
      : t.calendar.predictionPassed;

  const handleSelect = (iso: string) => {
    setSelectedDate(iso);
    if (!isWide) setModalOpen(true);
  };

  const goToToday = () => {
    setVisibleMonth(monthOf(today));
    setSelectedDate(today);
  };

  const ringSize = isMedium ? 280 : Math.min(240, width - 72);

  const hero = (
    <Card>
      <View style={[styles.hero, isMedium && styles.heroRow]}>
        {segments ? (
          <CycleRing
            size={ringSize}
            cycleLength={segments.cycleLength}
            currentDay={prediction.currentCycleDay}
            periodLength={segments.periodLength}
            fertileStart={segments.fertileStart}
            fertileLength={segments.fertileLength}
            ovulationIndex={segments.ovulationIndex}
            label={countdown ? t.calendar.ringLabel : t.calendar.ringCycleDay}
            value={String(countdown ? daysUntilNextPeriod : prediction.currentCycleDay ?? '–')}
            caption={countdown ? t.calendar.ringDays(daysUntilNextPeriod!) : ''}
          />
        ) : null}
        <View style={styles.heroText}>
          <View style={styles.badges}>
            {prediction.currentCycleDay !== null && (
              <Text style={[styles.badge, styles.badgeDark]}>{t.calendar.cycleDay(prediction.currentCycleDay)}</Text>
            )}
            {phase && <Text style={[styles.badge, styles.badgeSoft]}>{t.calendar.phases[phase]}</Text>}
          </View>
          {prediction.nextPeriodStart && (
            <Text style={styles.headline}>{t.calendar.nextPeriod(formatDate(prediction.nextPeriodStart))}</Text>
          )}
          {statusLine && <Text style={typography.body}>{statusLine}</Text>}
          <Text style={typography.bodyMuted}>{t.calendar.predictionNote}</Text>
          <View style={[styles.facts, !isMedium && styles.factsStacked]}>
            {prediction.nextPeriodStart && prediction.nextPeriodEnd && (
              <Fact
                label={t.calendar.legendPredictedPeriod}
                value={`${formatShortDate(prediction.nextPeriodStart)} – ${formatShortDate(prediction.nextPeriodEnd)}`}
                background={colors.periodSoft}
                labelColor={colors.periodDayDark}
              />
            )}
            {prediction.fertileWindowStart && prediction.fertileWindowEnd && (
              <Fact
                label={t.calendar.legendFertileWindow}
                value={`${formatShortDate(prediction.fertileWindowStart)} – ${formatShortDate(prediction.fertileWindowEnd)}`}
                background="#F0EBFB"
                labelColor={colors.fertileText}
              />
            )}
            <Fact
              label={t.statistics.avgCycleLength}
              value={t.common.days(prediction.averageCycleLength)}
              background={colors.surfaceMuted}
              labelColor={colors.textMuted}
            />
          </View>
        </View>
      </View>
    </Card>
  );

  const calendar = (
    <Card style={styles.calendarCard}>
      <MonthCalendar
        visibleMonth={visibleMonth}
        onChangeMonth={setVisibleMonth}
        selected={isWide ? selectedDate : null}
        onSelect={handleSelect}
        kinds={kinds}
        loggedDays={symptoms}
        cellHeight={isMedium ? 64 : 46}
      />
      <View style={styles.legend}>
        <LegendItem swatch={[styles.swatch, { backgroundColor: colors.periodDay }]} label={t.calendar.legendPeriodDay} />
        <LegendItem swatch={[styles.swatch, styles.swatchPredicted]} label={t.calendar.legendPredictedPeriod} />
        <LegendItem swatch={[styles.swatch, styles.swatchFertile]} label={t.calendar.legendFertileWindow} />
        <LegendItem swatch={[styles.swatch, { backgroundColor: colors.ovulation }]} label={t.calendar.legendOvulation} />
        <LegendItem swatch={styles.swatchDot} label={t.calendar.legendLogged} />
      </View>
    </Card>
  );

  return (
    <Screen
      eyebrow={formatDate(today)}
      title={t.calendar.title}
      action={<PillButton label={t.calendarLocale.today} icon="today" onPress={goToToday} />}
    >
      {isWide ? (
        <View style={styles.columns}>
          <View style={styles.mainColumn}>
            {hero}
            {calendar}
          </View>
          <Card style={styles.sidePanel}>
            <DayLogForm date={selectedDate} />
          </Card>
        </View>
      ) : (
        <>
          {hero}
          {calendar}
        </>
      )}

      {!isWide && <DayDetailModal date={modalOpen ? selectedDate : null} onClose={() => setModalOpen(false)} />}
    </Screen>
  );
}

function Fact({
  label,
  value,
  background,
  labelColor,
}: {
  label: string;
  value: string;
  background: string;
  labelColor: string;
}) {
  return (
    <View style={[styles.fact, { backgroundColor: background }]}>
      <Text style={[typography.label, { color: labelColor }]}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

function LegendItem({ swatch, label }: { swatch: object; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={swatch} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  columns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  mainColumn: {
    flex: 1,
    minWidth: 0,
    gap: spacing.lg,
  },
  sidePanel: {
    width: 384,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  heroRow: {
    flexDirection: 'row',
    gap: 40,
  },
  heroText: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    gap: 10,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    fontFamily: fonts.bold,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  badgeDark: {
    backgroundColor: colors.ink,
    color: colors.white,
  },
  badgeSoft: {
    backgroundColor: colors.primaryLight,
    color: colors.primaryDark,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 31,
    letterSpacing: -0.3,
    color: colors.text,
  },
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: spacing.sm,
  },
  factsStacked: {
    flexDirection: 'column',
  },
  fact: {
    flexGrow: 1,
    flexBasis: 170,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    gap: 4,
  },
  factValue: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.text,
  },
  calendarCard: {
    gap: spacing.md,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 20,
    rowGap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSoft,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 5,
  },
  swatchPredicted: {
    backgroundColor: colors.predictedPeriod,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.predictedBorder,
  },
  swatchFertile: {
    backgroundColor: colors.fertileWindow,
    borderWidth: 1,
    borderColor: '#C9BCEF',
  },
  swatchDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
    backgroundColor: colors.ink,
  },
});

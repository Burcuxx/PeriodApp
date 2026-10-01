import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../i18n';
import { colors, fonts, radius, spacing } from '../theme/theme';
import { addDaysISO, fromISODate, todayISO, toISODate } from '../utils/date';
import { DayKind } from '../utils/dayKinds';
import { Icon } from './Icon';

export interface VisibleMonth {
  year: number;
  month: number; // 0-11
}

export function monthOf(iso: string): VisibleMonth {
  const date = fromISODate(iso);
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function shiftMonth({ year, month }: VisibleMonth, delta: number): VisibleMonth {
  const date = new Date(year, month + delta, 1, 12);
  return { year: date.getFullYear(), month: date.getMonth() };
}

interface MonthCalendarProps {
  visibleMonth: VisibleMonth;
  onChangeMonth: (month: VisibleMonth) => void;
  selected?: string | null;
  onSelect: (iso: string) => void;
  kinds?: Record<string, DayKind>;
  loggedDays?: Record<string, unknown>;
  /** Days after this ISO date are disabled. */
  maxDate?: string;
  /** "fill" paints the selected day as a period day (used in onboarding). */
  selectionStyle?: 'outline' | 'fill';
  cellHeight?: number;
}

export function MonthCalendar({
  visibleMonth,
  onChangeMonth,
  selected,
  onSelect,
  kinds = {},
  loggedDays = {},
  maxDate,
  selectionStyle = 'outline',
  cellHeight = 48,
}: MonthCalendarProps) {
  const { t, formatDate } = useI18n();
  const today = todayISO();

  const weeks = useMemo(() => {
    const first = new Date(visibleMonth.year, visibleMonth.month, 1, 12);
    const offset = (first.getDay() + 6) % 7; // Monday-first
    const start = addDaysISO(toISODate(first), -offset);
    const daysInMonth = new Date(visibleMonth.year, visibleMonth.month + 1, 0).getDate();
    const weekCount = Math.ceil((offset + daysInMonth) / 7);
    return Array.from({ length: weekCount }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => addDaysISO(start, w * 7 + d))
    );
  }, [visibleMonth]);

  const locale = t.calendarLocale;
  const weekdayNames = [...locale.dayNamesShort.slice(1), locale.dayNamesShort[0]];
  const nextDisabled =
    !!maxDate &&
    toISODate(new Date(visibleMonth.year, visibleMonth.month + 1, 1, 12)) > maxDate;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.monthTitle}>
          {locale.monthNames[visibleMonth.month]} {visibleMonth.year}
        </Text>
        <View style={styles.arrows}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={locale.monthNames[shiftMonth(visibleMonth, -1).month]}
            onPress={() => onChangeMonth(shiftMonth(visibleMonth, -1))}
            style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}
          >
            <Icon name="chevron-left" size={18} strokeWidth={2} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={locale.monthNames[shiftMonth(visibleMonth, 1).month]}
            disabled={nextDisabled}
            onPress={() => onChangeMonth(shiftMonth(visibleMonth, 1))}
            style={({ pressed }) => [styles.arrow, nextDisabled && styles.disabled, pressed && styles.pressed]}
          >
            <Icon name="chevron-right" size={18} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      <View style={styles.week}>
        {weekdayNames.map((name) => (
          <Text key={name} style={styles.weekday}>
            {name}
          </Text>
        ))}
      </View>

      {weeks.map((week) => (
        <View key={week[0]} style={styles.week}>
          {week.map((iso) => {
            const date = fromISODate(iso);
            const outside = date.getMonth() !== visibleMonth.month;
            const disabled = !!maxDate && iso > maxDate;
            const isSelected = iso === selected;
            const kind: DayKind | undefined =
              selectionStyle === 'fill' ? (isSelected ? 'period' : undefined) : kinds[iso];
            const textColor = disabled
              ? '#D6CAD1'
              : kind === 'period' || kind === 'ovulation'
              ? colors.white
              : kind === 'predicted'
              ? colors.periodDayDark
              : kind === 'fertile'
              ? colors.fertileText
              : outside
              ? colors.textFaint
              : colors.text;
            return (
              <Pressable
                key={iso}
                accessibilityRole="button"
                accessibilityLabel={formatDate(iso)}
                accessibilityState={{ selected: isSelected, disabled }}
                disabled={disabled}
                onPress={() => onSelect(iso)}
                style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                  styles.day,
                  { height: cellHeight },
                  (pressed || hovered) && !kind && styles.dayHover,
                  kind === 'period' && styles.period,
                  kind === 'predicted' && styles.predicted,
                  kind === 'fertile' && styles.fertile,
                  kind === 'ovulation' && styles.ovulation,
                  iso === today && styles.today,
                  isSelected && selectionStyle === 'outline' && styles.selected,
                ]}
              >
                <Text style={[styles.dayText, { color: textColor }]}>{date.getDate()}</Text>
                {selectionStyle === 'outline' && (
                  <View style={[styles.dot, !!loggedDays[iso] && { backgroundColor: textColor }]} />
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  monthTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    letterSpacing: -0.3,
    color: colors.text,
  },
  arrows: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  arrow: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.35,
  },
  week: {
    flexDirection: 'row',
    gap: 6,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
    paddingBottom: 4,
  },
  day: {
    flex: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dayHover: {
    backgroundColor: '#F6EEF1',
  },
  period: {
    backgroundColor: colors.periodDay,
  },
  predicted: {
    backgroundColor: colors.predictedPeriod,
    borderColor: colors.predictedBorder,
    borderStyle: 'dashed',
  },
  fertile: {
    backgroundColor: colors.fertileWindow,
  },
  ovulation: {
    backgroundColor: colors.ovulation,
  },
  today: {
    borderWidth: 2,
    borderColor: colors.ink,
    borderStyle: 'solid',
  },
  selected: {
    outlineWidth: 3,
    outlineColor: colors.primary,
    outlineStyle: 'solid',
    outlineOffset: 2,
  },
  dayText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});

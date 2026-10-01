import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppData } from '../context/AppContext';
import { useI18n } from '../i18n';
import { colors, fonts, moodColors, radius, spacing, typography } from '../theme/theme';
import { CrampSeverity, FlowIntensity, MoodType } from '../types';
import { todayISO } from '../utils/date';
import { buildDayKinds, DayKind } from '../utils/dayKinds';
import { Button } from './Button';
import { Drop, Icon } from './Icon';
import { OptionChips, SegmentedControl } from './OptionChips';

const MOODS: MoodType[] = ['happy', 'calm', 'energetic', 'sad', 'irritable', 'anxious'];
const FLOWS: FlowIntensity[] = ['light', 'medium', 'heavy'];

const STATUS_COLORS: Record<DayKind, string> = {
  period: '#B42756',
  predicted: colors.periodDayDark,
  fertile: colors.fertileText,
  ovulation: colors.fertileText,
};

interface DayLogFormProps {
  date: string;
  onSaved?: () => void;
  /** Extra actions rendered under Save (e.g. Close in the modal). */
  footer?: React.ReactNode;
}

export function DayLogForm({ date, onSaved, footer }: DayLogFormProps) {
  const { periodDays, symptoms, prediction, togglePeriodDay, upsertSymptomLog } = useAppData();
  const { t, formatDate } = useI18n();

  const [mood, setMood] = useState<MoodType | undefined>(undefined);
  const [flow, setFlow] = useState<FlowIntensity | undefined>(undefined);
  const [cramp, setCramp] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const existing = symptoms[date];
    setMood(existing?.mood);
    setFlow(existing?.flow);
    setCramp(existing?.crampSeverity !== undefined ? String(existing.crampSeverity) : undefined);
    setNotes(existing?.notes ?? '');
  }, [date, symptoms]);

  const isPeriodDay = periodDays.includes(date);
  const kind = buildDayKinds(periodDays, prediction)[date];
  const legend: Record<DayKind, string> = {
    period: t.calendar.legendPeriodDay,
    predicted: t.calendar.legendPredictedPeriod,
    fertile: t.calendar.legendFertileWindow,
    ovulation: t.calendar.legendOvulation,
  };
  const status = [date === todayISO() ? t.calendarLocale.today : null, kind ? legend[kind] : null]
    .filter(Boolean)
    .join(' · ');

  // Tapping a selected option again clears it.
  const toggle = <T,>(setter: (v: T | undefined) => void, current: T | undefined) => (value: T) =>
    setter(current === value ? undefined : value);

  const handleSave = async () => {
    await upsertSymptomLog(date, {
      mood,
      flow,
      crampSeverity: cramp !== undefined ? (Number(cramp) as CrampSeverity) : undefined,
      notes: notes.trim() || undefined,
    });
    onSaved?.();
  };

  return (
    <View style={styles.form}>
      <View style={styles.header}>
        <Text style={typography.label}>{t.dayDetail.heading}</Text>
        <Text style={typography.title}>{formatDate(date)}</Text>
        {status ? (
          <Text style={[styles.status, { color: kind ? STATUS_COLORS[kind] : colors.textMuted }]}>{status}</Text>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: isPeriodDay }}
        onPress={() => togglePeriodDay(date)}
        style={({ pressed }) => [styles.periodToggle, isPeriodDay ? styles.periodOn : styles.periodOff, pressed && styles.pressed]}
      >
        <Text style={[styles.periodText, { color: isPeriodDay ? colors.white : colors.periodDayDark }]}>
          {isPeriodDay ? t.dayDetail.markedAsPeriod : t.dayDetail.markAsPeriod}
        </Text>
        <Icon name="drop" size={22} color={isPeriodDay ? colors.white : colors.periodDayDark} strokeWidth={2} />
      </Pressable>

      <View style={styles.section}>
        <Text style={typography.label}>{t.dayDetail.flow}</Text>
        <View style={styles.flowRow}>
          {FLOWS.map((value, i) => {
            const selected = flow === value;
            return (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => toggle(setFlow, flow)(value)}
                style={({ pressed }) => [styles.flow, selected && styles.flowSelected, pressed && styles.pressed]}
              >
                <View style={styles.drops}>
                  {Array.from({ length: i + 1 }, (_, n) => (
                    <Drop key={n} size={16} color={colors.periodDay} />
                  ))}
                </View>
                <Text style={styles.flowText}>{t.dayDetail.flowLevels[value]}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={typography.label}>{t.dayDetail.mood}</Text>
        <OptionChips
          options={MOODS.map((value) => ({ value, label: t.dayDetail.moods[value], dotColor: moodColors[value] }))}
          selected={mood}
          onSelect={toggle(setMood, mood)}
        />
      </View>

      <View style={styles.section}>
        <Text style={typography.label}>{t.dayDetail.cramps}</Text>
        <SegmentedControl
          options={t.dayDetail.crampLevels.map((label, i) => ({ value: String(i), label }))}
          selected={cramp}
          onSelect={toggle(setCramp, cramp)}
        />
      </View>

      <View style={styles.section}>
        <Text style={typography.label}>{t.dayDetail.notes}</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder={t.dayDetail.notesPlaceholder}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={t.dayDetail.notes}
          style={styles.notesInput}
          multiline
        />
      </View>

      <View style={styles.actions}>
        <Button label={t.common.save} onPress={handleSave} />
        {footer}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
  header: {
    gap: 6,
  },
  status: {
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  periodToggle: {
    minHeight: 56,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 18,
    paddingRight: spacing.md,
    borderWidth: 1.5,
  },
  periodOff: {
    backgroundColor: colors.surface,
    borderColor: colors.predictedBorder,
    borderStyle: 'dashed',
  },
  periodOn: {
    backgroundColor: colors.periodDay,
    borderColor: colors.periodDay,
  },
  periodText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  section: {
    gap: 10,
  },
  flowRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flow: {
    flex: 1,
    minHeight: 76,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  flowSelected: {
    borderWidth: 2,
    borderColor: colors.periodDay,
    backgroundColor: '#FDF1F5',
  },
  drops: {
    flexDirection: 'row',
    gap: 2,
  },
  flowText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  notesInput: {
    minHeight: 92,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: '#FDFAFB',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    textAlignVertical: 'top',
  },
  actions: {
    gap: spacing.sm,
  },
});

import { Calendar } from 'react-native-calendars';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAppData } from '../context/AppContext';
import { colors, radius, spacing, typography } from '../theme/theme';
import { todayISO } from '../utils/date';
import { OptionChips } from '../components/OptionChips';

const CYCLE_LENGTH_OPTIONS = [21, 24, 26, 28, 30, 32, 35].map((n) => ({
  value: String(n),
  label: `${n} gün`,
}));

const PERIOD_LENGTH_OPTIONS = [2, 3, 4, 5, 6, 7, 8].map((n) => ({
  value: String(n),
  label: `${n} gün`,
}));

export function OnboardingScreen() {
  const { completeOnboarding } = useAppData();
  const [lastPeriodStart, setLastPeriodStart] = useState<string>(todayISO());
  const [cycleLength, setCycleLength] = useState('28');
  const [periodLength, setPeriodLength] = useState('5');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await completeOnboarding(lastPeriodStart, Number(cycleLength), Number(periodLength));
    setSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.title}>Hoş geldin 🌸</Text>
        <Text style={[typography.bodyMuted, styles.subtitle]}>
          Döngünü doğru tahmin edebilmemiz için birkaç bilgiye ihtiyacımız var.
        </Text>

        <Card style={styles.card}>
          <Text style={typography.heading}>Son adet başlangıç tarihin</Text>
          <Calendar
            current={lastPeriodStart}
            maxDate={todayISO()}
            onDayPress={(day) => setLastPeriodStart(day.dateString)}
            markedDates={{
              [lastPeriodStart]: {
                selected: true,
                selectedColor: colors.primary,
              },
            }}
            theme={calendarTheme}
            style={styles.calendar}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={typography.heading}>Ortalama döngü uzunluğun</Text>
          <Text style={[typography.bodyMuted, styles.hint]}>
            Bir adet başlangıcından diğerine kaç gün geçiyor?
          </Text>
          <OptionChips options={CYCLE_LENGTH_OPTIONS} selected={cycleLength} onSelect={setCycleLength} />
        </Card>

        <Card style={styles.card}>
          <Text style={typography.heading}>Adet dönemin genelde kaç gün sürüyor?</Text>
          <OptionChips
            options={PERIOD_LENGTH_OPTIONS}
            selected={periodLength}
            onSelect={setPeriodLength}
          />
        </Card>

        <Button label="Başla" onPress={handleSubmit} disabled={submitting} style={styles.submit} />
      </ScrollView>
    </SafeAreaView>
  );
}

const calendarTheme = {
  backgroundColor: colors.surface,
  calendarBackground: colors.surface,
  textSectionTitleColor: colors.textMuted,
  selectedDayBackgroundColor: colors.primary,
  selectedDayTextColor: colors.white,
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
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  card: {
    marginBottom: spacing.md,
  },
  calendar: {
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  hint: {
    marginBottom: spacing.sm,
  },
  submit: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});

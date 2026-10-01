import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Icon, LogoMark } from '../components/Icon';
import { MonthCalendar, monthOf, VisibleMonth } from '../components/MonthCalendar';
import { OptionChips } from '../components/OptionChips';
import { useAppData } from '../context/AppContext';
import { useI18n } from '../i18n';
import { colors, fonts, spacing, typography, useLayout } from '../theme/theme';
import { todayISO } from '../utils/date';

const CYCLE_LENGTHS = [21, 24, 26, 28, 30, 32, 35];
const PERIOD_LENGTHS = [2, 3, 4, 5, 6, 7, 8];

export function OnboardingScreen() {
  const { completeOnboarding } = useAppData();
  const { t } = useI18n();
  const { isWide, isMedium, gutter } = useLayout();

  const toOption = (n: number) => ({ value: String(n), label: t.common.days(n) });

  const [lastPeriodStart, setLastPeriodStart] = useState<string>(todayISO());
  const [visibleMonth, setVisibleMonth] = useState<VisibleMonth>(() => monthOf(todayISO()));
  const [cycleLength, setCycleLength] = useState('28');
  const [periodLength, setPeriodLength] = useState('5');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await completeOnboarding(lastPeriodStart, Number(cycleLength), Number(periodLength));
    setSubmitting(false);
  };

  const brand = (
    <View style={[styles.brand, isWide ? styles.brandWide : { padding: gutter, paddingTop: spacing.xl }]}>
      <View style={styles.wordmarkRow}>
        <LogoMark size={28} />
        <Text style={styles.wordmark}>
          Period<Text style={{ color: '#F07FA5' }}>.</Text>
        </Text>
      </View>
      {isWide && (
        <View style={styles.brandRing} pointerEvents="none">
          <Svg width={420} height={420}>
            <Circle cx={210} cy={210} r={170} fill="none" stroke="#3E2A40" strokeWidth={44} />
            <Circle cx={210} cy={210} r={170} fill="none" stroke={colors.periodDay} strokeWidth={44} strokeDasharray="190 878" transform="rotate(-90 210 210)" />
            <Circle cx={210} cy={210} r={170} fill="none" stroke="#8B76D9" strokeWidth={44} strokeDasharray="228 840" strokeDashoffset={-343} transform="rotate(-90 210 210)" />
          </Svg>
        </View>
      )}
      <View style={styles.brandCopy}>
        <Text style={[styles.tagline, !isWide && styles.taglineSmall]}>{t.onboarding.tagline}</Text>
        <Text style={styles.brandSubtitle}>{t.onboarding.subtitle}</Text>
      </View>
      <View style={styles.privacy}>
        <Icon name="lock" size={18} color={colors.textOnDark} strokeWidth={2} />
        <Text style={styles.privacyText}>{t.onboarding.privacy}</Text>
      </View>
    </View>
  );

  const stepTitle = (n: number, title: string) => (
    <View style={styles.stepTitle}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{n}</Text>
      </View>
      <Text style={[typography.heading, styles.flexShrink]}>{title}</Text>
    </View>
  );

  const form = (
    <View style={[styles.form, { paddingHorizontal: isWide ? 64 : gutter }]}>
      <View style={styles.formHeader}>
        <Text style={typography.label}>{t.onboarding.stepsLabel}</Text>
        <Text style={typography.display}>{t.onboarding.title}</Text>
      </View>

      <View style={[styles.steps, isMedium && styles.stepsRow]}>
        <Card style={[styles.stepCard, isMedium && styles.flex]}>
          {stepTitle(1, t.onboarding.lastPeriodStart)}
          <MonthCalendar
            visibleMonth={visibleMonth}
            onChangeMonth={setVisibleMonth}
            selected={lastPeriodStart}
            onSelect={setLastPeriodStart}
            maxDate={todayISO()}
            selectionStyle="fill"
            cellHeight={44}
          />
        </Card>
        <View style={[styles.steps, isMedium && styles.flex]}>
          <Card style={styles.stepCard}>
            {stepTitle(2, t.onboarding.cycleLength)}
            <Text style={typography.bodyMuted}>{t.onboarding.cycleLengthHint}</Text>
            <OptionChips options={CYCLE_LENGTHS.map(toOption)} selected={cycleLength} onSelect={setCycleLength} />
          </Card>
          <Card style={styles.stepCard}>
            {stepTitle(3, t.onboarding.periodLength)}
            <OptionChips options={PERIOD_LENGTHS.map(toOption)} selected={periodLength} onSelect={setPeriodLength} />
          </Card>
        </View>
      </View>

      <Button
        label={t.onboarding.start}
        icon="arrow-right"
        onPress={handleSubmit}
        disabled={submitting}
        style={isMedium ? styles.submitWide : undefined}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isWide && styles.containerWide]} edges={['top', 'bottom']}>
      {isWide ? (
        <View style={styles.split}>
          {brand}
          <ScrollView style={styles.flex} contentContainerStyle={styles.formScroll}>
            {form}
          </ScrollView>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.stackScroll}>
          {brand}
          {form}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerWide: {
    backgroundColor: colors.ink,
  },
  split: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  flexShrink: {
    flexShrink: 1,
  },
  brand: {
    backgroundColor: colors.ink,
    gap: spacing.lg,
    overflow: 'hidden',
  },
  brandWide: {
    width: '40%',
    maxWidth: 560,
    paddingHorizontal: 56,
    paddingVertical: spacing.xxl,
    justifyContent: 'space-between',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 26,
    letterSpacing: -0.5,
    color: colors.white,
  },
  brandRing: {
    position: 'absolute',
    right: -170,
    bottom: -150,
    opacity: 0.9,
  },
  brandCopy: {
    gap: 14,
    maxWidth: 420,
  },
  tagline: {
    fontFamily: fonts.display,
    fontSize: 56,
    lineHeight: 58,
    letterSpacing: -1.5,
    color: colors.white,
  },
  taglineSmall: {
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  brandSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textOnDark,
  },
  privacy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  privacyText: {
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textOnDark,
  },
  formScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  stackScroll: {
    paddingBottom: spacing.xxl,
  },
  form: {
    gap: spacing.lg,
    paddingTop: spacing.lg,
    width: '100%',
    maxWidth: 960,
  },
  formHeader: {
    gap: 6,
  },
  steps: {
    gap: 20,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepCard: {
    gap: 14,
  },
  stepTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.predictedPeriod,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.periodDayDark,
  },
  submitWide: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xl,
  },
});

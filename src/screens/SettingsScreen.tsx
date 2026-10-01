import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { OptionChips } from '../components/OptionChips';
import { Screen } from '../components/Screen';
import { useAppData } from '../context/AppContext';
import { LANGUAGE_NAMES, SUPPORTED_LANGUAGES, useI18n } from '../i18n';
import { LanguagePreference } from '../types';
import { colors, fonts, radius, spacing, typography, useLayout } from '../theme/theme';
import { requestNotificationPermissions } from '../utils/notifications';

const CYCLE_LENGTHS = [21, 24, 26, 28, 30, 32, 35];
const PERIOD_LENGTHS = [2, 3, 4, 5, 6, 7, 8];

export function SettingsScreen() {
  const { settings, updateSettings } = useAppData();
  const { t } = useI18n();

  const toOption = (n: number) => ({ value: String(n), label: t.common.days(n) });

  const languageOptions: { value: LanguagePreference; label: string }[] = [
    { value: 'system', label: t.settings.systemLanguage },
    ...SUPPORTED_LANGUAGES.map((value) => ({ value, label: LANGUAGE_NAMES[value] })),
  ];

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermissions();
      if (!granted) return;
    }
    await updateSettings({ notificationsEnabled: value });
  };

  return (
    <Screen title={t.settings.title} maxWidth={1000}>
      <Card style={styles.card}>
        <SettingRow title={t.settings.language} first>
          <OptionChips
            options={languageOptions}
            selected={settings.language}
            onSelect={(value) => updateSettings({ language: value })}
          />
        </SettingRow>
        <SettingRow title={t.settings.notifications} hint={t.settings.notificationsHint}>
          <View style={styles.switchRow}>
            <Switch
              accessibilityLabel={t.settings.notifications}
              value={settings.notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#D9CBD2', true: colors.primary }}
              thumbColor={colors.white}
              ios_backgroundColor="#D9CBD2"
              // react-native-web otherwise paints the active thumb teal.
              {...({ activeThumbColor: colors.white } as object)}
            />
          </View>
        </SettingRow>
      </Card>

      <Card style={styles.card}>
        <SettingRow title={t.settings.avgCycleLength} first>
          <OptionChips
            options={CYCLE_LENGTHS.map(toOption)}
            selected={String(settings.averageCycleLength)}
            onSelect={(value) => updateSettings({ averageCycleLength: Number(value) })}
          />
        </SettingRow>
        <SettingRow title={t.settings.avgPeriodLength}>
          <OptionChips
            options={PERIOD_LENGTHS.map(toOption)}
            selected={String(settings.averagePeriodLength)}
            onSelect={(value) => updateSettings({ averagePeriodLength: Number(value) })}
          />
        </SettingRow>
        <View style={styles.note}>
          <Icon name="info" size={20} color={colors.textMuted} strokeWidth={2} />
          <Text style={styles.noteText}>{t.settings.footnote}</Text>
        </View>
      </Card>
    </Screen>
  );
}

/** Label on the left and controls on the right on wide screens; stacked on phones. */
function SettingRow({
  title,
  hint,
  first,
  children,
}: {
  title: string;
  hint?: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  const { isMedium } = useLayout();
  return (
    <View style={[styles.row, isMedium && styles.rowWide, !first && styles.rowDivider]}>
      <View style={[styles.rowLabel, isMedium && styles.rowLabelWide]}>
        <Text style={typography.heading}>{title}</Text>
        {hint ? <Text style={typography.bodyMuted}>{hint}</Text> : null}
      </View>
      <View style={styles.rowControl}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.sm,
  },
  row: {
    paddingVertical: 20,
    gap: spacing.md,
  },
  rowWide: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  rowLabel: {
    gap: 4,
  },
  rowLabelWide: {
    width: 240,
  },
  rowControl: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  note: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    marginBottom: spacing.md,
  },
  noteText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSoft,
  },
});

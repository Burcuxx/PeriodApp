import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { OptionChips } from '../components/OptionChips';
import { useAppData } from '../context/AppContext';
import { LANGUAGE_NAMES, SUPPORTED_LANGUAGES, useI18n } from '../i18n';
import { LanguagePreference } from '../types';
import { colors, spacing, typography } from '../theme/theme';
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.title}>{t.settings.title}</Text>

        <Card style={styles.card}>
          <Text style={typography.heading}>{t.settings.language}</Text>
          <OptionChips
            options={languageOptions}
            selected={settings.language}
            onSelect={(value) => updateSettings({ language: value })}
          />
        </Card>

        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={typography.heading}>{t.settings.notifications}</Text>
              <Text style={typography.bodyMuted}>{t.settings.notificationsHint}</Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={settings.notificationsEnabled ? colors.primary : colors.surface}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={typography.heading}>{t.settings.avgCycleLength}</Text>
          <OptionChips
            options={CYCLE_LENGTHS.map(toOption)}
            selected={String(settings.averageCycleLength)}
            onSelect={(value) => updateSettings({ averageCycleLength: Number(value) })}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={typography.heading}>{t.settings.avgPeriodLength}</Text>
          <OptionChips
            options={PERIOD_LENGTHS.map(toOption)}
            selected={String(settings.averagePeriodLength)}
            onSelect={(value) => updateSettings({ averagePeriodLength: Number(value) })}
          />
        </Card>

        <Text style={[typography.caption, styles.footnote]}>
          {t.settings.footnote}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  card: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
  },
  footnote: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

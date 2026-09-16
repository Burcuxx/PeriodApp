import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { OptionChips } from '../components/OptionChips';
import { useAppData } from '../context/AppContext';
import { colors, spacing, typography } from '../theme/theme';
import { requestNotificationPermissions } from '../utils/notifications';

const CYCLE_LENGTH_OPTIONS = [21, 24, 26, 28, 30, 32, 35].map((n) => ({
  value: String(n),
  label: `${n} gün`,
}));

const PERIOD_LENGTH_OPTIONS = [2, 3, 4, 5, 6, 7, 8].map((n) => ({
  value: String(n),
  label: `${n} gün`,
}));

export function SettingsScreen() {
  const { settings, updateSettings } = useAppData();

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
        <Text style={typography.title}>Ayarlar</Text>

        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={typography.heading}>Bildirimler</Text>
              <Text style={typography.bodyMuted}>
                Yaklaşan adet ve yumurtlama dönemi için hatırlatma al
              </Text>
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
          <Text style={typography.heading}>Ortalama döngü uzunluğu</Text>
          <OptionChips
            options={CYCLE_LENGTH_OPTIONS}
            selected={String(settings.averageCycleLength)}
            onSelect={(value) => updateSettings({ averageCycleLength: Number(value) })}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={typography.heading}>Ortalama adet süresi</Text>
          <OptionChips
            options={PERIOD_LENGTH_OPTIONS}
            selected={String(settings.averagePeriodLength)}
            onSelect={(value) => updateSettings({ averagePeriodLength: Number(value) })}
          />
        </Card>

        <Text style={[typography.caption, styles.footnote]}>
          Bu bilgiler, sen yeterli döngü geçmişi kaydedene kadar tahminlerde başlangıç noktası olarak
          kullanılır.
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

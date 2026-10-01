import React from 'react';
import { Modal, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useI18n } from '../i18n';
import { colors, spacing } from '../theme/theme';
import { Button } from './Button';
import { DayLogForm } from './DayLogForm';

interface DayDetailModalProps {
  date: string | null;
  onClose: () => void;
}

/** Full-screen day log used on phones; wider layouts show DayLogForm inline. */
export function DayDetailModal({ date, onClose }: DayDetailModalProps) {
  const { t } = useI18n();
  if (!date) return null;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose} transparent={false}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <DayLogForm
            date={date}
            onSaved={onClose}
            footer={<Button label={t.common.close} variant="outline" onPress={onClose} />}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});

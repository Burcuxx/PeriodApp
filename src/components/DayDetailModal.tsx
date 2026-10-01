import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppData } from '../context/AppContext';
import { colors, radius, spacing, typography } from '../theme/theme';
import { useI18n } from '../i18n';
import { CrampSeverity, FlowIntensity, MoodType } from '../types';
import { Button } from './Button';
import { OptionChips } from './OptionChips';

const MOODS: MoodType[] = ['happy', 'calm', 'energetic', 'sad', 'irritable', 'anxious'];
const FLOWS: FlowIntensity[] = ['light', 'medium', 'heavy'];

interface DayDetailModalProps {
  date: string | null;
  onClose: () => void;
}

export function DayDetailModal({ date, onClose }: DayDetailModalProps) {
  const { periodDays, symptoms, togglePeriodDay, upsertSymptomLog } = useAppData();
  const { t, formatDate } = useI18n();
  const [mood, setMood] = useState<MoodType | undefined>(undefined);
  const [flow, setFlow] = useState<FlowIntensity | undefined>(undefined);
  const [cramp, setCramp] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!date) return;
    const existing = symptoms[date];
    setMood(existing?.mood);
    setFlow(existing?.flow);
    setCramp(existing?.crampSeverity !== undefined ? String(existing.crampSeverity) : undefined);
    setNotes(existing?.notes ?? '');
  }, [date, symptoms]);

  if (!date) return null;

  const isPeriodDay = periodDays.includes(date);
  const moodOptions = MOODS.map((value) => ({ value, label: t.dayDetail.moods[value] }));
  const flowOptions = FLOWS.map((value) => ({ value, label: t.dayDetail.flowLevels[value] }));
  const crampOptions = t.dayDetail.crampLevels.map((label, i) => ({ value: String(i), label }));

  const handleSave = async () => {
    await upsertSymptomLog(date, {
      mood,
      flow,
      crampSeverity: cramp !== undefined ? (Number(cramp) as CrampSeverity) : undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose} transparent={false}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={typography.title}>{formatDate(date)}</Text>

          <View style={styles.section}>
            <Button
              label={isPeriodDay ? t.dayDetail.markedAsPeriod : t.dayDetail.markAsPeriod}
              variant={isPeriodDay ? 'primary' : 'outline'}
              onPress={() => togglePeriodDay(date)}
            />
          </View>

          <View style={styles.section}>
            <Text style={typography.heading}>{t.dayDetail.mood}</Text>
            <OptionChips options={moodOptions} selected={mood} onSelect={setMood} />
          </View>

          <View style={styles.section}>
            <Text style={typography.heading}>{t.dayDetail.flow}</Text>
            <OptionChips options={flowOptions} selected={flow} onSelect={setFlow} />
          </View>

          <View style={styles.section}>
            <Text style={typography.heading}>{t.dayDetail.cramps}</Text>
            <OptionChips options={crampOptions} selected={cramp} onSelect={setCramp} />
          </View>

          <View style={styles.section}>
            <Text style={typography.heading}>{t.dayDetail.notes}</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder={t.dayDetail.notesPlaceholder}
              placeholderTextColor={colors.textMuted}
              style={styles.notesInput}
              multiline
            />
          </View>

          <View style={styles.actions}>
            <Button label={t.common.save} onPress={handleSave} style={styles.actionButton} />
            <Button label={t.common.close} variant="outline" onPress={onClose} style={styles.actionButton} />
          </View>
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
    padding: spacing.lg,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  notesInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
    color: colors.text,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    width: '100%',
  },
});

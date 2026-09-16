import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppData } from '../context/AppContext';
import { colors, radius, spacing, typography } from '../theme/theme';
import { formatDisplayDate } from '../utils/date';
import { CrampSeverity, FlowIntensity, MoodType } from '../types';
import { Button } from './Button';
import { OptionChips } from './OptionChips';

const MOOD_OPTIONS: { value: MoodType; label: string }[] = [
  { value: 'happy', label: '😊 Mutlu' },
  { value: 'calm', label: '😌 Sakin' },
  { value: 'energetic', label: '⚡ Enerjik' },
  { value: 'sad', label: '😢 Üzgün' },
  { value: 'irritable', label: '😠 Sinirli' },
  { value: 'anxious', label: '😰 Kaygılı' },
];

const FLOW_OPTIONS: { value: FlowIntensity; label: string }[] = [
  { value: 'light', label: 'Hafif' },
  { value: 'medium', label: 'Orta' },
  { value: 'heavy', label: 'Yoğun' },
];

const CRAMP_OPTIONS: { value: string; label: string }[] = [
  { value: '0', label: 'Yok' },
  { value: '1', label: 'Hafif' },
  { value: '2', label: 'Orta' },
  { value: '3', label: 'Şiddetli' },
];

interface DayDetailModalProps {
  date: string | null;
  onClose: () => void;
}

export function DayDetailModal({ date, onClose }: DayDetailModalProps) {
  const { periodDays, symptoms, togglePeriodDay, upsertSymptomLog } = useAppData();
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
          <Text style={typography.title}>{formatDisplayDate(date)}</Text>

          <View style={styles.section}>
            <Button
              label={isPeriodDay ? 'Adet günü olarak işaretlendi ✕' : 'Adet günü olarak işaretle'}
              variant={isPeriodDay ? 'primary' : 'outline'}
              onPress={() => togglePeriodDay(date)}
            />
          </View>

          <View style={styles.section}>
            <Text style={typography.heading}>Ruh hali</Text>
            <OptionChips options={MOOD_OPTIONS} selected={mood} onSelect={setMood} />
          </View>

          <View style={styles.section}>
            <Text style={typography.heading}>Akış yoğunluğu</Text>
            <OptionChips options={FLOW_OPTIONS} selected={flow} onSelect={setFlow} />
          </View>

          <View style={styles.section}>
            <Text style={typography.heading}>Kramp şiddeti</Text>
            <OptionChips options={CRAMP_OPTIONS} selected={cramp} onSelect={setCramp} />
          </View>

          <View style={styles.section}>
            <Text style={typography.heading}>Notlar</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Bugün nasıl hissettiğini yaz..."
              placeholderTextColor={colors.textMuted}
              style={styles.notesInput}
              multiline
            />
          </View>

          <View style={styles.actions}>
            <Button label="Kaydet" onPress={handleSave} style={styles.actionButton} />
            <Button label="Kapat" variant="outline" onPress={onClose} style={styles.actionButton} />
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

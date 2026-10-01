import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts } from '../theme/theme';

interface CycleRingProps {
  size: number;
  cycleLength: number;
  /** 1-based day of the current cycle; clamped to the cycle length. */
  currentDay: number | null;
  periodLength: number;
  fertileStart: number;
  fertileLength: number;
  ovulationIndex: number;
  label: string;
  value: string;
  caption: string;
}

export function CycleRing({
  size,
  cycleLength,
  currentDay,
  periodLength,
  fertileStart,
  fertileLength,
  ovulationIndex,
  label,
  value,
  caption,
}: CycleRingProps) {
  const stroke = size * 0.08;
  const center = size / 2;
  const r = center - stroke / 2 - 6;
  const circumference = 2 * Math.PI * r;
  const perDay = circumference / Math.max(cycleLength, 1);
  const day = currentDay === null ? 0 : Math.min(Math.max(currentDay, 0), cycleLength);

  const pointAt = (dayOffset: number) => {
    const angle = (dayOffset / cycleLength) * 2 * Math.PI - Math.PI / 2;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };
  const ovulation = pointAt(ovulationIndex + 0.5);
  const today = pointAt(day);

  const arc = (start: number, length: number, color: string) => (
    <Circle
      cx={center}
      cy={center}
      r={r}
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeDasharray={`${Math.max(length, 0) * perDay} ${circumference}`}
      strokeDashoffset={-start * perDay}
      transform={`rotate(-90 ${center} ${center})`}
    />
  );

  const scale = size / 280;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={center} cy={center} r={r} fill="none" stroke={colors.ringTrack} strokeWidth={stroke} />
        {arc(0, day, colors.ringElapsed)}
        {arc(0, periodLength, colors.periodDay)}
        {arc(fertileStart, fertileLength, colors.fertileRing)}
        <Circle cx={ovulation.x} cy={ovulation.y} r={stroke * 0.36} fill={colors.ovulation} stroke={colors.white} strokeWidth={3} />
        {currentDay !== null && (
          <Circle cx={today.x} cy={today.y} r={stroke * 0.6} fill={colors.ink} stroke={colors.white} strokeWidth={4} />
        )}
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={[styles.label, { fontSize: Math.max(11, 13 * scale) }]}>{label}</Text>
        <Text style={[styles.value, { fontSize: 72 * scale, lineHeight: 76 * scale }]}>{value}</Text>
        <Text style={[styles.caption, { fontSize: Math.max(12, 16 * scale) }]}>{caption}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  value: {
    fontFamily: fonts.display,
    letterSpacing: -2,
    color: colors.text,
  },
  caption: {
    fontFamily: fonts.semibold,
    color: colors.text,
  },
});

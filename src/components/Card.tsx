import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, useLayout } from '../theme/theme';

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { isMedium } = useLayout();
  return <View style={[styles.card, isMedium && styles.cardLarge, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  cardLarge: {
    borderRadius: radius.xl,
    padding: spacing.xl - 4,
  },
});

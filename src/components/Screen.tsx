import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, useLayout } from '../theme/theme';

interface ScreenProps {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
  maxWidth?: number;
  children: React.ReactNode;
}

/** Scrollable page with a responsive gutter, a capped content width and a large title. */
export function Screen({ eyebrow, title, action, maxWidth = 1320, children }: ScreenProps) {
  const { gutter, isMedium } = useLayout();
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: gutter, paddingTop: isMedium ? 36 : spacing.lg },
        ]}
      >
        <View style={[styles.inner, { maxWidth }]}>
          <View style={styles.header}>
            <View style={styles.titles}>
              {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
              <Text accessibilityRole="header" style={[typography.display, !isMedium && styles.titleSmall]}>
                {title}
              </Text>
            </View>
            {action}
          </View>
          {children}
        </View>
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
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  titles: {
    gap: 6,
    flexShrink: 1,
  },
  eyebrow: {
    ...typography.caption,
    fontSize: 15,
  },
  titleSmall: {
    fontSize: 32,
    lineHeight: 36,
  },
});

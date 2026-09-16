import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { colors, radius, spacing, typography } from '../theme/theme';

interface CycleBarChartProps {
  values: number[]; // cycle lengths in days, oldest to newest
  average: number;
}

const CHART_HEIGHT = 160;
const BAR_WIDTH = 28;
const BAR_GAP = 16;

export function CycleBarChart({ values, average }: CycleBarChartProps) {
  if (values.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={typography.bodyMuted}>
          Henüz yeterli veri yok. Birden fazla döngü kaydettiğinde burada geçmişini göreceksin.
        </Text>
      </View>
    );
  }

  const maxValue = Math.max(...values, average, 1);
  const chartWidth = values.length * (BAR_WIDTH + BAR_GAP) + BAR_GAP;

  return (
    <View>
      <Svg width={chartWidth} height={CHART_HEIGHT + 24}>
        {values.map((value, index) => {
          const barHeight = (value / maxValue) * CHART_HEIGHT;
          const x = BAR_GAP + index * (BAR_WIDTH + BAR_GAP);
          const y = CHART_HEIGHT - barHeight;
          return (
            <React.Fragment key={index}>
              <Rect
                x={x}
                y={y}
                width={BAR_WIDTH}
                height={barHeight}
                rx={8}
                fill={colors.primary}
                opacity={index === values.length - 1 ? 1 : 0.55}
              />
              <SvgText
                x={x + BAR_WIDTH / 2}
                y={CHART_HEIGHT + 18}
                fontSize={12}
                fill={colors.textMuted}
                textAnchor="middle"
              >
                {value}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    padding: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
  },
});

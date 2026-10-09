import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  I18nManager,
  LayoutChangeEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector, PointerType } from 'react-native-gesture-handler';
import { Engine, EngineType, PointerSampleType, defaultEngineOptions } from '../../vendor/embla';
import { colors, radius, spacing } from '../../theme/theme';
import { MAX_ROWS, MIN_ROWS, chunkColumns, clampRows } from './chunkColumns';

export type GridSliderProps<T> = {
  data: readonly T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  /** Rows per column, 1–4. Items fill each column top to bottom. */
  rows?: number;
  /** How many columns are visible in the viewport at once. */
  columnsPerView?: number;
  gap?: number;
  showDots?: boolean;
  onSlideChange?: (index: number) => void;
  itemAccessibilityLabel?: (item: T, index: number) => string;
  pageAccessibilityLabel?: (page: number, total: number) => string;
  style?: StyleProp<ViewStyle>;
};

const DRAG_THRESHOLD = 10;

function sample(point: number, cross: number): PointerSampleType {
  return { point, cross, time: Date.now() };
}

export function GridSlider<T>({
  data,
  renderItem,
  keyExtractor,
  rows = 2,
  columnsPerView = 2,
  gap = spacing.sm,
  showDots = true,
  onSlideChange,
  itemAccessibilityLabel,
  pageAccessibilityLabel,
  style,
}: GridSliderProps<T>) {
  if (__DEV__ && (rows < MIN_ROWS || rows > MAX_ROWS || !Number.isInteger(rows))) {
    console.warn(`GridSlider: rows must be an integer between ${MIN_ROWS} and ${MAX_ROWS}, got ${rows}.`);
  }
  const rowCount = clampRows(rows);
  const visibleColumns = Math.max(1, Math.floor(columnsPerView));
  const columns = useMemo(() => chunkColumns(data, rowCount), [data, rowCount]);

  const [viewSize, setViewSize] = useState(0);
  const [selected, setSelected] = useState(0);
  const [snapCount, setSnapCount] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const engineRef = useRef<EngineType | null>(null);
  const selectedRef = useRef(0);
  const onSlideChangeRef = useRef(onSlideChange);
  onSlideChangeRef.current = onSlideChange;

  const columnWidth = viewSize > 0 ? (viewSize - gap * (visibleColumns - 1)) / visibleColumns : 0;
  const contentWidth = columns.length * columnWidth + Math.max(0, columns.length - 1) * gap;

  useEffect(() => {
    if (!viewSize || !columns.length) {
      engineRef.current = null;
      setSnapCount(0);
      return;
    }
    const engine = Engine(
      { viewSize, slideSize: columnWidth, slideGap: gap, slideCount: columns.length },
      {
        ...defaultEngineOptions,
        direction: I18nManager.isRTL ? 'rtl' : 'ltr',
        startIndex: selectedRef.current,
      },
      (n) => translateX.setValue(n),
    );
    const syncSelected = () => {
      const index = engine.index.get();
      if (index === selectedRef.current) return;
      selectedRef.current = index;
      setSelected(index);
      onSlideChangeRef.current?.(index);
    };
    engine.eventHandler.on('select', syncSelected);
    engineRef.current = engine;
    setSnapCount(engine.scrollSnaps.length);
    syncSelected();
    return () => {
      engine.destroy();
      if (engineRef.current === engine) engineRef.current = null;
    };
  }, [viewSize, columnWidth, gap, columns.length, translateX]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .activeOffsetX([-DRAG_THRESHOLD, DRAG_THRESHOLD])
        .failOffsetY([-DRAG_THRESHOLD, DRAG_THRESHOLD])
        .onBegin((e) => {
          engineRef.current?.dragHandler.down(
            sample(e.absoluteX, e.absoluteY),
            e.pointerType === PointerType.MOUSE,
          );
        })
        .onUpdate((e) => {
          engineRef.current?.dragHandler.move(sample(e.absoluteX, e.absoluteY));
        })
        .onFinalize((e) => {
          engineRef.current?.dragHandler.up(sample(e.absoluteX, e.absoluteY));
        }),
    [],
  );

  const scrollTo = useCallback((index: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.scrollBody.useBaseFriction().useBaseDuration();
    engine.scrollTo.index(index, 0);
  }, []);

  const onLayout = (e: LayoutChangeEvent) => {
    const width = Math.round(e.nativeEvent.layout.width);
    if (width !== viewSize) setViewSize(width);
  };

  return (
    <View style={style}>
      <GestureDetector gesture={pan}>
        <View style={styles.viewport} onLayout={onLayout}>
          {viewSize > 0 && (
            <Animated.View
              style={[styles.track, { width: contentWidth, transform: [{ translateX }] }]}
            >
              {columns.map((column, columnIndex) => (
                <View
                  key={columnIndex}
                  style={[
                    styles.column,
                    { width: columnWidth, gap },
                    columnIndex < columns.length - 1 && { marginEnd: gap },
                  ]}
                >
                  {column.map((item, rowIndex) => {
                    const index = columnIndex * rowCount + rowIndex;
                    if (item === null) {
                      return (
                        <View
                          key={`empty-${rowIndex}`}
                          style={styles.cell}
                          accessibilityElementsHidden
                          importantForAccessibility="no-hide-descendants"
                        />
                      );
                    }
                    return (
                      <View
                        key={keyExtractor ? keyExtractor(item, index) : String(index)}
                        style={styles.cell}
                        accessible={!!itemAccessibilityLabel}
                        accessibilityRole={itemAccessibilityLabel ? 'text' : undefined}
                        accessibilityLabel={itemAccessibilityLabel?.(item, index)}
                      >
                        {renderItem(item, index)}
                      </View>
                    );
                  })}
                </View>
              ))}
            </Animated.View>
          )}
        </View>
      </GestureDetector>

      {showDots && snapCount > 1 && (
        <View style={styles.dots}>
          {Array.from({ length: snapCount }, (_, i) => (
            <Pressable
              key={i}
              onPress={() => scrollTo(i)}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityState={{ selected: i === selected }}
              accessibilityLabel={pageAccessibilityLabel?.(i + 1, snapCount) ?? `${i + 1} / ${snapCount}`}
              style={[styles.dot, i === selected && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    overflow: 'hidden',
  },
  track: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  column: {
    flexDirection: 'column',
  },
  cell: {
    flex: 1,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary,
  },
});

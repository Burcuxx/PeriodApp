export const MIN_ROWS = 1;
export const MAX_ROWS = 4;

export type GridRows = 1 | 2 | 3 | 4;

export function clampRows(rows: number): GridRows {
  if (!Number.isFinite(rows)) return MIN_ROWS;
  return Math.min(MAX_ROWS, Math.max(MIN_ROWS, Math.floor(rows))) as GridRows;
}

/**
 * Splits items into columns, filling each column top to bottom before moving
 * to the next one (column-based order). With rows = 3:
 *
 *   0  3  6  9
 *   1  4  7  10
 *   2  5  8  11
 *
 * The last column is padded with `null` so every column has `rows` cells.
 */
export function chunkColumns<T>(items: readonly T[], rows: number): (T | null)[][] {
  const size = clampRows(rows);
  const columns: (T | null)[][] = [];
  for (let i = 0; i < items.length; i += size) {
    const column: (T | null)[] = items.slice(i, i + size);
    while (column.length < size) column.push(null);
    columns.push(column);
  }
  return columns;
}

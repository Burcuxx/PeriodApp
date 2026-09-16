import { CyclePrediction, PeriodGroup, UserSettings } from '../types';
import { addDaysISO, diffInDays, todayISO } from './date';

const DEFAULT_LUTEAL_PHASE_LENGTH = 14; // days between ovulation and next period
const MAX_CYCLES_FOR_AVERAGE = 6;

/** Groups individually-marked period days into contiguous periods. */
export function groupPeriodDays(periodDays: string[]): PeriodGroup[] {
  if (periodDays.length === 0) return [];

  const sorted = [...new Set(periodDays)].sort();
  const groups: PeriodGroup[] = [];

  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i <= sorted.length; i++) {
    const current = sorted[i];
    if (current && diffInDays(prev, current) === 1) {
      prev = current;
      continue;
    }
    groups.push({ startDate: start, endDate: prev, length: diffInDays(start, prev) + 1 });
    if (current) {
      start = current;
      prev = current;
    }
  }

  return groups;
}

export function calculateAverageCycleLength(
  groups: PeriodGroup[],
  fallback: number
): number {
  if (groups.length < 2) return fallback;

  const recent = groups.slice(-MAX_CYCLES_FOR_AVERAGE);
  const gaps: number[] = [];
  for (let i = 1; i < recent.length; i++) {
    gaps.push(diffInDays(recent[i - 1].startDate, recent[i].startDate));
  }
  if (gaps.length === 0) return fallback;

  const average = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
  return Math.round(average);
}

export function calculateAveragePeriodLength(
  groups: PeriodGroup[],
  fallback: number
): number {
  if (groups.length === 0) return fallback;
  const recent = groups.slice(-MAX_CYCLES_FOR_AVERAGE);
  const average = recent.reduce((sum, g) => sum + g.length, 0) / recent.length;
  return Math.round(average);
}

export function predictCycle(periodDays: string[], settings: UserSettings): CyclePrediction {
  const groups = groupPeriodDays(periodDays);
  const averageCycleLength = calculateAverageCycleLength(groups, settings.averageCycleLength);
  const averagePeriodLength = calculateAveragePeriodLength(groups, settings.averagePeriodLength);

  const lastGroup = groups[groups.length - 1] ?? null;
  const lastPeriodStart = lastGroup?.startDate ?? null;

  if (!lastPeriodStart) {
    return {
      averageCycleLength,
      averagePeriodLength,
      lastPeriodStart: null,
      nextPeriodStart: null,
      nextPeriodEnd: null,
      ovulationDate: null,
      fertileWindowStart: null,
      fertileWindowEnd: null,
      currentCycleDay: null,
    };
  }

  const nextPeriodStart = addDaysISO(lastPeriodStart, averageCycleLength);
  const nextPeriodEnd = addDaysISO(nextPeriodStart, averagePeriodLength - 1);
  const ovulationDate = addDaysISO(nextPeriodStart, -DEFAULT_LUTEAL_PHASE_LENGTH);
  const fertileWindowStart = addDaysISO(ovulationDate, -5);
  const fertileWindowEnd = addDaysISO(ovulationDate, 1);
  const currentCycleDay = diffInDays(lastPeriodStart, todayISO()) + 1;

  return {
    averageCycleLength,
    averagePeriodLength,
    lastPeriodStart,
    nextPeriodStart,
    nextPeriodEnd,
    ovulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    currentCycleDay: currentCycleDay > 0 ? currentCycleDay : null,
  };
}

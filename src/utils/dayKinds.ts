import { CyclePrediction } from '../types';
import { addDaysISO, diffInDays } from './date';

export type DayKind = 'period' | 'predicted' | 'fertile' | 'ovulation';

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

function addRange(kinds: Record<string, DayKind>, start: string, end: string, kind: DayKind): void {
  for (let cursor = start; cursor <= end; cursor = addDaysISO(cursor, 1)) {
    kinds[cursor] = kind;
  }
}

/** Maps each marked ISO date to how the calendar should paint it. Logged period days win over predictions. */
export function buildDayKinds(periodDays: string[], prediction: CyclePrediction): Record<string, DayKind> {
  const kinds: Record<string, DayKind> = {};
  if (prediction.fertileWindowStart && prediction.fertileWindowEnd) {
    addRange(kinds, prediction.fertileWindowStart, prediction.fertileWindowEnd, 'fertile');
  }
  if (prediction.ovulationDate) {
    kinds[prediction.ovulationDate] = 'ovulation';
  }
  if (prediction.nextPeriodStart && prediction.nextPeriodEnd) {
    addRange(kinds, prediction.nextPeriodStart, prediction.nextPeriodEnd, 'predicted');
  }
  periodDays.forEach((day) => {
    kinds[day] = 'period';
  });
  return kinds;
}

export function getCyclePhase(
  date: string,
  periodDays: string[],
  prediction: CyclePrediction
): CyclePhase | null {
  if (periodDays.includes(date)) return 'menstrual';
  if (!prediction.ovulationDate || !prediction.lastPeriodStart || date < prediction.lastPeriodStart) return null;
  if (date === prediction.ovulationDate) return 'ovulation';
  return date < prediction.ovulationDate ? 'follicular' : 'luteal';
}

/** Day offsets (0-based, from the last period start) that the cycle ring draws. */
export function getRingSegments(prediction: CyclePrediction) {
  const { lastPeriodStart, fertileWindowStart, fertileWindowEnd, ovulationDate } = prediction;
  if (!lastPeriodStart || !fertileWindowStart || !fertileWindowEnd || !ovulationDate) return null;
  return {
    cycleLength: prediction.averageCycleLength,
    periodLength: prediction.averagePeriodLength,
    fertileStart: diffInDays(lastPeriodStart, fertileWindowStart),
    fertileLength: diffInDays(fertileWindowStart, fertileWindowEnd) + 1,
    ovulationIndex: diffInDays(lastPeriodStart, ovulationDate),
  };
}

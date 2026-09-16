import { MarkedDates } from 'react-native-calendars/src/types';
import { CyclePrediction } from '../types';
import { colors } from '../theme/theme';
import { addDaysISO } from './date';
import { groupPeriodDays } from './cyclePredictor';

function addRangeToMarks(marks: MarkedDates, start: string, end: string, color: string): void {
  let cursor = start;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const entry: any = marks[cursor] ?? { periods: [] };
    entry.periods.push({
      startingDay: cursor === start,
      endingDay: cursor === end,
      color,
    });
    marks[cursor] = entry;
    if (cursor === end) break;
    cursor = addDaysISO(cursor, 1);
  }
}

export function buildMarkedDates(periodDays: string[], prediction: CyclePrediction): MarkedDates {
  const marks: MarkedDates = {};

  if (prediction.fertileWindowStart && prediction.fertileWindowEnd) {
    addRangeToMarks(marks, prediction.fertileWindowStart, prediction.fertileWindowEnd, colors.fertileWindow);
  }

  if (prediction.nextPeriodStart && prediction.nextPeriodEnd) {
    addRangeToMarks(marks, prediction.nextPeriodStart, prediction.nextPeriodEnd, colors.predictedPeriod);
  }

  if (prediction.ovulationDate) {
    addRangeToMarks(marks, prediction.ovulationDate, prediction.ovulationDate, colors.ovulation);
  }

  const groups = groupPeriodDays(periodDays);
  groups.forEach((group) => addRangeToMarks(marks, group.startDate, group.endDate, colors.periodDay));

  return marks;
}

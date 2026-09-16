// All dates in this app are represented as ISO "YYYY-MM-DD" strings and
// manipulated at local noon to avoid timezone rollovers when converting
// to/from Date objects.

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDaysISO(iso: string, days: number): string {
  const date = fromISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function diffInDays(isoA: string, isoB: string): number {
  const a = fromISODate(isoA).getTime();
  const b = fromISODate(isoB).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export function isBeforeISO(isoA: string, isoB: string): boolean {
  return isoA < isoB;
}

export function formatDisplayDate(iso: string, locale = 'tr-TR'): string {
  return fromISODate(iso).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

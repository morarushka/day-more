import type { Moment } from '../types';

export interface MonthGroup {
  key: string;
  label: string;
  moments: Moment[];
}

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

export function groupMomentsByMonth(moments: Moment[]): MonthGroup[] {
  const groups = new Map<string, Moment[]>();
  for (const m of moments) {
    const d = new Date(m.completedAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  }

  return Array.from(groups.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([key, list]) => {
      const [year, month] = key.split('-').map(Number);
      return {
        key,
        label: `${MONTH_NAMES[month]} ${year}`,
        moments: list.sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1)),
      };
    });
}

function pluralMoments(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'момент';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'момента';
  return 'моментов';
}

function pluralPlaces(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'новое место';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'новых места';
  return 'новых мест';
}

function pluralShared(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'момент вместе';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'момента вместе';
  return 'моментов вместе';
}

function pluralNew(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'новое';
  return 'новых';
}

export function monthStatsLine(moments: Moment[]): string {
  const newPlaces = moments.filter((m) => m.tagsSnapshot.location === 'out').length;
  const together = moments.filter((m) => m.tagsSnapshot.socialLevel >= 3).length;
  const firstTimes = moments.filter((m) => m.tagsSnapshot.noveltyScore >= 4).length;
  const parts = [`${moments.length} ${pluralMoments(moments.length)}`];
  if (newPlaces > 0) parts.push(`${newPlaces} ${pluralPlaces(newPlaces)}`);
  if (together > 0) parts.push(`${together} ${pluralShared(together)}`);
  if (firstTimes > 0) parts.push(`${firstTimes} ${pluralNew(firstTimes)} попробовано`);
  return parts.join(' · ');
}

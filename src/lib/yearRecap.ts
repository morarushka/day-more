import type { Moment } from '../types';

export interface YearRecap {
  year: number;
  total: number;
  monthsActive: number;
  loved: number;
  newPlaces: number;
  together: number;
  firstTimes: number;
  withPhoto: number;
  topCategory: string | null;
}

export function getAvailableYears(moments: Moment[]): number[] {
  const years = new Set(moments.map((m) => new Date(m.completedAt).getFullYear()));
  return Array.from(years).sort((a, b) => b - a);
}

export function buildYearRecap(moments: Moment[], year: number): YearRecap {
  const yearMoments = moments.filter((m) => new Date(m.completedAt).getFullYear() === year);

  const monthsActive = new Set(yearMoments.map((m) => new Date(m.completedAt).getMonth())).size;
  const loved = yearMoments.filter((m) => m.rating === 'loved').length;
  const newPlaces = yearMoments.filter((m) => m.tagsSnapshot.location === 'out').length;
  const together = yearMoments.filter((m) => m.tagsSnapshot.socialLevel >= 3).length;
  const firstTimes = yearMoments.filter((m) => m.tagsSnapshot.noveltyScore >= 4).length;
  const withPhoto = yearMoments.filter((m) => m.photoRef).length;

  const categoryCounts = new Map<string, number>();
  for (const m of yearMoments) {
    for (const c of m.tagsSnapshot.categories) {
      categoryCounts.set(c, (categoryCounts.get(c) ?? 0) + 1);
    }
  }
  let topCategory: string | null = null;
  let topCount = 0;
  for (const [category, count] of categoryCounts) {
    if (count > topCount) {
      topCategory = category;
      topCount = count;
    }
  }

  return { year, total: yearMoments.length, monthsActive, loved, newPlaces, together, firstTimes, withPhoto, topCategory };
}

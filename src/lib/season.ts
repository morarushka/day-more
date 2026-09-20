import type { SeasonTag } from '../types';

/** Returns every season tag active for the given date. Ranges intentionally overlap
 * (e.g. Halloween sits inside Autumn) — a scenario can match more than one at once. */
export function getActiveSeasons(date: Date = new Date()): SeasonTag[] {
  const month = date.getMonth(); // 0-indexed
  const day = date.getDate();
  const active: SeasonTag[] = ['evergreen'];

  if (month >= 8 && month <= 10) active.push('autumn'); // Sep–Nov
  if (month === 9 && day >= 16) active.push('halloween'); // Oct 16–31
  if (month === 11 && day <= 25) active.push('christmas'); // Dec 1–25
  if ((month === 11 && day >= 26) || (month === 0 && day <= 6)) active.push('new-year'); // Dec 26–Jan 6
  if (month === 11 || month === 0 || month === 1) active.push('winter'); // Dec–Feb
  if (month === 1 && day >= 1 && day <= 14) active.push('valentines'); // Feb 1–14
  if (month >= 2 && month <= 4) active.push('spring'); // Mar–May
  if (month >= 5 && month <= 7) active.push('summer'); // Jun–Aug

  return active;
}

import type { BudgetLevel, CompanyTag, EnergyLevel, LocationTag, Mood, RejectionReason, TimeBudget } from '../types';

export const MOOD_OPTIONS: { value: Mood; label: string; emoji: string }[] = [
  { value: 'new', label: 'Что-то новое', emoji: '✨' },
  { value: 'cozy', label: 'Уют', emoji: '🫖' },
  { value: 'romance', label: 'Романтика', emoji: '❤️' },
  { value: 'creative', label: 'Творчество', emoji: '🎨' },
  { value: 'fun', label: 'Весело', emoji: '😂' },
  { value: 'adventure', label: 'Приключение', emoji: '🌆' },
  { value: 'nostalgia', label: 'Ностальгия', emoji: '🧸' },
];

export const TIME_OPTIONS: { value: TimeBudget; label: string }[] = [
  { value: '15m', label: '15 минут' },
  { value: '30-60m', label: '30–60 мин' },
  { value: '2-3h', label: '2–3 часа' },
  { value: 'evening', label: 'Весь вечер' },
  { value: 'half-day', label: 'Полдня' },
  { value: 'day', label: 'Весь день' },
];

export const COMPANY_OPTIONS: { value: CompanyTag; label: string }[] = [
  { value: 'just-me', label: 'Одна' },
  { value: 'together', label: 'Вдвоём' },
  { value: 'friends', label: 'С друзьями' },
  { value: 'family', label: 'С семьёй' },
  { value: 'with-dog', label: 'С собакой' },
];

export const LOCATION_OPTIONS: { value: LocationTag; label: string }[] = [
  { value: 'home', label: 'Дома' },
  { value: 'out', label: 'Можно выйти' },
  { value: 'either', label: 'Как получится' },
];

export const BUDGET_OPTIONS: { value: BudgetLevel; label: string }[] = [
  { value: 'free', label: 'Бесплатно' },
  { value: 'low', label: 'Немного' },
  { value: 'medium', label: 'Средне' },
  { value: 'any', label: 'Неважно' },
];

export const ENERGY_OPTIONS: { value: EnergyLevel; label: string }[] = [
  { value: 'very-low', label: 'Совсем нет сил' },
  { value: 'normal', label: 'Обычно' },
  { value: 'high', label: 'Хочется движения' },
];

export const REJECTION_REASON_OPTIONS: { value: RejectionReason; label: string }[] = [
  { value: 'not-enough-time', label: 'Не хватит времени' },
  { value: 'too-expensive', label: 'Слишком дорого' },
  { value: 'dont-want-to-go-out', label: 'Не хочу выходить' },
  { value: 'too-much-energy', label: 'Слишком энергозатратно' },
  { value: 'not-my-thing', label: 'Это не моё' },
  { value: 'already-done-similar', label: 'Уже похожее делала' },
];

export function formatDuration(min: number, max: number): string {
  if (max >= 300) {
    const hours = Math.round(min / 60);
    return `${hours}+ Ч`;
  }
  if (max <= 20) return 'ОКОЛО 15 МИН';
  const hMin = Math.round(min / 15) * 15 / 60;
  const hMax = Math.round(max / 15) * 15 / 60;
  if (hMax < 1) return `${min}–${max} МИН`;
  return `ОКОЛО ${hMin}–${hMax} Ч`;
}

export function formatBudget(level: BudgetLevel): string {
  if (level === 'any') return 'ЛЮБОЙ БЮДЖЕТ';
  if (level === 'free') return 'БЕСПЛАТНО';
  if (level === 'low') return 'НЕБОЛЬШОЙ БЮДЖЕТ';
  return 'СРЕДНИЙ БЮДЖЕТ';
}

export function formatLocation(location: LocationTag): string {
  if (location === 'home') return 'ДОМА';
  if (location === 'out') return 'НА УЛИЦЕ';
  return 'ДОМА ИЛИ НА УЛИЦЕ';
}

const COMPANY_TAG_LABEL: Record<string, string> = {
  'just-me': 'ОДНОЙ',
  together: 'ВДВОЁМ',
  friends: 'С ДРУЗЬЯМИ',
  family: 'С СЕМЬЁЙ',
  'with-dog': 'С СОБАКОЙ',
};

export function formatCompany(company: CompanyTag[]): string {
  if (company.includes('any')) return 'ЛЮБАЯ КОМПАНИЯ';
  return company.map((c) => COMPANY_TAG_LABEL[c] ?? c).join(' / ');
}

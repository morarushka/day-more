import type { Scenario } from '../types';

export interface CollectionDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tint: string;
}

export const COLLECTIONS: CollectionDef[] = [
  {
    id: 'feel-autumn',
    name: 'Почувствовать осень',
    emoji: '🍂',
    description: 'Маленькие способы заметить, как меняется сезон.',
    tint: '#e8c9a3',
  },
  {
    id: 'better-date-nights',
    name: 'Свидания получше',
    emoji: '❤️',
    description: 'Свидания, которые не сводятся к ужину и фильму.',
    tint: '#f0d3d1',
  },
  {
    id: 'better-than-scrolling',
    name: 'Вечера лучше, чем скроллинг',
    emoji: '🏠',
    description: 'Для вечеров, когда вы уже собирались просто лежать с телефоном.',
    tint: '#e9dcb8',
  },
  {
    id: 'zero-budget',
    name: 'Без бюджета',
    emoji: '💸',
    description: 'Ничего не стоит, кроме времени и немного смелости.',
    tint: '#cddac9',
  },
  {
    id: 'rainy-days',
    name: 'Дождливые дни',
    emoji: '🌧️',
    description: 'Хорошая погода, чтобы остаться дома осознанно.',
    tint: '#c9d6de',
  },
  {
    id: 'make-something',
    name: 'Сделать что-то своими руками',
    emoji: '🎨',
    description: 'В конце — маленькое доказательство, что ты что-то создала.',
    tint: '#ddd3e6',
  },
  {
    id: 'explore-your-city',
    name: 'Исследовать свой город',
    emoji: '🌆',
    description: 'Те части города, мимо которых ты вечно проходишь.',
    tint: '#f5ddb3',
  },
  {
    id: 'childhood-again',
    name: 'Снова десять лет',
    emoji: '🧸',
    description: 'Позаимствовано из детства.',
    tint: '#e3d2c3',
  },
];

export function scenariosInCollection(collectionId: string, scenarios: Scenario[]): Scenario[] {
  return scenarios.filter((s) => s.collectionIds.includes(collectionId));
}

export function collectionProgress(collectionId: string, scenarios: Scenario[], completedScenarioIds: Set<string>) {
  const members = scenariosInCollection(collectionId, scenarios);
  const completedCount = members.filter((s) => completedScenarioIds.has(s.id)).length;
  return { members, completedCount, total: members.length };
}

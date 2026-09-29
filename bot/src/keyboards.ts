import { Markup } from 'telegraf';
import {
  BUDGET_OPTIONS,
  COMPANY_OPTIONS,
  ENERGY_OPTIONS,
  LOCATION_OPTIONS,
  MOOD_OPTIONS,
  REJECTION_REASON_OPTIONS,
  TIME_OPTIONS,
} from '../../src/lib/options';
import { COLLECTIONS } from '../../src/lib/collections';

export const mainMenuKeyboard = Markup.keyboard([
  ['⚡ Прямо сейчас'],
  ['🎯 Подобрать сценарий', '🎲 Сюрприз'],
  ['📚 Коллекции', '📸 Мои моменты'],
  ['⚙️ Настройки'],
]).resize();

export const moodKeyboard = Markup.inlineKeyboard(
  MOOD_OPTIONS.map((m) => [Markup.button.callback(`${m.emoji} ${m.label}`, `mood:${m.value}`)]),
);

export const timeKeyboard = Markup.inlineKeyboard(
  TIME_OPTIONS.map((o) => [Markup.button.callback(o.label, `ctx:time:${o.value}`)]),
);

export const companyKeyboard = Markup.inlineKeyboard(
  COMPANY_OPTIONS.map((o) => [Markup.button.callback(o.label, `ctx:company:${o.value}`)]),
);

export const locationKeyboard = Markup.inlineKeyboard(
  LOCATION_OPTIONS.map((o) => [Markup.button.callback(o.label, `ctx:location:${o.value}`)]),
);

export const budgetKeyboard = Markup.inlineKeyboard(
  BUDGET_OPTIONS.map((o) => [Markup.button.callback(o.label, `ctx:budget:${o.value}`)]),
);

export const energyKeyboard = Markup.inlineKeyboard(
  ENERGY_OPTIONS.map((o) => [Markup.button.callback(o.label, `ctx:energy:${o.value}`)]),
);

export function resultKeyboard(saved: boolean) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('✅ Делаем это', 'result:accept')],
    [Markup.button.callback(saved ? '💾 Сохранено ✓' : '💾 Сохранить на потом', 'result:save')],
    [Markup.button.callback('🙅 Не сегодня', 'result:skip')],
  ]);
}

export const rejectionReasonKeyboard = Markup.inlineKeyboard([
  ...REJECTION_REASON_OPTIONS.map((r) => [Markup.button.callback(r.label, `reason:${r.value}`)]),
  [Markup.button.callback('Без причины, просто другой вариант', 'reason:none')],
]);

export const activeScenarioKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('✅ Отметить выполненным', 'active:done')],
  [Markup.button.callback('❌ Отменить', 'active:cancel')],
]);

export const ratingKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('❤️ Обожаю', 'rating:loved')],
  [Markup.button.callback('🙂 Неплохо', 'rating:nice')],
  [Markup.button.callback('😐 Не моё', 'rating:not-for-me')],
]);

export const skipKeyboard = (action: string) => Markup.inlineKeyboard([Markup.button.callback('Пропустить', action)]);

export const collectionsKeyboard = Markup.inlineKeyboard(
  COLLECTIONS.map((c) => [Markup.button.callback(`${c.emoji} ${c.name}`, `col:${c.id}`)]),
);

export function collectionDetailKeyboard(collectionId: string) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🎲 Выбрать за меня', `col-pick:${collectionId}`)],
    [Markup.button.callback('« Назад к коллекциям', 'col-back')],
  ]);
}

export const settingsKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('🔄 Сбросить данные', 'settings:reset')],
  [Markup.button.callback('ℹ️ Показать приветствие снова', 'settings:onboarding')],
]);

export const confirmResetKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('Да, стереть всё', 'settings:reset-confirm')],
  [Markup.button.callback('Отмена', 'settings:reset-cancel')],
]);

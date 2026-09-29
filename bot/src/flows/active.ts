import type { Telegraf } from 'telegraf';
import type { MomentRating } from '../../../src/types';
import { findScenario } from '../data';
import { clearActiveScenario, completeActiveScenario, loadState } from '../state';
import type { BotContext } from '../session';
import { mainMenuKeyboard, ratingKeyboard, skipKeyboard } from '../keyboards';

export function registerActiveFlow(bot: Telegraf<BotContext>) {
  bot.action('active:done', async (ctx) => {
    const userId = ctx.from!.id;
    const activeScenarioId = loadState(userId).activeScenarioId;
    await ctx.answerCbQuery();
    if (!activeScenarioId) {
      await ctx.reply('Сейчас нет активного плана.', mainMenuKeyboard);
      return;
    }
    ctx.session.complete = { scenarioId: activeScenarioId };
    await ctx.reply('Как всё прошло?', ratingKeyboard);
  });

  bot.action('active:cancel', async (ctx) => {
    clearActiveScenario(ctx.from!.id);
    await ctx.answerCbQuery('Отменено');
    await ctx.reply('Хорошо, план отменён.', mainMenuKeyboard);
  });

  bot.action(/^rating:(loved|nice|not-for-me)$/, async (ctx) => {
    const complete = ctx.session.complete;
    await ctx.answerCbQuery();
    if (!complete) return;
    complete.rating = ctx.match[1] as MomentRating;
    complete.awaiting = 'note';
    await ctx.reply('Хочешь добавить заметку? Напиши текст или пропусти.', skipKeyboard('note:skip'));
  });

  bot.action('note:skip', async (ctx) => {
    const complete = ctx.session.complete;
    await ctx.answerCbQuery();
    if (!complete) return;
    complete.note = null;
    complete.awaiting = 'photo';
    await ctx.reply('Добавишь фото? Пришли фото или пропусти.', skipKeyboard('photo:skip'));
  });

  bot.action('photo:skip', async (ctx) => {
    await ctx.answerCbQuery();
    await finishMoment(ctx, null);
  });

  bot.on('text', async (ctx, next) => {
    const complete = ctx.session.complete;
    if (!complete || complete.awaiting !== 'note') {
      return next();
    }
    complete.note = ctx.message.text;
    complete.awaiting = 'photo';
    await ctx.reply('Добавишь фото? Пришли фото или пропусти.', skipKeyboard('photo:skip'));
  });

  bot.on('photo', async (ctx, next) => {
    const complete = ctx.session.complete;
    if (!complete || complete.awaiting !== 'photo') {
      return next();
    }
    const sizes = ctx.message.photo;
    const fileId = sizes[sizes.length - 1].file_id;
    await finishMoment(ctx, fileId);
  });
}

async function finishMoment(ctx: BotContext, photoFileId: string | null) {
  const complete = ctx.session.complete;
  if (!complete || !complete.rating) return;

  const scenario = findScenario(complete.scenarioId);
  if (!scenario) {
    ctx.session.complete = undefined;
    await ctx.reply('Не удалось сохранить момент — сценарий не найден.', mainMenuKeyboard);
    return;
  }

  completeActiveScenario(ctx.from!.id, scenario, complete.rating, complete.note ?? null, photoFileId);
  ctx.session.complete = undefined;
  await ctx.reply('Сохранено ✨ Загляни в «Мои моменты», чтобы увидеть его снова.', mainMenuKeyboard);
}

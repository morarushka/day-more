import type { Telegraf } from 'telegraf';
import { resetUser, setOnboardingSeen } from '../state';
import type { BotContext } from '../session';
import { confirmResetKeyboard, mainMenuKeyboard, settingsKeyboard } from '../keyboards';
import { ONBOARDING_TEXT } from '../onboarding';

export function registerSettingsFlow(bot: Telegraf<BotContext>) {
  bot.hears('⚙️ Настройки', async (ctx) => {
    await ctx.reply('Настройки:', settingsKeyboard);
  });

  bot.action('settings:reset', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply('Точно стереть все события, моменты и сохранённое? Это необратимо.', confirmResetKeyboard);
  });

  bot.action('settings:reset-confirm', async (ctx) => {
    resetUser(ctx.from!.id);
    ctx.session.roll = undefined;
    ctx.session.result = undefined;
    ctx.session.complete = undefined;
    await ctx.answerCbQuery('Данные сброшены');
    await ctx.reply('Готово. Начинаем с чистого листа.', mainMenuKeyboard);
  });

  bot.action('settings:reset-cancel', async (ctx) => {
    await ctx.answerCbQuery('Отменено');
  });

  bot.action('settings:onboarding', async (ctx) => {
    await ctx.answerCbQuery();
    setOnboardingSeen(ctx.from!.id, true);
    await ctx.reply(ONBOARDING_TEXT, mainMenuKeyboard);
  });
}

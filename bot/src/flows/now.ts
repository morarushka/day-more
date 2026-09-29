import { Markup, type Telegraf } from 'telegraf';
import { TIME_OPTIONS } from '../../../src/lib/options';
import type { TimeBudget } from '../../../src/types';
import { loadState, updateContext } from '../state';
import type { BotContext } from '../session';
import { rollAndShow } from './roll';

const nowTimeKeyboard = Markup.inlineKeyboard(
  TIME_OPTIONS.map((o) => [Markup.button.callback(o.label, `now-time:${o.value}`)]),
);

export function registerNowFlow(bot: Telegraf<BotContext>) {
  bot.command('now', async (ctx) => {
    await ctx.reply('Сколько времени есть?', nowTimeKeyboard);
  });

  bot.hears('⚡ Прямо сейчас', async (ctx) => {
    await ctx.reply('Сколько времени есть?', nowTimeKeyboard);
  });

  bot.action(/^now-time:(.+)$/, async (ctx) => {
    const time = ctx.match[1] as TimeBudget;
    await ctx.answerCbQuery();

    const userId = ctx.from!.id;
    const context = { ...loadState(userId).context, time, updatedAt: new Date().toISOString() };
    updateContext(userId, context);

    await rollAndShow(ctx, { useContext: true });
  });
}

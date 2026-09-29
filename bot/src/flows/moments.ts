import type { Telegraf } from 'telegraf';
import { groupMomentsByMonth, monthStatsLine } from '../../../src/lib/moments';
import { loadState } from '../state';
import type { BotContext } from '../session';
import { formatMomentLine } from '../format';

const RECENT_LIMIT = 10;

export function registerMomentsFlow(bot: Telegraf<BotContext>) {
  bot.hears('📸 Мои моменты', async (ctx) => {
    const state = loadState(ctx.from!.id);
    if (state.moments.length === 0) {
      await ctx.reply('Пока нет сохранённых моментов. Заверши свой первый план, чтобы он появился здесь.');
      return;
    }

    const groups = groupMomentsByMonth(state.moments);
    const latest = groups[0];
    const recent = [...state.moments]
      .sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1))
      .slice(0, RECENT_LIMIT);

    const header = `<b>${latest.label}</b>\n${monthStatsLine(latest.moments)}\n`;
    const lines = recent.map(formatMomentLine);

    await ctx.replyWithHTML([header, ...lines].join('\n\n'));
  });
}

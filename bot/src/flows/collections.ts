import type { Telegraf } from 'telegraf';
import { COLLECTIONS, collectionProgress, scenariosInCollection } from '../../../src/lib/collections';
import { scenarios } from '../data';
import { loadState } from '../state';
import type { BotContext } from '../session';
import { collectionDetailKeyboard, collectionsKeyboard } from '../keyboards';
import { rollAndShow } from './roll';

export async function showCollectionDetail(ctx: BotContext, id: string): Promise<boolean> {
  const def = COLLECTIONS.find((c) => c.id === id);
  if (!def) return false;

  const completedIds = new Set(
    loadState(ctx.from!.id).events.filter((e) => e.kind === 'completed').map((e) => e.scenarioId),
  );
  const { total, completedCount } = collectionProgress(id, scenarios, completedIds);

  await ctx.reply(
    `${def.emoji} <b>${def.name}</b>\n${def.description}\n\nПройдено: ${completedCount} из ${total}`,
    { parse_mode: 'HTML', ...collectionDetailKeyboard(id) },
  );
  return true;
}

export function registerCollectionsFlow(bot: Telegraf<BotContext>) {
  bot.hears('📚 Коллекции', async (ctx) => {
    await ctx.reply('Выбери подборку:', collectionsKeyboard);
  });

  bot.action(/^col:(.+)$/, async (ctx) => {
    const id = ctx.match[1];
    await ctx.answerCbQuery();
    await showCollectionDetail(ctx, id);
  });

  bot.action('col-back', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply('Выбери подборку:', collectionsKeyboard);
  });

  bot.action(/^col-pick:(.+)$/, async (ctx) => {
    const id = ctx.match[1];
    await ctx.answerCbQuery();
    const pool = scenariosInCollection(id, scenarios);
    await rollAndShow(ctx, { pool, useContext: false });
  });
}

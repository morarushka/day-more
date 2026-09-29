import 'dotenv/config';
import { Telegraf } from 'telegraf';
import type { BotContext } from './session';
import { sessionMiddleware } from './session';
import { loadState, setOnboardingSeen } from './state';
import { mainMenuKeyboard } from './keyboards';
import { ONBOARDING_TEXT } from './onboarding';
import { registerRollFlow } from './flows/roll';
import { registerActiveFlow } from './flows/active';
import { registerCollectionsFlow, showCollectionDetail } from './flows/collections';
import { registerMomentsFlow } from './flows/moments';
import { registerSettingsFlow } from './flows/settings';
import { registerNowFlow } from './flows/now';

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error('BOT_TOKEN is not set. Copy .env.example to .env and fill it in.');
}

const bot = new Telegraf<BotContext>(token);
bot.use(sessionMiddleware);

bot.start(async (ctx) => {
  const state = loadState(ctx.from.id);
  if (!state.onboardingSeen) {
    setOnboardingSeen(ctx.from.id, true);
    await ctx.reply(ONBOARDING_TEXT);
  }

  // Deep link, e.g. t.me/<bot>?start=<collectionId> from a shared collection in the web app.
  const payload = ctx.startPayload;
  if (payload && (await showCollectionDetail(ctx, payload))) {
    return;
  }

  await ctx.reply('Что сегодня делаем?', mainMenuKeyboard);
});

registerNowFlow(bot);
registerRollFlow(bot);
registerActiveFlow(bot);
registerCollectionsFlow(bot);
registerMomentsFlow(bot);
registerSettingsFlow(bot);

bot.catch((err, ctx) => {
  console.error(`Error while handling update ${ctx.updateType}:`, err);
});

bot.launch().then(() => console.log('Little Plans bot is running.'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

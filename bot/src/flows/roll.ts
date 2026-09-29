import type { Telegraf } from 'telegraf';
import type { Mood, Scenario, UserContextSelection } from '../../../src/types';
import { selectScenario } from '../../../src/lib/selectScenario';
import { scenarios } from '../data';
import { acceptScenario, loadState, rejectScenario, toggleSaved, updateContext, viewScenario } from '../state';
import type { BotContext } from '../session';
import { formatScenarioCard } from '../format';
import {
  activeScenarioKeyboard,
  budgetKeyboard,
  companyKeyboard,
  energyKeyboard,
  locationKeyboard,
  mainMenuKeyboard,
  moodKeyboard,
  rejectionReasonKeyboard,
  resultKeyboard,
  timeKeyboard,
} from '../keyboards';

const CONTEXT_STEPS = ['time', 'company', 'location', 'budget', 'energy'] as const;

function stepPrompt(step: (typeof CONTEXT_STEPS)[number]) {
  switch (step) {
    case 'time':
      return { text: 'Сколько времени есть?', keyboard: timeKeyboard };
    case 'company':
      return { text: 'С кем?', keyboard: companyKeyboard };
    case 'location':
      return { text: 'Дома или можно выйти?', keyboard: locationKeyboard };
    case 'budget':
      return { text: 'Какой бюджет?', keyboard: budgetKeyboard };
    case 'energy':
      return { text: 'Сколько сил есть?', keyboard: energyKeyboard };
  }
}

async function showScenario(
  ctx: BotContext,
  scenario: Scenario,
  pool: Scenario[] | undefined,
  mood: Mood | undefined,
  useContext: boolean,
) {
  const userId = ctx.from!.id;
  viewScenario(userId, scenario.id);

  ctx.session.result = {
    scenarioId: scenario.id,
    poolIds: pool?.map((s) => s.id),
    mood,
    useContext,
  };

  const saved = loadState(userId).savedScenarioIds.includes(scenario.id);
  await ctx.replyWithHTML(formatScenarioCard(scenario), resultKeyboard(saved));
}

async function rollAndShow(
  ctx: BotContext,
  opts: { mood?: Mood; pool?: Scenario[]; excludeId?: string; useContext: boolean },
) {
  const userId = ctx.from!.id;
  const state = loadState(userId);
  const scenario = selectScenario(scenarios, state.events, {
    mood: opts.mood,
    context: opts.useContext ? state.context : undefined,
    pool: opts.pool,
    excludeId: opts.excludeId,
  });

  if (!scenario) {
    await ctx.reply('Не нашлось подходящего сценария. Попробуй ещё раз.', mainMenuKeyboard);
    return;
  }

  await showScenario(ctx, scenario, opts.pool, opts.mood, opts.useContext);
}

export function registerRollFlow(bot: Telegraf<BotContext>) {
  bot.hears('🎯 Подобрать сценарий', async (ctx) => {
    ctx.session.roll = { useContext: true, draft: {} };
    await ctx.reply('Какое настроение сегодня?', moodKeyboard);
  });

  bot.hears('🎲 Сюрприз', async (ctx) => {
    await rollAndShow(ctx, { useContext: false });
  });

  bot.action(/^mood:(.+)$/, async (ctx) => {
    const mood = ctx.match[1] as Mood;
    ctx.session.roll = { mood, useContext: true, step: 'time', draft: {} };
    await ctx.answerCbQuery();
    const { text, keyboard } = stepPrompt('time');
    await ctx.reply(text, keyboard);
  });

  bot.action(/^ctx:(time|company|location|budget|energy):(.+)$/, async (ctx) => {
    const [, field, value] = ctx.match;
    const roll = ctx.session.roll;
    if (!roll) {
      await ctx.answerCbQuery();
      return;
    }
    (roll.draft as any)[field] = value;
    await ctx.answerCbQuery();

    const currentIndex = CONTEXT_STEPS.indexOf(field as any);
    const nextStep = CONTEXT_STEPS[currentIndex + 1];

    if (nextStep) {
      roll.step = nextStep;
      const { text, keyboard } = stepPrompt(nextStep);
      await ctx.reply(text, keyboard);
      return;
    }

    const context: UserContextSelection = {
      time: roll.draft.time!,
      company: roll.draft.company!,
      location: roll.draft.location!,
      budget: roll.draft.budget!,
      energy: roll.draft.energy!,
      updatedAt: new Date().toISOString(),
    };
    updateContext(ctx.from!.id, context);
    const mood = roll.mood;
    ctx.session.roll = undefined;
    await rollAndShow(ctx, { mood, useContext: true });
  });

  bot.action('result:accept', async (ctx) => {
    const result = ctx.session.result;
    if (!result) {
      await ctx.answerCbQuery();
      return;
    }
    acceptScenario(ctx.from!.id, result.scenarioId);
    await ctx.answerCbQuery('Отлично!');
    await ctx.reply('План принят. Когда сделаешь — отметь это здесь.', activeScenarioKeyboard);
  });

  bot.action('result:save', async (ctx) => {
    const result = ctx.session.result;
    if (!result) {
      await ctx.answerCbQuery();
      return;
    }
    const saved = toggleSaved(ctx.from!.id, result.scenarioId);
    await ctx.answerCbQuery(saved ? 'Сохранено' : 'Убрано из сохранённых');
    await ctx.editMessageReplyMarkup(resultKeyboard(saved).reply_markup);
  });

  bot.action('result:skip', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply('Что не подошло? (необязательно)', rejectionReasonKeyboard);
  });

  bot.action(/^reason:(.+)$/, async (ctx) => {
    const result = ctx.session.result;
    await ctx.answerCbQuery();
    if (!result) return;

    const raw = ctx.match[1];
    const reason = raw === 'none' ? undefined : (raw as any);
    rejectScenario(ctx.from!.id, result.scenarioId, reason);

    const pool = result.poolIds ? scenarios.filter((s) => result.poolIds!.includes(s.id)) : undefined;
    await rollAndShow(ctx, {
      mood: result.mood,
      pool,
      excludeId: result.scenarioId,
      useContext: result.useContext,
    });
  });
}

export { rollAndShow };

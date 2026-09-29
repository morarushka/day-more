import type { Moment, Scenario } from '../../src/types';
import { formatBudget, formatCompany, formatDuration, formatLocation } from '../../src/lib/options';

const TIER_LABEL: Record<Scenario['tier'], string> = {
  spark: '✨ Небольшая искра',
  plan: '🗓 План на сегодня',
  memory: '📸 Момент для памяти',
};

export function formatScenarioCard(scenario: Scenario, eyebrow = 'Сегодняшний план'): string {
  const lines = [
    `<i>${escapeHtml(eyebrow)}</i>`,
    `<b>${escapeHtml(scenario.title)}</b>`,
    '',
    escapeHtml(scenario.shortDescription),
    '',
    escapeHtml(scenario.instructions),
    '',
    `${TIER_LABEL[scenario.tier]}`,
    `⏱ ${formatDuration(scenario.durationMin, scenario.durationMax)}`,
    `💰 ${formatBudget(scenario.budgetLevel)}`,
    `📍 ${formatLocation(scenario.location)}`,
    `👥 ${formatCompany(scenario.company)}`,
  ];
  if (scenario.safetyNotes) lines.push('', `⚠️ ${escapeHtml(scenario.safetyNotes)}`);
  return lines.join('\n');
}

const RATING_EMOJI: Record<Moment['rating'], string> = {
  loved: '❤️',
  nice: '🙂',
  'not-for-me': '😐',
};

export function formatMomentLine(moment: Moment): string {
  const date = new Date(moment.completedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  const parts = [`${RATING_EMOJI[moment.rating]} <b>${escapeHtml(moment.scenarioTitleSnapshot)}</b> — ${date}`];
  if (moment.note) parts.push(`   <i>${escapeHtml(moment.note)}</i>`);
  return parts.join('\n');
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

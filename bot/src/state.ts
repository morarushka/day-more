import { db } from './db';
import type { Moment, MomentRating, RejectionReason, Scenario, ScenarioEvent, UserContextSelection } from '../../src/types';
import { DEFAULT_CONTEXT } from '../../src/types';

export interface AppState {
  events: ScenarioEvent[];
  moments: Moment[];
  activeScenarioId: string | null;
  savedScenarioIds: string[];
  context: UserContextSelection;
  onboardingSeen: boolean;
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function ensureUser(telegramId: number): void {
  db.prepare(
    `INSERT INTO users (telegram_id, onboarding_seen, active_scenario_id, context_json, created_at)
     VALUES (@id, 0, NULL, @context, @now)
     ON CONFLICT(telegram_id) DO NOTHING`,
  ).run({ id: telegramId, context: JSON.stringify(DEFAULT_CONTEXT), now: new Date().toISOString() });
}

export function loadState(telegramId: number): AppState {
  ensureUser(telegramId);

  const user = db
    .prepare('SELECT onboarding_seen, active_scenario_id, context_json FROM users WHERE telegram_id = ?')
    .get(telegramId) as { onboarding_seen: number; active_scenario_id: string | null; context_json: string };

  const events = (
    db.prepare('SELECT * FROM events WHERE user_id = ? ORDER BY occurred_at ASC').all(telegramId) as any[]
  ).map(
    (e): ScenarioEvent => ({
      id: e.id,
      scenarioId: e.scenario_id,
      kind: e.kind,
      rejectionReason: e.rejection_reason ?? undefined,
      rating: e.rating ?? undefined,
      occurredAt: e.occurred_at,
    }),
  );

  const moments = (
    db.prepare('SELECT * FROM moments WHERE user_id = ? ORDER BY completed_at ASC').all(telegramId) as any[]
  ).map(
    (m): Moment => ({
      id: m.id,
      scenarioId: m.scenario_id,
      scenarioTitleSnapshot: m.scenario_title,
      rating: m.rating,
      photoRef: m.photo_file_id,
      note: m.note,
      completedAt: m.completed_at,
      tagsSnapshot: JSON.parse(m.tags_json),
    }),
  );

  const savedScenarioIds = (
    db.prepare('SELECT scenario_id FROM saved_scenarios WHERE user_id = ?').all(telegramId) as any[]
  ).map((r) => r.scenario_id);

  return {
    events,
    moments,
    activeScenarioId: user.active_scenario_id,
    savedScenarioIds,
    context: user.context_json ? JSON.parse(user.context_json) : DEFAULT_CONTEXT,
    onboardingSeen: !!user.onboarding_seen,
  };
}

export function logEvent(
  telegramId: number,
  scenarioId: string,
  patch: Omit<ScenarioEvent, 'id' | 'scenarioId' | 'occurredAt'>,
): void {
  ensureUser(telegramId);
  db.prepare(
    `INSERT INTO events (id, user_id, scenario_id, kind, rejection_reason, rating, occurred_at)
     VALUES (@id, @userId, @scenarioId, @kind, @rejectionReason, @rating, @occurredAt)`,
  ).run({
    id: makeId(),
    userId: telegramId,
    scenarioId,
    kind: patch.kind,
    rejectionReason: patch.rejectionReason ?? null,
    rating: patch.rating ?? null,
    occurredAt: new Date().toISOString(),
  });
}

export const viewScenario = (telegramId: number, scenarioId: string) => logEvent(telegramId, scenarioId, { kind: 'viewed' });

export function acceptScenario(telegramId: number, scenarioId: string): void {
  logEvent(telegramId, scenarioId, { kind: 'accepted' });
  ensureUser(telegramId);
  db.prepare('UPDATE users SET active_scenario_id = ? WHERE telegram_id = ?').run(scenarioId, telegramId);
}

export function rejectScenario(telegramId: number, scenarioId: string, reason?: RejectionReason): void {
  logEvent(telegramId, scenarioId, { kind: 'rejected', rejectionReason: reason });
}

export function toggleSaved(telegramId: number, scenarioId: string): boolean {
  ensureUser(telegramId);
  const existing = db
    .prepare('SELECT 1 FROM saved_scenarios WHERE user_id = ? AND scenario_id = ?')
    .get(telegramId, scenarioId);

  if (existing) {
    db.prepare('DELETE FROM saved_scenarios WHERE user_id = ? AND scenario_id = ?').run(telegramId, scenarioId);
    return false;
  }
  db.prepare('INSERT INTO saved_scenarios (user_id, scenario_id) VALUES (?, ?)').run(telegramId, scenarioId);
  logEvent(telegramId, scenarioId, { kind: 'saved' });
  return true;
}

export function clearActiveScenario(telegramId: number): void {
  ensureUser(telegramId);
  db.prepare('UPDATE users SET active_scenario_id = NULL WHERE telegram_id = ?').run(telegramId);
}

export function completeActiveScenario(
  telegramId: number,
  scenario: Scenario,
  rating: MomentRating,
  note: string | null,
  photoFileId: string | null,
): Moment {
  const momentId = makeId();
  logEvent(telegramId, scenario.id, { kind: 'completed', rating });

  const moment: Moment = {
    id: momentId,
    scenarioId: scenario.id,
    scenarioTitleSnapshot: scenario.title,
    rating,
    photoRef: photoFileId,
    note,
    completedAt: new Date().toISOString(),
    tagsSnapshot: {
      categories: scenario.categories,
      noveltyScore: scenario.noveltyScore,
      socialLevel: scenario.socialLevel,
      romanceLevel: scenario.romanceLevel,
      location: scenario.location,
    },
  };

  db.prepare(
    `INSERT INTO moments (id, user_id, scenario_id, scenario_title, rating, photo_file_id, note, completed_at, tags_json)
     VALUES (@id, @userId, @scenarioId, @scenarioTitle, @rating, @photoFileId, @note, @completedAt, @tagsJson)`,
  ).run({
    id: moment.id,
    userId: telegramId,
    scenarioId: moment.scenarioId,
    scenarioTitle: moment.scenarioTitleSnapshot,
    rating: moment.rating,
    photoFileId: moment.photoRef,
    note: moment.note,
    completedAt: moment.completedAt,
    tagsJson: JSON.stringify(moment.tagsSnapshot),
  });

  clearActiveScenario(telegramId);
  return moment;
}

export function updateContext(telegramId: number, context: UserContextSelection): void {
  ensureUser(telegramId);
  db.prepare('UPDATE users SET context_json = ? WHERE telegram_id = ?').run(JSON.stringify(context), telegramId);
}

export function setOnboardingSeen(telegramId: number, seen: boolean): void {
  ensureUser(telegramId);
  db.prepare('UPDATE users SET onboarding_seen = ? WHERE telegram_id = ?').run(seen ? 1 : 0, telegramId);
}

export function resetUser(telegramId: number): void {
  db.prepare('DELETE FROM events WHERE user_id = ?').run(telegramId);
  db.prepare('DELETE FROM moments WHERE user_id = ?').run(telegramId);
  db.prepare('DELETE FROM saved_scenarios WHERE user_id = ?').run(telegramId);
  db.prepare('DELETE FROM users WHERE telegram_id = ?').run(telegramId);
  ensureUser(telegramId);
}

import type { Mood, Scenario, ScenarioEvent, UserContextSelection } from '../types';
import { getActiveSeasons } from './season';

const TIME_RANGES_MIN: Record<UserContextSelection['time'], [number, number]> = {
  '15m': [0, 20],
  '30-60m': [20, 65],
  '2-3h': [90, 200],
  evening: [120, 260],
  'half-day': [180, 420],
  day: [300, 1440],
};

const TASTE_REASONS = new Set(['too-expensive', 'dont-want-to-go-out', 'too-much-energy', 'not-my-thing', 'already-done-similar']);
const RECENT_REJECTIONS_WINDOW = 10;
const RECENT_COMPLETIONS_WINDOW = 15;
const WEIGHT_FLOOR = 0.2;
const REJECTION_PENALTY = 0.6;
const COMPLETION_PENALTY = 0.15;

export interface SelectOptions {
  mood?: Mood;
  context?: UserContextSelection;
  pool?: Scenario[];
  excludeId?: string;
}

function timeOverlaps(scenario: Scenario, time: UserContextSelection['time']): boolean {
  const [lo, hi] = TIME_RANGES_MIN[time];
  return scenario.durationMin <= hi && scenario.durationMax >= lo;
}

function companyMatches(scenario: Scenario, company: UserContextSelection['company']): boolean {
  return scenario.company.includes('any') || scenario.company.includes(company);
}

function locationMatches(scenario: Scenario, location: UserContextSelection['location']): boolean {
  return scenario.location === 'either' || location === 'either' || scenario.location === location;
}

function budgetMatches(scenario: Scenario, budget: UserContextSelection['budget']): boolean {
  if (scenario.budgetLevel === 'any' || budget === 'any') return true;
  const order = ['free', 'low', 'medium'];
  return order.indexOf(scenario.budgetLevel) <= order.indexOf(budget);
}

function energyMatches(scenario: Scenario, energy: UserContextSelection['energy']): boolean {
  const order = ['very-low', 'normal', 'high'];
  return order.indexOf(scenario.energyLevel) <= order.indexOf(energy);
}

/** Filters progressively relax so the user is never left without a result. */
function filterPool(scenarios: Scenario[], mood: Mood | undefined, context: UserContextSelection | undefined): Scenario[] {
  const activeSeasons = new Set(getActiveSeasons());
  let pool = scenarios.filter((s) => s.active && s.season.some((se) => activeSeasons.has(se)));

  const steps: Array<(list: Scenario[]) => Scenario[]> = [
    (list) => (mood ? list.filter((s) => s.moods.includes(mood)) : list),
    (list) => (context ? list.filter((s) => companyMatches(s, context.company)) : list),
    (list) => (context ? list.filter((s) => locationMatches(s, context.location)) : list),
    (list) => (context ? list.filter((s) => budgetMatches(s, context.budget)) : list),
    (list) => (context ? list.filter((s) => energyMatches(s, context.energy)) : list),
    (list) => (context ? list.filter((s) => timeOverlaps(s, context.time)) : list),
  ];

  const fallbackPool = pool;
  for (const step of steps) {
    const next = step(pool);
    if (next.length > 0) pool = next;
  }

  return pool.length > 0 ? pool : fallbackPool;
}

function weightFor(scenario: Scenario, events: ScenarioEvent[]): number {
  let weight = 1;

  const recentRejections = events
    .filter((e) => e.kind === 'rejected' && e.rejectionReason && TASTE_REASONS.has(e.rejectionReason))
    .slice(-RECENT_REJECTIONS_WINDOW);

  for (const rejection of recentRejections) {
    const rejected = scenario; // penalty applies to scenarios sharing the rejected attribute, checked below
    switch (rejection.rejectionReason) {
      case 'too-expensive':
        if (rejected.budgetLevel !== 'free') weight *= REJECTION_PENALTY;
        break;
      case 'dont-want-to-go-out':
        if (rejected.location === 'out') weight *= REJECTION_PENALTY;
        break;
      case 'too-much-energy':
        if (rejected.energyLevel === 'high') weight *= REJECTION_PENALTY;
        break;
      case 'not-my-thing':
      case 'already-done-similar':
        break;
    }
  }

  const recentCompletedIds = new Set(
    events
      .filter((e) => e.kind === 'completed')
      .slice(-RECENT_COMPLETIONS_WINDOW)
      .map((e) => e.scenarioId),
  );
  if (recentCompletedIds.has(scenario.id)) weight *= COMPLETION_PENALTY;

  return Math.max(weight, WEIGHT_FLOOR);
}

export function selectScenario(scenarios: Scenario[], events: ScenarioEvent[], opts: SelectOptions = {}): Scenario | null {
  const basePool = opts.pool ?? scenarios;
  if (basePool.length === 0) return null;

  let pool = filterPool(basePool, opts.mood, opts.context);
  if (opts.excludeId && pool.length > 1) {
    const withoutExcluded = pool.filter((s) => s.id !== opts.excludeId);
    if (withoutExcluded.length > 0) pool = withoutExcluded;
  }

  const weighted = pool.map((s) => ({ scenario: s, weight: weightFor(s, events) }));
  const total = weighted.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * total;

  for (const { scenario, weight } of weighted) {
    roll -= weight;
    if (roll <= 0) return scenario;
  }

  return weighted[weighted.length - 1]?.scenario ?? null;
}

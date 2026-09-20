import { clear, get, set } from 'idb-keyval';
import type { Moment, ScenarioEvent, UserContextSelection } from '../types';
import { DEFAULT_CONTEXT } from '../types';

const KEYS = {
  events: 'events.v1',
  moments: 'moments.v1',
  activeScenarioId: 'activeScenarioId.v1',
  savedScenarioIds: 'savedScenarioIds.v1',
  context: 'context.v1',
  onboardingSeen: 'onboardingSeen.v1',
} as const;

export interface AppState {
  events: ScenarioEvent[];
  moments: Moment[];
  activeScenarioId: string | null;
  savedScenarioIds: string[];
  context: UserContextSelection;
  onboardingSeen: boolean;
}

export async function loadAppState(): Promise<AppState> {
  const [events, moments, activeScenarioId, savedScenarioIds, context, onboardingSeen] = await Promise.all([
    get<ScenarioEvent[]>(KEYS.events),
    get<Moment[]>(KEYS.moments),
    get<string | null>(KEYS.activeScenarioId),
    get<string[]>(KEYS.savedScenarioIds),
    get<UserContextSelection>(KEYS.context),
    get<boolean>(KEYS.onboardingSeen),
  ]);

  return {
    events: events ?? [],
    moments: moments ?? [],
    activeScenarioId: activeScenarioId ?? null,
    savedScenarioIds: savedScenarioIds ?? [],
    context: context ?? DEFAULT_CONTEXT,
    onboardingSeen: onboardingSeen ?? false,
  };
}

export const saveEvents = (events: ScenarioEvent[]) => set(KEYS.events, events);
export const saveMoments = (moments: Moment[]) => set(KEYS.moments, moments);
export const saveActiveScenarioId = (id: string | null) => set(KEYS.activeScenarioId, id);
export const saveSavedScenarioIds = (ids: string[]) => set(KEYS.savedScenarioIds, ids);
export const saveContext = (context: UserContextSelection) => set(KEYS.context, context);
export const saveOnboardingSeen = (seen: boolean) => set(KEYS.onboardingSeen, seen);

const photoKey = (id: string) => `photo.v1.${id}`;

export async function savePhoto(id: string, blob: Blob): Promise<void> {
  await set(photoKey(id), blob);
}

export async function loadPhoto(id: string): Promise<Blob | undefined> {
  return get<Blob>(photoKey(id));
}

export async function resetAllData(): Promise<void> {
  await clear();
}

import { useCallback, useEffect, useState } from 'react';
import type { AppState } from '../lib/db';
import {
  loadAppState,
  savePhoto,
  saveActiveScenarioId,
  saveContext,
  saveEvents,
  saveMoments,
  saveOnboardingSeen,
  saveSavedScenarioIds,
} from '../lib/db';
import type { Moment, MomentRating, RejectionReason, Scenario, ScenarioEvent, UserContextSelection } from '../types';

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useApp() {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    loadAppState().then(setState);
  }, []);

  const logEvent = useCallback((scenarioId: string, patch: Omit<ScenarioEvent, 'id' | 'scenarioId' | 'occurredAt'>) => {
    setState((prev) => {
      if (!prev) return prev;
      const event: ScenarioEvent = { id: makeId(), scenarioId, occurredAt: new Date().toISOString(), ...patch };
      const events = [...prev.events, event];
      saveEvents(events);
      return { ...prev, events };
    });
  }, []);

  const viewScenario = useCallback((scenarioId: string) => logEvent(scenarioId, { kind: 'viewed' }), [logEvent]);

  const acceptScenario = useCallback(
    (scenarioId: string) => {
      logEvent(scenarioId, { kind: 'accepted' });
      setState((prev) => {
        if (!prev) return prev;
        saveActiveScenarioId(scenarioId);
        return { ...prev, activeScenarioId: scenarioId };
      });
    },
    [logEvent],
  );

  const rejectScenario = useCallback(
    (scenarioId: string, reason?: RejectionReason) => {
      logEvent(scenarioId, { kind: 'rejected', rejectionReason: reason });
    },
    [logEvent],
  );

  const toggleSaved = useCallback((scenarioId: string) => {
    setState((prev) => {
      if (!prev) return prev;
      const isSaved = prev.savedScenarioIds.includes(scenarioId);
      const savedScenarioIds = isSaved
        ? prev.savedScenarioIds.filter((id) => id !== scenarioId)
        : [...prev.savedScenarioIds, scenarioId];
      saveSavedScenarioIds(savedScenarioIds);
      return { ...prev, savedScenarioIds };
    });
    if (!state?.savedScenarioIds.includes(scenarioId)) {
      logEvent(scenarioId, { kind: 'saved' });
    }
  }, [logEvent, state]);

  const completeActiveScenario = useCallback(
    async (scenario: Scenario, rating: MomentRating, note: string | null, photo: Blob | null) => {
      const momentId = makeId();
      if (photo) await savePhoto(momentId, photo);

      logEvent(scenario.id, { kind: 'completed', rating });

      setState((prev) => {
        if (!prev) return prev;
        const moment: Moment = {
          id: momentId,
          scenarioId: scenario.id,
          scenarioTitleSnapshot: scenario.title,
          rating,
          photoRef: photo ? momentId : null,
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
        const moments = [...prev.moments, moment];
        saveMoments(moments);
        saveActiveScenarioId(null);
        return { ...prev, moments, activeScenarioId: null };
      });
    },
    [logEvent],
  );

  const clearActiveScenario = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;
      saveActiveScenarioId(null);
      return { ...prev, activeScenarioId: null };
    });
  }, []);

  const updateContext = useCallback((context: UserContextSelection) => {
    setState((prev) => {
      if (!prev) return prev;
      saveContext(context);
      return { ...prev, context };
    });
  }, []);

  const setOnboardingSeen = useCallback((seen: boolean) => {
    setState((prev) => {
      if (!prev) return prev;
      saveOnboardingSeen(seen);
      return { ...prev, onboardingSeen: seen };
    });
  }, []);

  return {
    state,
    viewScenario,
    acceptScenario,
    rejectScenario,
    toggleSaved,
    completeActiveScenario,
    clearActiveScenario,
    updateContext,
    setOnboardingSeen,
  };
}

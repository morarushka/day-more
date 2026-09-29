import { useMemo, useState } from 'react';
import type { Mood, MomentRating, RejectionReason, Scenario, UserContextSelection } from './types';
import { useApp } from './hooks/useApp';
import { useScenarios } from './hooks/useScenarios';
import { selectScenario } from './lib/selectScenario';
import { scenariosInCollection } from './lib/collections';
import { resetAllData } from './lib/db';

import { Onboarding } from './components/Onboarding';
import { Today } from './components/Today';
import { ContextSheet } from './components/ContextSheet';
import { ScenarioResultView } from './components/ScenarioResultView';
import { ActiveScenarioView } from './components/ActiveScenarioView';
import { CompleteFlow } from './components/CompleteFlow';
import { Collections } from './components/Collections';
import { CollectionDetail } from './components/CollectionDetail';
import { Moments } from './components/Moments';
import { Settings } from './components/Settings';
import { BottomNav, type Tab } from './components/BottomNav';

export default function App() {
  const app = useApp();
  const scenarios = useScenarios();
  const [tab, setTab] = useState<Tab>('today');

  const [pendingMood, setPendingMood] = useState<Mood | undefined>(undefined);
  const [showContextSheet, setShowContextSheet] = useState(false);

  const [resultScenario, setResultScenario] = useState<Scenario | null>(null);
  const [resultPool, setResultPool] = useState<Scenario[] | undefined>(undefined);
  const [resultMood, setResultMood] = useState<Mood | undefined>(undefined);
  const [resultUseContext, setResultUseContext] = useState(true);

  const [viewingActive, setViewingActive] = useState(false);
  const [showCompleteFlow, setShowCompleteFlow] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [openCollectionId, setOpenCollectionId] = useState<string | null>(null);

  const completedScenarioIds = useMemo(
    () => new Set((app.state?.events ?? []).filter((e) => e.kind === 'completed').map((e) => e.scenarioId)),
    [app.state?.events],
  );

  const activeScenario = useMemo(
    () => scenarios?.find((s) => s.id === app.state?.activeScenarioId) ?? null,
    [scenarios, app.state?.activeScenarioId],
  );

  const savedScenarios = useMemo(
    () =>
      (app.state?.savedScenarioIds ?? [])
        .map((id) => scenarios?.find((s) => s.id === id))
        .filter((s): s is Scenario => !!s),
    [scenarios, app.state?.savedScenarioIds],
  );

  if (!app.state || !scenarios) return null;
  const allScenarios = scenarios;

  function rollScenario(mood: Mood | undefined, pool: Scenario[] | undefined, excludeId?: string, useContext = true) {
    const scenario = selectScenario(allScenarios, app.state!.events, {
      mood,
      context: useContext ? app.state!.context : undefined,
      pool,
      excludeId,
    });
    if (scenario) {
      app.viewScenario(scenario.id);
      setResultScenario(scenario);
      setResultPool(pool);
      setResultMood(mood);
      setResultUseContext(useContext);
    }
  }

  function handlePickMood(mood: Mood) {
    setPendingMood(mood);
    setShowContextSheet(true);
  }

  function handleSurprise() {
    rollScenario(undefined, undefined, undefined, false);
  }

  function handleConfirmContext(context: UserContextSelection) {
    app.updateContext(context);
    setShowContextSheet(false);
    rollScenario(pendingMood, undefined);
  }

  function handleChooseForMe(collectionId: string) {
    const pool = scenariosInCollection(collectionId, allScenarios);
    rollScenario(undefined, pool);
  }

  function handleOpenScenarioManually(scenario: Scenario, pool?: Scenario[]) {
    app.viewScenario(scenario.id);
    setResultScenario(scenario);
    setResultPool(pool);
    setResultMood(undefined);
    setResultUseContext(true);
  }

  function handleAccept() {
    if (!resultScenario) return;
    app.acceptScenario(resultScenario.id);
    setResultScenario(null);
    setOpenCollectionId(null);
    setTab('today');
  }

  function handleNotToday(reason?: RejectionReason) {
    if (!resultScenario) return;
    app.rejectScenario(resultScenario.id, reason);
    rollScenario(resultMood, resultPool, resultScenario.id, resultUseContext);
  }

  function handleSaveComplete(rating: MomentRating, note: string | null, photo: Blob | null) {
    if (!activeScenario) return;
    app.completeActiveScenario(activeScenario, rating, note, photo);
    setShowCompleteFlow(false);
    setViewingActive(false);
  }

  return (
    <div className="app">
      {!app.state.onboardingSeen && <Onboarding onDone={() => app.setOnboardingSeen(true)} />}

      {tab === 'today' && !openCollectionId && (
        <Today
          activeScenario={activeScenario}
          onPickMood={handlePickMood}
          onSurprise={handleSurprise}
          onOpenActive={() => setViewingActive(true)}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {tab === 'collections' && !openCollectionId && (
        <Collections
          scenarios={allScenarios}
          completedScenarioIds={completedScenarioIds}
          onOpenCollection={setOpenCollectionId}
        />
      )}

      {openCollectionId && (
        <CollectionDetail
          collectionId={openCollectionId}
          scenarios={allScenarios}
          completedScenarioIds={completedScenarioIds}
          onChooseForMe={() => handleChooseForMe(openCollectionId)}
          onOpenScenario={(s) => handleOpenScenarioManually(s, scenariosInCollection(openCollectionId, allScenarios))}
          onBack={() => setOpenCollectionId(null)}
        />
      )}

      {tab === 'moments' && !openCollectionId && (
        <Moments
          moments={app.state.moments}
          savedScenarios={savedScenarios}
          onOpenSaved={(s) => handleOpenScenarioManually(s)}
        />
      )}

      {!openCollectionId && <BottomNav tab={tab} onChange={setTab} />}

      {showContextSheet && (
        <ContextSheet
          initial={app.state.context}
          onConfirm={handleConfirmContext}
          onClose={() => setShowContextSheet(false)}
        />
      )}

      {resultScenario && (
        <ScenarioResultView
          scenario={resultScenario}
          saved={app.state.savedScenarioIds.includes(resultScenario.id)}
          onAccept={handleAccept}
          onNotToday={handleNotToday}
          onToggleSaved={() => app.toggleSaved(resultScenario.id)}
          onClose={() => setResultScenario(null)}
        />
      )}

      {viewingActive && activeScenario && (
        <ActiveScenarioView
          scenario={activeScenario}
          onMarkDone={() => setShowCompleteFlow(true)}
          onClose={() => setViewingActive(false)}
        />
      )}

      {showCompleteFlow && activeScenario && (
        <CompleteFlow
          scenarioTitle={activeScenario.title}
          onSave={handleSaveComplete}
          onClose={() => setShowCompleteFlow(false)}
        />
      )}

      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          onReplayOnboarding={() => {
            setShowSettings(false);
            app.setOnboardingSeen(false);
          }}
          onResetData={() => {
            resetAllData().then(() => window.location.reload());
          }}
        />
      )}
    </div>
  );
}

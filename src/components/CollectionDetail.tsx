import type { Scenario } from '../types';
import { COLLECTIONS, collectionProgress } from '../lib/collections';

interface Props {
  collectionId: string;
  scenarios: Scenario[];
  completedScenarioIds: Set<string>;
  onChooseForMe: () => void;
  onOpenScenario: (scenario: Scenario) => void;
  onBack: () => void;
}

export function CollectionDetail({ collectionId, scenarios, completedScenarioIds, onChooseForMe, onOpenScenario, onBack }: Props) {
  const def = COLLECTIONS.find((c) => c.id === collectionId);
  const { members, completedCount, total } = collectionProgress(collectionId, scenarios, completedScenarioIds);
  if (!def) return null;

  return (
    <div className="screen">
      <div className="top-bar">
        <div>
          <p className="eyebrow">{def.emoji} Коллекция</p>
          <h1 className="display-title">{def.name}</h1>
        </div>
        <button className="top-bar__icon-btn" onClick={onBack} aria-label="Назад">
          ✕
        </button>
      </div>

      <p className="body-text muted" style={{ marginBottom: 4 }}>
        {def.description}
      </p>
      <p className="progress-label" style={{ marginBottom: 20 }}>
        {completedCount} / {total} пережито
      </p>

      <button className="btn btn-primary" style={{ marginBottom: 20 }} onClick={onChooseForMe}>
        Выбрать за меня
      </button>

      <div className="scenario-list">
        {members.map((s) => {
          const done = completedScenarioIds.has(s.id);
          return (
            <button
              key={s.id}
              className={`scenario-row ${done ? 'scenario-row--done' : ''}`}
              onClick={() => onOpenScenario(s)}
            >
              <span className="scenario-row__title">{s.title}</span>
              {done && <span className="scenario-row__check">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

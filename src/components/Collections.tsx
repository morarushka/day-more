import type { CSSProperties } from 'react';
import type { Scenario } from '../types';
import { COLLECTIONS, collectionProgress } from '../lib/collections';

interface Props {
  scenarios: Scenario[];
  completedScenarioIds: Set<string>;
  onOpenCollection: (collectionId: string) => void;
}

export function Collections({ scenarios, completedScenarioIds, onOpenCollection }: Props) {
  return (
    <div className="screen">
      <p className="eyebrow">Коллекции</p>
      <h1 className="display-title">Выбирай по настроению, сезону или моменту.</h1>

      <div className="collection-grid">
        {COLLECTIONS.map((c) => {
          const { total, completedCount } = collectionProgress(c.id, scenarios, completedScenarioIds);
          const pct = total > 0 ? (completedCount / total) * 100 : 0;
          return (
            <button key={c.id} className="collection-card" onClick={() => onOpenCollection(c.id)}>
              <span className="collection-card__emoji" style={{ '--tint': c.tint } as CSSProperties}>
                {c.emoji}
              </span>
              <span className="collection-card__body">
                <span className="collection-card__name">{c.name}</span>
                <span className="collection-card__desc">{c.description}</span>
                <span className="progress-track">
                  <span className="progress-fill" style={{ width: `${pct}%` }} />
                </span>
                <span className="progress-label">
                  {completedCount} / {total} пережито
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

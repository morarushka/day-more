import type { Scenario } from '../types';
import { ScenarioCard } from './ScenarioCard';

interface Props {
  scenario: Scenario;
  onMarkDone: () => void;
  onClose: () => void;
}

export function ActiveScenarioView({ scenario, onMarkDone, onClose }: Props) {
  return (
    <div className="scenario-view">
      <div className="scenario-view__close">
        <button className="top-bar__icon-btn" onClick={onClose} aria-label="Закрыть">
          ✕
        </button>
      </div>
      <div className="scenario-view__body">
        <ScenarioCard scenario={scenario} eyebrow="В процессе" />
        <button className="btn btn-primary" onClick={onMarkDone}>
          Отметить сделанным
        </button>
      </div>
    </div>
  );
}

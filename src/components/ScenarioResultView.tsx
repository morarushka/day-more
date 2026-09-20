import { useState } from 'react';
import type { RejectionReason, Scenario } from '../types';
import { ScenarioCard } from './ScenarioCard';
import { REJECTION_REASON_OPTIONS } from '../lib/options';

interface Props {
  scenario: Scenario;
  saved: boolean;
  onAccept: () => void;
  onNotToday: (reason?: RejectionReason) => void;
  onToggleSaved: () => void;
  onClose: () => void;
}

export function ScenarioResultView({ scenario, saved, onAccept, onNotToday, onToggleSaved, onClose }: Props) {
  const [showReasons, setShowReasons] = useState(false);

  return (
    <div className="scenario-view">
      <div className="scenario-view__close">
        <button className="top-bar__icon-btn" onClick={onClose} aria-label="Закрыть">
          ✕
        </button>
      </div>
      <div className="scenario-view__body">
        <ScenarioCard scenario={scenario} eyebrow="Сегодняшний план" />

        {!showReasons ? (
          <div className="btn-row">
            <button className="btn btn-primary" onClick={onAccept}>
              Делаем это
            </button>
            <button className="btn btn-secondary" onClick={onToggleSaved}>
              {saved ? 'Сохранено на потом ✓' : 'Сохранить на потом'}
            </button>
            <button className="btn btn-ghost" onClick={() => setShowReasons(true)}>
              Не сегодня
            </button>
          </div>
        ) : (
          <div>
            <p className="body-text muted" style={{ marginBottom: 8 }}>
              Что не подошло? (необязательно)
            </p>
            <div className="reason-grid">
              {REJECTION_REASON_OPTIONS.map((r) => (
                <button
                  key={r.value}
                  className="reason-chip"
                  onClick={() => {
                    onNotToday(r.value);
                    setShowReasons(false);
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button
              className="btn btn-ghost"
              onClick={() => {
                onNotToday(undefined);
                setShowReasons(false);
              }}
            >
              Пропустить, дай другой вариант
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

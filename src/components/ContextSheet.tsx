import { useState } from 'react';
import type { UserContextSelection } from '../types';
import { BUDGET_OPTIONS, COMPANY_OPTIONS, ENERGY_OPTIONS, LOCATION_OPTIONS, TIME_OPTIONS } from '../lib/options';

interface Props {
  initial: UserContextSelection;
  onConfirm: (context: UserContextSelection) => void;
  onClose: () => void;
}

export function ContextSheet({ initial, onConfirm, onClose }: Props) {
  const [context, setContext] = useState(initial);

  function set<K extends keyof UserContextSelection>(key: K, value: UserContextSelection[K]) {
    setContext((c) => ({ ...c, [key]: value }));
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__handle" />

        <div className="sheet__group">
          <p className="sheet__group-label">Время</p>
          <div className="segmented">
            {TIME_OPTIONS.map((o) => (
              <button
                key={o.value}
                className={`segmented__option ${context.time === o.value ? 'selected' : ''}`}
                onClick={() => set('time', o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sheet__group">
          <p className="sheet__group-label">Компания</p>
          <div className="segmented">
            {COMPANY_OPTIONS.map((o) => (
              <button
                key={o.value}
                className={`segmented__option ${context.company === o.value ? 'selected' : ''}`}
                onClick={() => set('company', o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sheet__group">
          <p className="sheet__group-label">Место</p>
          <div className="segmented">
            {LOCATION_OPTIONS.map((o) => (
              <button
                key={o.value}
                className={`segmented__option ${context.location === o.value ? 'selected' : ''}`}
                onClick={() => set('location', o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sheet__group">
          <p className="sheet__group-label">Бюджет</p>
          <div className="segmented">
            {BUDGET_OPTIONS.map((o) => (
              <button
                key={o.value}
                className={`segmented__option ${context.budget === o.value ? 'selected' : ''}`}
                onClick={() => set('budget', o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sheet__group">
          <p className="sheet__group-label">Энергия</p>
          <div className="segmented">
            {ENERGY_OPTIONS.map((o) => (
              <button
                key={o.value}
                className={`segmented__option ${context.energy === o.value ? 'selected' : ''}`}
                onClick={() => set('energy', o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => onConfirm({ ...context, updatedAt: new Date().toISOString() })}>
          Составить план
        </button>
      </div>
    </div>
  );
}

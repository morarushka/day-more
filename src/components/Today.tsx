import type { Mood, Scenario } from '../types';
import { MOOD_OPTIONS } from '../lib/options';

interface Props {
  activeScenario: Scenario | null;
  onPickMood: (mood: Mood | undefined) => void;
  onOpenActive: () => void;
  onOpenSettings: () => void;
}

export function Today({ activeScenario, onPickMood, onOpenActive, onOpenSettings }: Props) {
  return (
    <div className="screen">
      <div className="top-bar">
        <div>
          <p className="eyebrow">Сегодня</p>
          <h1 className="display-title">Чего тебе хочется сегодня больше?</h1>
        </div>
        <button className="top-bar__icon-btn" onClick={onOpenSettings} aria-label="Настройки">
          ⚙
        </button>
      </div>

      {activeScenario && (
        <div className="active-banner" onClick={onOpenActive} role="button">
          <p className="active-banner__eyebrow">В процессе</p>
          <p className="active-banner__title">{activeScenario.title}</p>
          <button className="btn btn-secondary" onClick={onOpenActive}>
            Открыть план
          </button>
        </div>
      )}

      <button className="surprise-btn" onClick={() => onPickMood(undefined)}>
        <span className="surprise-btn__emoji">🎲</span>
        <span className="surprise-btn__label">Удиви меня</span>
      </button>

      <div className="mood-grid">
        {MOOD_OPTIONS.map((m) => (
          <button key={m.value} className="mood-chip" onClick={() => onPickMood(m.value)}>
            <span className="mood-chip__emoji">{m.emoji}</span>
            <span className="mood-chip__label">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

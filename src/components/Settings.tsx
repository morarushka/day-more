interface Props {
  onClose: () => void;
  onReplayOnboarding: () => void;
  onResetData: () => void;
}

export function Settings({ onClose, onReplayOnboarding, onResetData }: Props) {
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__handle" />
        <h2 className="display-title" style={{ fontSize: '1.4rem' }}>
          Настройки
        </h2>
        <div className="btn-row">
          <button className="btn btn-secondary" onClick={onReplayOnboarding}>
            Показать вступление снова
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (confirm('Это удалит все планы, моменты и фото на этом устройстве. Продолжить?')) {
                onResetData();
              }
            }}
          >
            Очистить все данные
          </button>
        </div>
      </div>
    </div>
  );
}

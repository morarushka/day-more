import type { Moment, Scenario } from '../types';
import { groupMomentsByMonth, monthStatsLine } from '../lib/moments';
import { usePhotoUrl } from '../hooks/usePhotoUrl';

interface Props {
  moments: Moment[];
  savedScenarios: Scenario[];
  onOpenSaved: (scenario: Scenario) => void;
}

function MomentTile({ moment }: { moment: Moment }) {
  const photoUrl = usePhotoUrl(moment.photoRef);
  const ratingEmoji = moment.rating === 'loved' ? '❤️' : moment.rating === 'nice' ? '🙂' : '😐';

  return (
    <div className="moment-tile">
      {photoUrl ? (
        <img className="moment-tile__photo" src={photoUrl} alt={moment.scenarioTitleSnapshot} />
      ) : (
        <div className="moment-tile__placeholder">{ratingEmoji}</div>
      )}
      <div className="moment-tile__caption">
        <span className="moment-tile__title">{moment.scenarioTitleSnapshot}</span>
        {moment.note && <span>{moment.note}</span>}
      </div>
    </div>
  );
}

export function Moments({ moments, savedScenarios, onOpenSaved }: Props) {
  const monthGroups = groupMomentsByMonth(moments);

  return (
    <div className="screen">
      <p className="eyebrow">Моменты</p>
      <h1 className="display-title">Дни, которые ты действительно запомнишь.</h1>

      {savedScenarios.length > 0 && (
        <div className="saved-list">
          <p className="section-heading">Сохранено на потом</p>
          {savedScenarios.map((s) => (
            <button key={s.id} className="scenario-row" onClick={() => onOpenSaved(s)}>
              <span className="scenario-row__title">{s.title}</span>
            </button>
          ))}
        </div>
      )}

      {monthGroups.length === 0 ? (
        <p className="empty-state">Здесь пока пусто — первый выполненный план появится тут как момент.</p>
      ) : (
        monthGroups.map((group) => (
          <div key={group.key} className="month-block">
            <p className="section-heading">{group.label}</p>
            <p className="month-stats">{monthStatsLine(group.moments)}</p>
            <div className="moment-grid">
              {group.moments.map((m) => (
                <MomentTile key={m.id} moment={m} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

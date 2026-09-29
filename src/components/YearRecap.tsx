import { useState } from 'react';
import type { Moment } from '../types';
import { buildYearRecap, getAvailableYears } from '../lib/yearRecap';
import { formatCategory } from '../lib/options';

interface Props {
  moments: Moment[];
  onClose: () => void;
}

function pluralMonths(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'месяц';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'месяца';
  return 'месяцев';
}

export function YearRecap({ moments, onClose }: Props) {
  const years = getAvailableYears(moments);
  const [year, setYear] = useState(years[0]);
  const recap = buildYearRecap(moments, year);

  return (
    <div className="scenario-view">
      <div className="scenario-view__close">
        <button className="top-bar__icon-btn" onClick={onClose} aria-label="Закрыть">
          ✕
        </button>
      </div>
      <div className="scenario-view__body">
        <p className="eyebrow">Год в моментах</p>
        <h1 className="display-title">Посмотри, сколько жизни произошло.</h1>

        {years.length > 1 && (
          <div className="year-recap__tabs">
            {years.map((y) => (
              <button
                key={y}
                className={`segmented__option ${y === year ? 'selected' : ''}`}
                onClick={() => setYear(y)}
              >
                {y}
              </button>
            ))}
          </div>
        )}

        <div className="year-recap__hero">
          <span className="year-recap__hero-number">{recap.total}</span>
          <span className="year-recap__hero-label">
            {recap.total === 1 ? 'маленькая история' : 'маленьких историй'} за {recap.year}
          </span>
        </div>

        <div className="year-recap__grid">
          <div className="year-recap__stat">
            <span className="year-recap__stat-number">{recap.monthsActive}</span>
            <span className="year-recap__stat-label">{pluralMonths(recap.monthsActive)} с моментами</span>
          </div>
          <div className="year-recap__stat">
            <span className="year-recap__stat-number">{recap.newPlaces}</span>
            <span className="year-recap__stat-label">новых мест</span>
          </div>
          <div className="year-recap__stat">
            <span className="year-recap__stat-number">{recap.together}</span>
            <span className="year-recap__stat-label">моментов вместе</span>
          </div>
          <div className="year-recap__stat">
            <span className="year-recap__stat-number">{recap.firstTimes}</span>
            <span className="year-recap__stat-label">впервые попробовано</span>
          </div>
          <div className="year-recap__stat">
            <span className="year-recap__stat-number">{recap.loved}</span>
            <span className="year-recap__stat-label">очень понравилось</span>
          </div>
          <div className="year-recap__stat">
            <span className="year-recap__stat-number">{recap.withPhoto}</span>
            <span className="year-recap__stat-label">сохранено с фото</span>
          </div>
        </div>

        {recap.topCategory && (
          <p className="year-recap__footer">
            Больше всего в этом году — {formatCategory(recap.topCategory)}.
          </p>
        )}
      </div>
    </div>
  );
}

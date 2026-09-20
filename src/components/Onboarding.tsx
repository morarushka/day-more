import { useState } from 'react';

const SLIDES = [
  'Обычные дни не обязаны быть одинаковыми.',
  'Расскажи, каким хочешь видеть день. Мы предложим маленький план под твоё время, силы и компанию.',
  'Сделай это. Сохрани фото. Собирай дни, которые действительно запомнятся.',
];

interface Props {
  onDone: () => void;
}

export function Onboarding({ onDone }: Props) {
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  return (
    <div className="onboarding">
      <div className="onboarding__slide">
        <p className="onboarding__title">{SLIDES[index]}</p>
      </div>
      <div className="onboarding__dots">
        {SLIDES.map((_, i) => (
          <span key={i} className={`onboarding__dot ${i === index ? 'active' : ''}`} />
        ))}
      </div>
      <div className="onboarding__footer">
        <button
          className="btn btn-primary"
          onClick={() => (isLast ? onDone() : setIndex((i) => i + 1))}
        >
          {isLast ? 'Сделаем сегодня другим' : 'Далее'}
        </button>
      </div>
    </div>
  );
}

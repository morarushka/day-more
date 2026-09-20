import { useRef, useState } from 'react';
import type { MomentRating } from '../types';

interface Props {
  scenarioTitle: string;
  onSave: (rating: MomentRating, note: string | null, photo: Blob | null) => void;
  onClose: () => void;
}

const RATINGS: { value: MomentRating; label: string; emoji: string }[] = [
  { value: 'loved', label: 'Понравилось', emoji: '❤️' },
  { value: 'nice', label: 'Неплохо', emoji: '🙂' },
  { value: 'not-for-me', label: 'Не моё', emoji: '😐' },
];

export function CompleteFlow({ scenarioTitle, onSave, onClose }: Props) {
  const [rating, setRating] = useState<MomentRating | null>(null);
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoUrl(URL.createObjectURL(file));
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__handle" />
        <p className="eyebrow">{scenarioTitle}</p>
        <h2 className="display-title" style={{ fontSize: '1.4rem' }}>
          Как всё прошло?
        </h2>

        <div className="rating-grid">
          {RATINGS.map((r) => (
            <button
              key={r.value}
              className={`rating-btn ${rating === r.value ? 'selected' : ''}`}
              onClick={() => setRating(r.value)}
            >
              <span className="rating-btn__emoji">{r.emoji}</span>
              <span className="rating-btn__label">{r.label}</span>
            </button>
          ))}
        </div>

        {rating && (
          <>
            <p className="sheet__group-label">Оставить что-то на память? (необязательно)</p>
            <label className="photo-picker">
              {photoUrl ? (
                <img src={photoUrl} alt="" style={{ width: '100%', maxHeight: 180, objectFit: 'cover' }} />
              ) : (
                'Добавить фото'
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} />
            </label>
            <textarea
              className="note-input"
              placeholder="Короткая заметка о сегодняшнем дне…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={() => onSave(rating, note.trim() || null, photo)}
            >
              Сохранить момент
            </button>
          </>
        )}
      </div>
    </div>
  );
}

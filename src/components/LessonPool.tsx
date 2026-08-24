// The unplaced lesson cards at the bottom. The counterpart of the aSc pool in
// the photo. Card colour = teacher colour; that is what tells you which grid
// row it is aimed at.

import type React from 'react';
import type { Id } from '../types';
import { paletteColor } from '../palette';

export interface PoolCard {
  lessonId: Id;
  top: string; // class name
  bottom: string; // teacher short form
  subject: string;
  color: number;
  placed: number;
  total: number;
}

interface Props {
  cards: PoolCard[];
  completed: number;
  onStart: (e: React.PointerEvent, lessonId: Id) => void;
}

export default function LessonPool({ cards, completed, onStart }: Props) {
  const remainingHours = cards.reduce((sum, c) => sum + (c.total - c.placed), 0);

  return (
    <div className="pool">
      <div className="pool-head">
        {cards.length === 0 ? (
          <>Bütün dersler yerleşti. {completed} dersin tamamı programda.</>
        ) : (
          <>
            Yerleşmeyi bekleyen: <strong>{cards.length}</strong> ders,{' '}
            <strong>{remainingHours}</strong> saat. Karta basılı tutup ızgaraya sürükleyin.
          </>
        )}
      </div>

      <div className="pool-list">
        {cards.map((c) => (
          <div
            key={c.lessonId}
            className="pool-card"
            style={{ background: paletteColor(c.color) }}
            onPointerDown={(e) => onStart(e, c.lessonId)}
            title={`${c.top} — ${c.bottom} ${c.subject} · ${c.placed}/${c.total} saat yerleşti`}
          >
            <span className="card-top">{c.top}</span>
            <span className="card-bottom">{c.bottom}</span>
            <span className="counter">
              {c.placed}/{c.total}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

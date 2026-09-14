import { useRef, useState } from 'react';
import { coverageAmount, formatCZK } from '../domain/calc';

/** Width of the slider track in pixels. Matches `.slider` in styles.css. */
export const SLIDER_W = 560;

/**
 * The one conversion between the two ways of talking about slider position:
 * tests think in fractions of the track (0.0 – 1.0), the control thinks in
 * pixels. Exported so a test cannot hold its own copy of the width.
 */
export function offsetForFraction(fraction: number): number {
  return fraction * SLIDER_W;
}
export const SLIDER_MIN = 0;
export const SLIDER_MAX = 100;

interface Props {
  value: number;
  onChange: (level: number) => void;
}

export default function CoverageSlider({ value, onChange }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  function levelFromClientX(clientX: number): number {
    const rect = trackRef.current.getBoundingClientRect();
    const offset = clientX - rect.left;
    const level = Math.round((offset / SLIDER_W) * (SLIDER_MAX - SLIDER_MIN)) + SLIDER_MIN;
    if (level < SLIDER_MIN) return SLIDER_MIN;
    if (level > SLIDER_MAX) return SLIDER_MAX;
    return level;
  }

  function onPointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    onChange(levelFromClientX(e.clientX));
  }

  function onPointerMove(e) {
    if (!dragging) return;
    onChange(levelFromClientX(e.clientX));
  }

  function onPointerUp(e) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDragging(false);
  }

  const pct = ((value - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;

  return (
    <div>
      <p className="field-label">
        <span>Coverage level</span>
        <span className="value" data-cy="coverage-value">
          {value} % — {formatCZK(coverageAmount(value))}
        </span>
      </p>
      <div
        className="slider"
        data-cy="coverage-slider"
        ref={trackRef}
        role="slider"
        aria-valuenow={value}
        aria-valuemin={SLIDER_MIN}
        aria-valuemax={SLIDER_MAX}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="track" />
        <div className="fill" data-cy="coverage-fill" style={{ width: pct + '%' }} />
        <div className="handle" style={{ left: pct + '%' }} />
      </div>
      <div className="scale">
        <span>{SLIDER_MIN} %</span>
        <span>{SLIDER_MAX} %</span>
      </div>
    </div>
  );
}

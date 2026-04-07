import { memo } from 'react';
import type { CanvasObject, InkObjectData } from '@/types';

interface InkObjectProps {
  object: CanvasObject;
}

function InkObjectComponent({ object }: InkObjectProps) {
  const data = object.data as InkObjectData;
  const { style } = object;

  const points = data.points || [];
  if (points.length < 2) return null;

  // Simple SVG path from points
  const pathData = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`;
  }, '');

  return (
    <svg
      width={object.width || 100}
      height={object.height || 100}
      className="overflow-visible"
      style={{ position: 'absolute' }}
    >
      <path
        d={pathData}
        fill="none"
        stroke={style?.strokeColor || '#1f2937'}
        strokeWidth={data.strokeWidth || 3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default memo(InkObjectComponent);

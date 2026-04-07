import { memo } from 'react';
import type { CanvasObject, ShapeObjectData } from '@/types';

interface ShapeObjectProps {
  object: CanvasObject;
}

function ShapeObjectComponent({ object }: ShapeObjectProps) {
  const data = object.data as ShapeObjectData;
  const { style } = object;
  const width = object.width || 100;
  const height = object.height || 100;

  const generatePath = () => {
    switch (data.shapeType) {
      case 'diamond':
        return `M ${width / 2},0 L ${width},${height / 2} L ${width / 2},${height} L 0,${height / 2} Z`;
      case 'ellipse':
        return `M ${width / 2},0 A ${width / 2},${height / 2} 0 1,1 ${width / 2},${height} A ${width / 2},${height / 2} 0 1,1 ${width / 2},0`;
      case 'parallelogram':
        const offset = width * 0.2;
        return `M ${offset},0 L ${width},0 L ${width - offset},${height} L 0,${height} Z`;
      default:
        return `M 0,0 L ${width},0 L ${width},${height} L 0,${height} Z`;
    }
  };

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={generatePath()}
        fill={style?.fillColor || 'transparent'}
        stroke={style?.strokeColor || '#1f2937'}
        strokeWidth={style?.strokeWidth || 2}
        strokeDasharray={style?.strokeStyle === 'dashed' ? '8,4' : style?.strokeStyle === 'dotted' ? '2,4' : undefined}
      />
    </svg>
  );
}

export default memo(ShapeObjectComponent);

import { memo } from 'react';
import type { CanvasObject, ArrowObjectData } from '@/types';

interface ArrowObjectProps {
  object: CanvasObject;
}

function ArrowObjectComponent({ object }: ArrowObjectProps) {
  const data = object.data as ArrowObjectData;
  const { style } = object;

  const startX = data.startX || 0;
  const startY = data.startY || 0;
  const endX = data.endX || (object.width || 100);
  const endY = data.endY || 0;

  const generatePath = () => {
    switch (data.arrowType) {
      case 'elbow':
        const midX = (startX + endX) / 2;
        return `M ${startX},${startY} L ${midX},${startY} L ${midX},${endY} L ${endX},${endY}`;
      case 'curved':
        const cpX = (startX + endX) / 2;
        const cpY = Math.min(startY, endY) - 50;
        return `M ${startX},${startY} Q ${cpX},${cpY} ${endX},${endY}`;
      default:
        return `M ${startX},${startY} L ${endX},${endY}`;
    }
  };

  const strokeColor = style?.strokeColor || '#1f2937';

  return (
    <svg width={object.width || 100} height={object.height || 100} className="overflow-visible">
      <defs>
        <marker id={`arrow-${object.id}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={strokeColor} />
        </marker>
      </defs>
      <path
        d={generatePath()}
        fill="none"
        stroke={strokeColor}
        strokeWidth={style?.strokeWidth || 2}
        markerEnd={`url(#arrow-${object.id})`}
      />
    </svg>
  );
}

export default memo(ArrowObjectComponent);

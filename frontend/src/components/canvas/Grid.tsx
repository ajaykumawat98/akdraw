import { useMemo } from 'react';

interface GridProps {
  type: 'dot' | 'line';
  viewport: { x: number; y: number; zoom: number };
  color: string;
  size: number;
}

export default function Grid({ type, viewport, color, size }: GridProps) {
  const pattern = useMemo(() => {
    const scaledSize = size * viewport.zoom;
    const offsetX = viewport.x % scaledSize;
    const offsetY = viewport.y % scaledSize;

    if (type === 'dot') {
      return (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
            backgroundSize: `${scaledSize}px ${scaledSize}px`,
            backgroundPosition: `${offsetX}px ${offsetY}px`,
          }}
        />
      );
    }

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <pattern
            id="grid"
            width={scaledSize}
            height={scaledSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${scaledSize} 0 L 0 0 0 ${scaledSize}`}
              fill="none"
              stroke={color}
              strokeWidth={0.5 / viewport.zoom}
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#grid)"
          style={{
            transform: `translate(${offsetX}px, ${offsetY}px)`,
          }}
        />
      </svg>
    );
  }, [type, viewport, color, size]);

  return pattern;
}

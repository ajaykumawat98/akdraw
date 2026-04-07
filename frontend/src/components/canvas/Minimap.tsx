import { useCanvasStore } from '@/stores/canvasStore';

export default function Minimap() {
  const { objects, viewport, setViewport } = useCanvasStore();

  // Calculate bounds of all objects
  const bounds = objects.reduce(
    (acc, obj) => ({
      minX: Math.min(acc.minX, obj.x),
      minY: Math.min(acc.minY, obj.y),
      maxX: Math.max(acc.maxX, obj.x + (obj.width || 0)),
      maxY: Math.max(acc.maxY, obj.y + (obj.height || 0)),
    }),
    { minX: 0, minY: 0, maxX: 1000, maxY: 1000 }
  );

  const width = 200;
  const height = 150;
  const scale = Math.min(
    width / (bounds.maxX - bounds.minX + 200),
    height / (bounds.maxY - bounds.minY + 200)
  );

  const viewportRect = {
    x: -viewport.x * scale + width / 2,
    y: -viewport.y * scale + height / 2,
    width: window.innerWidth * scale / viewport.zoom,
    height: window.innerHeight * scale / viewport.zoom,
  };

  return (
    <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg border p-2 z-40">
      <div
        className="relative bg-gray-50 rounded overflow-hidden"
        style={{ width, height }}
      >
        {/* Object previews */}
        {objects
          .filter((obj) => !obj.isDeleted)
          .map((obj) => (
            <div
              key={obj.id}
              className="absolute bg-gray-300 rounded-sm"
              style={{
                left: (obj.x - bounds.minX + 100) * scale,
                top: (obj.y - bounds.minY + 100) * scale,
                width: Math.max((obj.width || 50) * scale, 4),
                height: Math.max((obj.height || 50) * scale, 4),
                backgroundColor:
                  obj.type === 'text'
                    ? '#3B82F6'
                    : obj.type === 'shape'
                    ? '#10B981'
                    : '#9CA3AF',
              }}
            />
          ))}

        {/* Viewport indicator */}
        <div
          className="absolute border-2 border-primary-600 bg-primary-100/30"
          style={{
            left: viewportRect.x,
            top: viewportRect.y,
            width: viewportRect.width,
            height: viewportRect.height,
          }}
        />
      </div>
    </div>
  );
}

import { useCanvasStore } from '@/stores/canvasStore';
import { X, Palette, Type, Layout, Sliders } from 'lucide-react';

const colors = [
  '#000000', '#1f2937', '#dc2626', '#ea580c', '#d97706',
  '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#db2777',
];

export default function PropertiesPanel() {
  const { selection, objects, currentTool, setToolOptions } = useCanvasStore();
  const selectedObjects = objects.filter((obj) => selection.selectedIds.includes(obj.id));
  const hasSelection = selectedObjects.length > 0;

  if (!hasSelection && currentTool === 'select') return null;

  const object = selectedObjects[0];

  return (
    <div className="absolute top-20 right-4 w-64 bg-white rounded-xl shadow-lg border p-4 z-40">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          {hasSelection ? 'Properties' : 'Tool Options'}
        </h3>
      </div>

      {hasSelection && (
        <>
          {/* Fill Color */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Fill</label>
            <div className="flex flex-wrap gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {/* Update fill */}}
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Stroke Color */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Stroke</label>
            <div className="flex flex-wrap gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {/* Update stroke */}}
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Opacity */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Opacity</label>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue={object?.style?.opacity || 100}
              className="w-full"
            />
          </div>

          {/* Stroke Width */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Stroke Width</label>
            <div className="flex gap-2">
              {[1, 2, 4, 8].map((width) => (
                <button
                  key={width}
                  onClick={() => {/* Update width */}}
                  className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                >
                  {width}px
                </button>
              ))}
            </div>
          </div>

          {/* Stroke Style */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Style</label>
            <div className="flex gap-2">
              {['solid', 'dashed', 'dotted'].map((style) => (
                <button
                  key={style}
                  onClick={() => {/* Update style */}}
                  className="px-3 py-1 border rounded text-sm capitalize hover:bg-gray-50"
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Tool options when no selection */}
      {!hasSelection && (
        <div className="text-sm text-gray-500">
          Select an object to edit its properties
        </div>
      )}
    </div>
  );
}

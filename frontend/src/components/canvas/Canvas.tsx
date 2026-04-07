import { useRef, useEffect, useCallback } from 'react';
import { useCanvasStore } from '@/stores/canvasStore';
import { useCanvasEngine } from '@/hooks/useCanvasEngine';
import CanvasObject from './CanvasObject';
import SelectionBox from './SelectionBox';
import Grid from './Grid';

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    objects,
    viewport,
    selection,
    backgroundColor,
    showGrid,
    gridType,
    collaborators,
  } = useCanvasStore();

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    screenToCanvas,
  } = useCanvasEngine(containerRef);

  // Transform style for the canvas content
  const transformStyle = {
    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    transformOrigin: '0 0',
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden canvas-container"
      style={{ backgroundColor }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Grid */}
      {showGrid && gridType !== 'none' && (
        <Grid
          type={gridType}
          viewport={viewport}
          color={gridType === 'dot' ? '#d4d4d4' : '#e5e5e5'}
          size={20}
        />
      )}

      {/* Canvas Content */}
      <div
        className="absolute inset-0"
        style={transformStyle}
      >
        {/* Render all objects */}
        {objects
          .filter((obj) => !obj.isDeleted)
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((obj) => (
            <CanvasObject
              key={obj.id}
              object={obj}
              isSelected={selection.selectedIds.includes(obj.id)}
            />
          ))}

        {/* Selection box for multi-select */}
        {selection.selectionBox && (
          <SelectionBox box={selection.selectionBox} />
        )}
      </div>

      {/* Collaborator cursors (rendered on top, not transformed) */}
      {collaborators.map((collab) =>
        collab.cursor ? (
          <div
            key={collab.userId}
            className="absolute pointer-events-none z-50"
            style={{
              left: collab.cursor.x * viewport.zoom + viewport.x,
              top: collab.cursor.y * viewport.zoom + viewport.y,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: collab.color }}
            >
              <path
                d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z"
                fill="currentColor"
              />
            </svg>
            <span
              className="absolute left-4 top-4 px-2 py-0.5 rounded text-xs text-white whitespace-nowrap"
              style={{ backgroundColor: collab.color }}
            >
              {collab.displayName}
            </span>
          </div>
        ) : null
      )}
    </div>
  );
}

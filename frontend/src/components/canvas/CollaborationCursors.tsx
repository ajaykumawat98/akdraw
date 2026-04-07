import { useCanvasStore } from '@/stores/canvasStore';

export default function CollaborationCursors() {
  const { collaborators, viewport } = useCanvasStore();

  return (
    <>
      {collaborators.map((collaborator) =>
        collaborator.cursor ? (
          <div
            key={collaborator.userId}
            className="fixed pointer-events-none z-50"
            style={{
              left: collaborator.cursor.x * viewport.zoom + viewport.x,
              top: collaborator.cursor.y * viewport.zoom + viewport.y,
              transition: 'all 0.1s ease-out',
            }}
          >
            {/* Cursor arrow */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: collaborator.color }}
            >
              <path
                d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z"
                fill="currentColor"
              />
            </svg>
            
            {/* User name label */}
            <span
              className="absolute left-4 top-4 px-2 py-0.5 rounded text-xs text-white whitespace-nowrap font-medium"
              style={{ backgroundColor: collaborator.color }}
            >
              {collaborator.displayName}
            </span>
          </div>
        ) : null
      )}
    </>
  );
}

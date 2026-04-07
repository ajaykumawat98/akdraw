import { useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { canvasApi } from '@/utils/api';
import { useCanvasStore } from '@/stores/canvasStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import Canvas from '@/components/canvas/Canvas';
import Toolbar from '@/components/canvas/Toolbar';
import Minimap from '@/components/canvas/Minimap';
import PropertiesPanel from '@/components/canvas/PropertiesPanel';
import ContextMenu from '@/components/canvas/ContextMenu';
import CollaborationCursors from '@/components/canvas/CollaborationCursors';
import { Loader2 } from 'lucide-react';

export default function CanvasPage() {
  const { canvasId } = useParams<{ canvasId: string }>();
  const canvasRef = useRef<HTMLDivElement>(null);
  const { setCanvas, setObjects, setLoading, setError } = useCanvasStore();
  
  // Initialize WebSocket connection
  useWebSocket(canvasId!);

  const { isLoading } = useQuery({
    queryKey: ['canvas', canvasId],
    queryFn: async () => {
      setLoading(true);
      try {
        const res = await canvasApi.get(canvasId!);
        setCanvas(res.data.canvas);
        setObjects(res.data.objects || []);
        return res.data;
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load canvas');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!canvasId,
  });

  useEffect(() => {
    // Prevent default touch behaviors for better canvas interaction
    const preventDefault = (e: Event) => {
      if (e.target === canvasRef.current || (e.target as HTMLElement)?.closest('.canvas-container')) {
        // Allow pinch zoom
        if ((e as TouchEvent).touches.length > 1) return;
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventDefault, { passive: false });
    document.addEventListener('wheel', preventDefault, { passive: false });

    return () => {
      document.removeEventListener('touchmove', preventDefault);
      document.removeEventListener('wheel', preventDefault);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
          <p className="text-gray-600">Loading canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100 relative" ref={canvasRef}>
      <Toolbar />
      <Canvas />
      <Minimap />
      <PropertiesPanel />
      <ContextMenu />
      <CollaborationCursors />
    </div>
  );
}

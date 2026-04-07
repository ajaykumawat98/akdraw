import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';
import { useCanvasStore } from '@/stores/canvasStore';

export function useWebSocket(canvasId: string) {
  const socketRef = useRef<Socket | null>(null);
  const { token, user } = useAuthStore();
  const {
    setCollaborators,
    updateCollaboratorCursor,
    addObject,
    updateObject,
    deleteObject,
  } = useCanvasStore();

  useEffect(() => {
    if (!token || !canvasId) return;

    // Connect to WebSocket server
    const socket = io(import.meta.env.VITE_API_URL || '', {
      auth: { token },
    });

    socketRef.current = socket;

    // Authenticate
    socket.emit('authenticate', token);

    // Join canvas room
    socket.emit('join_canvas', canvasId);

    // Handle events
    socket.on('joined_canvas', (data) => {
      setCollaborators(data.users.filter((u: any) => u.userId !== user?.id));
    });

    socket.on('user_joined', (data) => {
      if (data.user.userId !== user?.id) {
        const currentCollabs = useCanvasStore.getState().collaborators;
        if (!currentCollabs.find((c) => c.userId === data.user.userId)) {
          setCollaborators([...currentCollabs, data.user]);
        }
      }
    });

    socket.on('user_left', (data) => {
      const currentCollabs = useCanvasStore.getState().collaborators;
      setCollaborators(currentCollabs.filter((c) => c.userId !== data.userId));
    });

    socket.on('cursor_update', (data) => {
      updateCollaboratorCursor(data.userId, { x: data.x, y: data.y });
    });

    socket.on('object_created', (data) => {
      if (data.createdBy !== user?.id) {
        addObject(data.object);
      }
    });

    socket.on('object_updated', (data) => {
      if (data.updatedBy !== user?.id) {
        updateObject(data.objectId, data.updates);
      }
    });

    socket.on('object_deleted', (data) => {
      if (data.deletedBy !== user?.id) {
        deleteObject(data.objectId);
      }
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, canvasId, user?.id, setCollaborators, updateCollaboratorCursor, addObject, updateObject, deleteObject]);

  // Send cursor position
  const sendCursor = useCallback(
    (x: number, y: number) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('cursor_move', { canvasId, x, y });
      }
    },
    [canvasId]
  );

  // Send object updates
  const sendObjectCreate = useCallback(
    (object: any) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('object_create', { canvasId, object });
      }
    },
    [canvasId]
  );

  const sendObjectUpdate = useCallback(
    (objectId: string, updates: any) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('object_update', { canvasId, objectId, updates });
      }
    },
    [canvasId]
  );

  const sendObjectDelete = useCallback(
    (objectId: string) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('object_delete', { canvasId, objectId });
      }
    },
    [canvasId]
  );

  return {
    socket: socketRef.current,
    sendCursor,
    sendObjectCreate,
    sendObjectUpdate,
    sendObjectDelete,
  };
}

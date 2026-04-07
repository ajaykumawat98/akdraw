import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { objectApi } from '@/utils/api';
import { useCanvasStore } from '@/stores/canvasStore';
import type { CanvasObject } from '@/types';

export function useCanvasOperations() {
  const { canvasId } = useParams<{ canvasId: string }>();
  const queryClient = useQueryClient();
  const { addObject, updateObject: updateStoreObject, deleteObject: deleteStoreObject } = useCanvasStore();

  // Create object
  const createMutation = useMutation({
    mutationFn: (data: Partial<CanvasObject>) => objectApi.create(canvasId!, data),
    onSuccess: (res) => {
      addObject(res.data.object);
      queryClient.invalidateQueries({ queryKey: ['canvas', canvasId] });
    },
  });

  // Update object
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CanvasObject> }) =>
      objectApi.update(canvasId!, id, updates),
    onSuccess: (res) => {
      updateStoreObject(res.data.object.id, res.data.object);
    },
  });

  // Delete object
  const deleteMutation = useMutation({
    mutationFn: (id: string) => objectApi.delete(canvasId!, id),
    onSuccess: (_, id) => {
      deleteStoreObject(id);
    },
  });

  // Bulk update
  const bulkUpdateMutation = useMutation({
    mutationFn: (data: { creates?: any[]; updates?: any[]; deletes?: string[] }) =>
      objectApi.bulkUpdate(canvasId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canvas', canvasId] });
    },
  });

  const createObject = useCallback(
    (data: Partial<CanvasObject>) => {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const tempObject: CanvasObject = {
        id: tempId,
        canvasId: canvasId!,
        type: data.type!,
        x: data.x!,
        y: data.y!,
        width: data.width,
        height: data.height,
        rotation: data.rotation || 0,
        zIndex: data.zIndex || 0,
        data: data.data || {},
        style: data.style || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
      };
      addObject(tempObject);

      // API call
      createMutation.mutate(data);
      return tempId;
    },
    [canvasId, createMutation, addObject]
  );

  const updateObject = useCallback(
    (id: string, updates: Partial<CanvasObject>) => {
      updateStoreObject(id, updates);
      updateMutation.mutate({ id, updates });
    },
    [updateStoreObject, updateMutation]
  );

  const deleteObject = useCallback(
    (id: string) => {
      deleteStoreObject(id);
      deleteMutation.mutate(id);
    },
    [deleteStoreObject, deleteMutation]
  );

  return {
    createObject,
    updateObject,
    deleteObject,
    bulkUpdate: bulkUpdateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

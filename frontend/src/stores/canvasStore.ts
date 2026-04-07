import { create } from 'zustand';
import type { CanvasObject, Canvas, ObjectStyle } from '@/types';

interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

interface SelectionState {
  selectedIds: string[];
  isSelecting: boolean;
  selectionBox: { x: number; y: number; width: number; height: number } | null;
}

interface CanvasState {
  // Canvas data
  canvas: Canvas | null;
  objects: CanvasObject[];
  
  // Viewport
  viewport: ViewportState;
  
  // Selection
  selection: SelectionState;
  
  // Tool state
  currentTool: string;
  toolOptions: Record<string, any>;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  showGrid: boolean;
  gridType: 'none' | 'dot' | 'line';
  snapToGrid: boolean;
  gridSize: number;
  
  // Background
  backgroundColor: string;
  
  // Collaboration
  collaborators: Array<{
    userId: string;
    displayName: string;
    color: string;
    cursor?: { x: number; y: number };
  }>;
  
  // Actions
  setCanvas: (canvas: Canvas | null) => void;
  setObjects: (objects: CanvasObject[]) => void;
  addObject: (object: CanvasObject) => void;
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  deleteObject: (id: string) => void;
  deleteObjects: (ids: string[]) => void;
  
  // Viewport
  setViewport: (viewport: Partial<ViewportState>) => void;
  pan: (dx: number, dy: number) => void;
  zoom: (factor: number, centerX?: number, centerY?: number) => void;
  resetViewport: () => void;
  
  // Selection
  selectObject: (id: string, append?: boolean) => void;
  selectObjects: (ids: string[]) => void;
  deselectObject: (id: string) => void;
  clearSelection: () => void;
  setSelectionBox: (box: SelectionState['selectionBox']) => void;
  
  // Tool
  setTool: (tool: string) => void;
  setToolOptions: (options: Record<string, any>) => void;
  
  // UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleGrid: () => void;
  setGridType: (type: 'none' | 'dot' | 'line') => void;
  setSnapToGrid: (snap: boolean) => void;
  setBackgroundColor: (color: string) => void;
  
  // Collaboration
  setCollaborators: (collaborators: CanvasState['collaborators']) => void;
  updateCollaboratorCursor: (userId: string, cursor: { x: number; y: number }) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  canvas: null,
  objects: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  selection: { selectedIds: [], isSelecting: false, selectionBox: null },
  currentTool: 'select',
  toolOptions: {},
  isLoading: false,
  error: null,
  showGrid: true,
  gridType: 'dot',
  snapToGrid: false,
  gridSize: 20,
  backgroundColor: '#ffffff',
  collaborators: [],
  
  setCanvas: (canvas) => set({ canvas }),
  setObjects: (objects) => set({ objects }),
  addObject: (object) => set((state) => ({ objects: [...state.objects, object] })),
  updateObject: (id, updates) => set((state) => ({
    objects: state.objects.map((obj) =>
      obj.id === id ? { ...obj, ...updates } : obj
    ),
  })),
  deleteObject: (id) => set((state) => ({
    objects: state.objects.filter((obj) => obj.id !== id),
    selection: {
      ...state.selection,
      selectedIds: state.selection.selectedIds.filter((sid) => sid !== id),
    },
  })),
  deleteObjects: (ids) => set((state) => ({
    objects: state.objects.filter((obj) => !ids.includes(obj.id)),
    selection: {
      ...state.selection,
      selectedIds: state.selection.selectedIds.filter((sid) => !ids.includes(sid)),
    },
  })),
  
  setViewport: (viewport) => set((state) => ({
    viewport: { ...state.viewport, ...viewport },
  })),
  pan: (dx, dy) => set((state) => ({
    viewport: {
      ...state.viewport,
      x: state.viewport.x + dx,
      y: state.viewport.y + dy,
    },
  })),
  zoom: (factor, centerX, centerY) => set((state) => {
    const newZoom = Math.max(0.1, Math.min(50, state.viewport.zoom * factor));
    const zoomRatio = newZoom / state.viewport.zoom;
    
    let newX = state.viewport.x;
    let newY = state.viewport.y;
    
    if (centerX !== undefined && centerY !== undefined) {
      newX = centerX - (centerX - state.viewport.x) * zoomRatio;
      newY = centerY - (centerY - state.viewport.y) * zoomRatio;
    }
    
    return {
      viewport: { x: newX, y: newY, zoom: newZoom },
    };
  }),
  resetViewport: () => set({ viewport: { x: 0, y: 0, zoom: 1 } }),
  
  selectObject: (id, append = false) => set((state) => ({
    selection: {
      ...state.selection,
      selectedIds: append
        ? state.selection.selectedIds.includes(id)
          ? state.selection.selectedIds.filter((sid) => sid !== id)
          : [...state.selection.selectedIds, id]
        : [id],
    },
  })),
  selectObjects: (ids) => set((state) => ({
    selection: { ...state.selection, selectedIds: ids },
  })),
  deselectObject: (id) => set((state) => ({
    selection: {
      ...state.selection,
      selectedIds: state.selection.selectedIds.filter((sid) => sid !== id),
    },
  })),
  clearSelection: () => set((state) => ({
    selection: { ...state.selection, selectedIds: [] },
  })),
  setSelectionBox: (box) => set((state) => ({
    selection: { ...state.selection, selectionBox: box },
  })),
  
  setTool: (tool) => set({ currentTool: tool }),
  setToolOptions: (options) => set((state) => ({
    toolOptions: { ...state.toolOptions, ...options },
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setGridType: (gridType) => set({ gridType }),
  setSnapToGrid: (snapToGrid) => set({ snapToGrid }),
  setBackgroundColor: (backgroundColor) => set({ backgroundColor }),
  
  setCollaborators: (collaborators) => set({ collaborators }),
  updateCollaboratorCursor: (userId, cursor) => set((state) => ({
    collaborators: state.collaborators.map((c) =>
      c.userId === userId ? { ...c, cursor } : c
    ),
  })),
}));

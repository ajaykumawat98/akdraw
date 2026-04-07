import { useCallback, useRef, useState } from 'react';
import { useCanvasStore } from '@/stores/canvasStore';
import { useCanvasOperations } from './useCanvasOperations';

interface Point {
  x: number;
  y: number;
}

export function useCanvasEngine(containerRef: React.RefObject<HTMLDivElement>) {
  const {
    viewport,
    setViewport,
    pan,
    zoom: doZoom,
    currentTool,
    selectObject,
    clearSelection,
    setSelectionBox,
    selection,
  } = useCanvasStore();

  const { createObject } = useCanvasOperations();

  const isDragging = useRef(false);
  const isPanning = useRef(false);
  const isDrawing = useRef(false);
  const dragStart = useRef<Point>({ x: 0, y: 0 });
  const lastPanPoint = useRef<Point>({ x: 0, y: 0 });

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number): Point => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };

      return {
        x: (screenX - rect.left - viewport.x) / viewport.zoom,
        y: (screenY - rect.top - viewport.y) / viewport.zoom,
      };
    },
    [viewport, containerRef]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Middle mouse or space+click for panning
      if (e.button === 1 || (e.button === 0 && e.shiftKey) || currentTool === 'hand') {
        isPanning.current = true;
        lastPanPoint.current = { x: e.clientX, y: e.clientY };
        containerRef.current?.classList.add('panning');
        e.preventDefault();
        return;
      }

      // Left click for drawing/selecting
      if (e.button === 0) {
        const canvasPoint = screenToCanvas(e.clientX, e.clientY);
        dragStart.current = canvasPoint;

        if (currentTool === 'select') {
          // Check if clicking on object (would need hit detection)
          if (!e.metaKey && !e.ctrlKey) {
            clearSelection();
          }
          isDragging.current = true;
          setSelectionBox({ x: canvasPoint.x, y: canvasPoint.y, width: 0, height: 0 });
        } else if (currentTool !== 'hand') {
          // Start creating object
          isDrawing.current = true;
        }
      }
    },
    [currentTool, screenToCanvas, clearSelection, setSelectionBox, containerRef]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Handle panning
      if (isPanning.current) {
        const dx = e.clientX - lastPanPoint.current.x;
        const dy = e.clientY - lastPanPoint.current.y;
        pan(dx, dy);
        lastPanPoint.current = { x: e.clientX, y: e.clientY };
        return;
      }

      const canvasPoint = screenToCanvas(e.clientX, e.clientY);

      // Handle selection box
      if (isDragging.current && currentTool === 'select') {
        setSelectionBox({
          x: dragStart.current.x,
          y: dragStart.current.y,
          width: canvasPoint.x - dragStart.current.x,
          height: canvasPoint.y - dragStart.current.y,
        });
      }

      // Handle drawing
      if (isDrawing.current && currentTool !== 'select' && currentTool !== 'hand') {
        // Real-time preview would go here
      }
    },
    [currentTool, pan, screenToCanvas, setSelectionBox]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      containerRef.current?.classList.remove('panning');

      // End panning
      if (isPanning.current) {
        isPanning.current = false;
        return;
      }

      const canvasPoint = screenToCanvas(e.clientX, e.clientY);

      // End selection
      if (isDragging.current && currentTool === 'select') {
        isDragging.current = false;
        setSelectionBox(null);
        // TODO: Select objects within the selection box
      }

      // End drawing - create object
      if (isDrawing.current && currentTool !== 'select' && currentTool !== 'hand') {
        isDrawing.current = false;
        const width = Math.abs(canvasPoint.x - dragStart.current.x);
        const height = Math.abs(canvasPoint.y - dragStart.current.y);

        if (width > 5 || height > 5) {
          const x = Math.min(dragStart.current.x, canvasPoint.x);
          const y = Math.min(dragStart.current.y, canvasPoint.y);

          let objectType = currentTool;
          let data: Record<string, any> = {};

          // Map tools to object types
          switch (currentTool) {
            case 'text':
            case 'cli':
              objectType = 'text';
              data = {
                text: '',
                textType: currentTool === 'cli' ? 'code' : 'plain',
              };
              break;
            case 'rectangle':
            case 'diamond':
            case 'ellipse':
              objectType = 'shape';
              data = { shapeType: currentTool };
              break;
            case 'arrow':
            case 'line':
              objectType = 'arrow';
              data = {
                arrowType: currentTool === 'line' ? 'straight' : 'straight',
                startX: 0,
                startY: height / 2,
                endX: width,
                endY: height / 2,
              };
              break;
            case 'table':
              objectType = 'table';
              data = { rows: 3, cols: 3, cells: [] };
              break;
          }

          createObject({
            type: objectType as any,
            x,
            y,
            width,
            height,
            data,
            style: {},
          });
        }
      }

      isDragging.current = false;
    },
    [currentTool, screenToCanvas, setSelectionBox, createObject, containerRef]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      // Pinch zoom or Ctrl+wheel
      if (e.ctrlKey || e.metaKey) {
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        doZoom(zoomFactor, e.clientX, e.clientY);
        return;
      }

      // Pan with wheel
      pan(-e.deltaX, -e.deltaY);
    },
    [pan, doZoom]
  );

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    screenToCanvas,
  };
}

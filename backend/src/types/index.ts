export interface JWTPayload {
  userId: string;
  email: string;
  displayName: string;
}

export interface CanvasObjectData {
  id?: string;
  type: 'text' | 'shape' | 'arrow' | 'image' | 'table' | 'ink' | 'frame';
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  // Text-specific
  text?: string;
  textType?: 'plain' | 'code' | 'heading1' | 'heading2' | 'heading3' | 'callout';
  // Shape-specific
  shapeType?: 'rectangle' | 'diamond' | 'ellipse' | 'parallelogram' | 'cylinder' | 'cloud';
  // Arrow-specific
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  arrowType?: 'straight' | 'elbow' | 'curved';
  startArrowhead?: string;
  endArrowhead?: string;
  // Table-specific
  rows?: number;
  cols?: number;
  cells?: TableCell[];
  // Ink-specific
  points?: { x: number; y: number; pressure?: number }[];
  // Common
  style?: ObjectStyle;
}

export interface TableCell {
  row: number;
  col: number;
  content: string;
  style?: ObjectStyle;
}

export interface ObjectStyle {
  fillColor?: string;
  fillStyle?: 'solid' | 'hachure' | 'cross-hatch' | 'dots';
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  roughness?: number;
  opacity?: number;
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  backgroundColor?: string;
}

export interface WebSocketMessage {
  type: 'cursor' | 'object_update' | 'object_create' | 'object_delete' | 'selection' | 'chat' | 'join' | 'leave';
  canvasId: string;
  userId: string;
  payload: unknown;
  timestamp: number;
}

export interface CursorPosition {
  x: number;
  y: number;
  userId: string;
  userName: string;
  color: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

export interface Canvas {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  backgroundColor: string;
  backgroundType: 'plain' | 'dot' | 'line' | 'dark' | 'blueprint';
  viewportX: number;
  viewportY: number;
  zoom: number;
  isPublic: boolean;
  isArchived: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  owner?: User;
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

export interface CanvasObject {
  id: string;
  canvasId: string;
  type: 'text' | 'shape' | 'arrow' | 'image' | 'table' | 'ink' | 'frame';
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation: number;
  zIndex: number;
  data: Record<string, any>;
  style: ObjectStyle;
  groupId?: string;
  parentId?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface TextObjectData {
  text: string;
  textType: 'plain' | 'code' | 'heading1' | 'heading2' | 'heading3' | 'callout';
}

export interface ShapeObjectData {
  shapeType: 'rectangle' | 'diamond' | 'ellipse' | 'parallelogram' | 'cylinder' | 'cloud';
}

export interface ArrowObjectData {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  arrowType: 'straight' | 'elbow' | 'curved';
  startArrowhead?: string;
  endArrowhead?: string;
}

export interface TableCell {
  row: number;
  col: number;
  content: string;
  style?: ObjectStyle;
}

export interface TableObjectData {
  rows: number;
  cols: number;
  cells: TableCell[];
}

export interface InkPoint {
  x: number;
  y: number;
  pressure?: number;
}

export interface InkObjectData {
  points: InkPoint[];
  strokeWidth: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ToolType = 
  | 'select' 
  | 'hand' 
  | 'text' 
  | 'cli'
  | 'rectangle' 
  | 'diamond' 
  | 'ellipse'
  | 'arrow'
  | 'line'
  | 'pen'
  | 'highlighter'
  | 'eraser'
  | 'table'
  | 'image';

export interface TreeNode {
  id: string;
  canvasId: string;
  parentId?: string;
  name: string;
  type: 'group' | 'frame' | 'bookmark';
  icon?: string;
  color?: string;
  bookmarkX?: number;
  bookmarkY?: number;
  bookmarkZoom?: number;
  frameObjectIds?: string[];
  sortOrder: number;
  isExpanded: boolean;
  children?: TreeNode[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  canvasId: string;
}

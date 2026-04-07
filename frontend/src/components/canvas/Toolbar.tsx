import { useCanvasStore } from '@/stores/canvasStore';
import { useAuthStore } from '@/stores/authStore';
import { Link } from 'react-router-dom';
import {
  MousePointer2,
  Hand,
  Type,
  Terminal,
  Square,
  Diamond,
  Circle,
  ArrowRight,
  Minus,
  Pencil,
  Highlighter,
  Eraser,
  Table,
  Image as ImageIcon,
  Grid3x3,
  ZoomIn,
  ZoomOut,
  Maximize,
  Users,
  Settings,
  Share,
  Network,
} from 'lucide-react';

const tools = [
  { id: 'select', icon: MousePointer2, label: 'Select (V)' },
  { id: 'hand', icon: Hand, label: 'Pan (H)' },
  { id: 'separator1', separator: true },
  { id: 'text', icon: Type, label: 'Text (T)' },
  { id: 'cli', icon: Terminal, label: 'CLI Box (C)' },
  { id: 'separator2', separator: true },
  { id: 'rectangle', icon: Square, label: 'Rectangle (R)' },
  { id: 'diamond', icon: Diamond, label: 'Diamond (D)' },
  { id: 'ellipse', icon: Circle, label: 'Ellipse (O)' },
  { id: 'separator3', separator: true },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow (A)' },
  { id: 'line', icon: Minus, label: 'Line (L)' },
  { id: 'separator4', separator: true },
  { id: 'pen', icon: Pencil, label: 'Pen (P)' },
  { id: 'highlighter', icon: Highlighter, label: 'Highlighter (M)' },
  { id: 'eraser', icon: Eraser, label: 'Eraser (E)' },
];

export default function Toolbar() {
  const { currentTool, setTool, viewport, zoom, canvas, collaborators } = useCanvasStore();
  const { user } = useAuthStore();

  return (
    <>
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-white border-b flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Network className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">akdraw</span>
          </Link>
          <div className="h-6 w-px bg-gray-200" />
          <div>
            <h1 className="font-semibold text-gray-900">{canvas?.name || 'Untitled'}</h1>
            <p className="text-xs text-gray-500">Saved to cloud</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {collaborators.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
              <Users className="w-4 h-4" />
              {collaborators.length + 1} online
            </div>
          )}
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Share className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-medium text-sm">
            {user?.displayName?.[0]?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Left Toolbar */}
      <div className="absolute top-20 left-4 bg-white rounded-xl shadow-lg border p-2 flex flex-col gap-1 z-40">
        {tools.map((tool) =>
          tool.separator ? (
            <div key={tool.id} className="h-px bg-gray-200 my-1" />
          ) : (
            <button
              key={tool.id}
              onClick={() => setTool(tool.id)}
              className={`tool-btn ${currentTool === tool.id ? 'active' : ''}`}
              title={tool.label}
            >
              <tool.icon className="w-5 h-5" />
            </button>
          )
        )}
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border p-1 flex items-center gap-1 z-40">
        <button onClick={() => zoom(0.8)} className="p-1.5 hover:bg-gray-100 rounded">
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium w-16 text-center">
          {Math.round(viewport.zoom * 100)}%
        </span>
        <button onClick={() => zoom(1.25)} className="p-1.5 hover:bg-gray-100 rounded">
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="h-4 w-px bg-gray-200 mx-1" />
        <button onClick={() => useCanvasStore.getState().resetViewport()} className="p-1.5 hover:bg-gray-100 rounded">
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}

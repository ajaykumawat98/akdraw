import { useState, useEffect } from 'react';
import { useCanvasStore } from '@/stores/canvasStore';
import { useCanvasOperations } from '@/hooks/useCanvasOperations';
import { 
  Scissors, Copy, Clipboard, Trash2, 
  Type, Terminal, Heading1, Heading2, Heading3, 
  StickyNote, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline
} from 'lucide-react';

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action?: () => void;
  separator?: boolean;
  submenu?: MenuItem[];
}

export default function ContextMenu() {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const { selection, objects } = useCanvasStore();
  const { deleteObject } = useCanvasOperations();

  const selectedObjects = objects.filter((obj) => 
    selection.selectedIds.includes(obj.id)
  );
  const hasSelection = selectedObjects.length > 0;

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleClick = () => {
      setPosition(null);
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  if (!position) return null;

  const menuItems: MenuItem[] = [
    ...(hasSelection ? [
      { label: 'Cut', icon: <Scissors className="w-4 h-4" />, shortcut: 'Ctrl+X' },
      { label: 'Copy', icon: <Copy className="w-4 h-4" />, shortcut: 'Ctrl+C' },
      { label: 'Paste', icon: <Clipboard className="w-4 h-4" />, shortcut: 'Ctrl+V' },
      { separator: true },
      { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, shortcut: 'Del', action: () => {
        selection.selectedIds.forEach(id => deleteObject(id));
      }},
      { separator: true },
    ] : []),
    {
      label: 'Style',
      icon: <Type className="w-4 h-4" />,
      submenu: [
        { label: 'Plain Text', icon: <Type className="w-4 h-4" /> },
        { label: 'Code / CLI', icon: <Terminal className="w-4 h-4" /> },
        { label: 'Heading 1', icon: <Heading1 className="w-4 h-4" /> },
        { label: 'Heading 2', icon: <Heading2 className="w-4 h-4" /> },
        { label: 'Heading 3', icon: <Heading3 className="w-4 h-4" /> },
        { label: 'Callout', icon: <StickyNote className="w-4 h-4" /> },
      ],
    },
    ...(hasSelection && selectedObjects[0]?.type === 'text' ? [
      { separator: true },
      {
        label: 'Format',
        submenu: [
          { label: 'Bold', icon: <Bold className="w-4 h-4" />, shortcut: 'Ctrl+B' },
          { label: 'Italic', icon: <Italic className="w-4 h-4" />, shortcut: 'Ctrl+I' },
          { label: 'Underline', icon: <Underline className="w-4 h-4" />, shortcut: 'Ctrl+U' },
        ],
      },
      {
        label: 'Align',
        submenu: [
          { label: 'Left', icon: <AlignLeft className="w-4 h-4" />, shortcut: 'Ctrl+L' },
          { label: 'Center', icon: <AlignCenter className="w-4 h-4" />, shortcut: 'Ctrl+E' },
          { label: 'Right', icon: <AlignRight className="w-4 h-4" />, shortcut: 'Ctrl+R' },
        ],
      },
    ] : []),
  ];

  return (
    <div
      className="fixed bg-white rounded-lg shadow-xl border py-1 min-w-[200px] z-50"
      style={{ left: position.x, top: position.y }}
      onClick={(e) => e.stopPropagation()}
    >
      {menuItems.map((item, index) =>
        item.separator ? (
          <div key={index} className="h-px bg-gray-200 my-1 mx-2" />
        ) : item.submenu ? (
          <div key={index} className="group relative">
            <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between">
              <span className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </span>
              <span className="text-gray-400">›</span>
            </button>
            <div className="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-xl border py-1 min-w-[160px] hidden group-hover:block">
              {item.submenu.map((subItem, subIndex) => (
                <button
                  key={subIndex}
                  onClick={subItem.action}
                  className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    {subItem.icon}
                    {subItem.label}
                  </span>
                  {subItem.shortcut && (
                    <span className="text-xs text-gray-400">{subItem.shortcut}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            key={index}
            onClick={item.action}
            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              {item.icon}
              {item.label}
            </span>
            {item.shortcut && (
              <span className="text-xs text-gray-400">{item.shortcut}</span>
            )}
          </button>
        )
      )}
    </div>
  );
}

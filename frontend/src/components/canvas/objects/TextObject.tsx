import { memo, useState, useRef, useCallback } from 'react';
import type { CanvasObject, TextObjectData } from '@/types';
import { useCanvasStore } from '@/stores/canvasStore';

interface TextObjectProps {
  object: CanvasObject;
}

function TextObjectComponent({ object }: TextObjectProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState((object.data as TextObjectData).text || '');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { currentTool } = useCanvasStore();

  const data = object.data as TextObjectData;
  const isCli = data.textType === 'code' || data.textType === 'cli';
  const isHeading = data.textType?.startsWith('heading');

  const getFontSize = () => {
    switch (data.textType) {
      case 'heading1': return 32;
      case 'heading2': return 24;
      case 'heading3': return 20;
      case 'code':
      case 'cli': return 14;
      default: return 16;
    }
  };

  const getFontFamily = () => {
    if (isCli) return 'Fira Code, Consolas, monospace';
    return 'Inter, system-ui, sans-serif';
  };

  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    padding: isCli ? '12px' : '8px',
    fontSize: getFontSize(),
    fontFamily: getFontFamily(),
    fontWeight: isHeading || object.style?.bold ? 'bold' : 'normal',
    fontStyle: object.style?.italic ? 'italic' : 'normal',
    color: object.style?.strokeColor || '#1f2937',
    backgroundColor: isCli ? '#f3f4f6' : object.style?.backgroundColor || 'transparent',
    border: isCli ? '1px solid #e5e7eb' : 'none',
    borderRadius: isCli ? '6px' : '0',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  };

  const handleDoubleClick = useCallback(() => {
    if (currentTool === 'select') {
      setIsEditing(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [currentTool]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  return (
    <div className="h-full" onDoubleClick={handleDoubleClick}>
      {isEditing ? (
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          style={{
            ...style,
            resize: 'none',
            outline: '2px solid #4F46E5',
          }}
          className="w-full h-full"
        />
      ) : (
        <div style={style} className="overflow-hidden">
          {text}
        </div>
      )}
    </div>
  );
}

export default memo(TextObjectComponent);

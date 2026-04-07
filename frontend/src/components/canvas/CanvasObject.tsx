import { memo } from 'react';
import type { CanvasObject as CanvasObjectType } from '@/types';
import TextObject from './objects/TextObject';
import ShapeObject from './objects/ShapeObject';
import ArrowObject from './objects/ArrowObject';
import InkObject from './objects/InkObject';
import TableObject from './objects/TableObject';

interface CanvasObjectProps {
  object: CanvasObjectType;
  isSelected: boolean;
}

function CanvasObjectComponent({ object, isSelected }: CanvasObjectProps) {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: object.x,
    top: object.y,
    width: object.width,
    height: object.height,
    transform: `rotate(${object.rotation || 0}deg)`,
    zIndex: object.zIndex,
    cursor: 'move',
  };

  if (isSelected) {
    baseStyle.outline = '2px solid #4F46E5';
    baseStyle.outlineOffset = '2px';
  }

  const renderObject = () => {
    switch (object.type) {
      case 'text':
        return <TextObject object={object} />;
      case 'shape':
        return <ShapeObject object={object} />;
      case 'arrow':
        return <ArrowObject object={object} />;
      case 'ink':
        return <InkObject object={object} />;
      case 'table':
        return <TableObject object={object} />;
      default:
        return null;
    }
  };

  return (
    <div style={baseStyle} className="canvas-object">
      {renderObject()}
    </div>
  );
}

export default memo(CanvasObjectComponent);

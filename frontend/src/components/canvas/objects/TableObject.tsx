import { memo } from 'react';
import type { CanvasObject, TableObjectData } from '@/types';

interface TableObjectProps {
  object: CanvasObject;
}

function TableObjectComponent({ object }: TableObjectProps) {
  const data = object.data as TableObjectData;
  const rows = data.rows || 3;
  const cols = data.cols || 3;
  const cells = data.cells || [];

  const cellWidth = (object.width || 300) / cols;
  const cellHeight = (object.height || 150) / rows;

  const getCellContent = (row: number, col: number) => {
    const cell = cells.find((c) => c.row === row && c.col === col);
    return cell?.content || '';
  };

  return (
    <table className="border-collapse w-full h-full" style={{ backgroundColor: 'white' }}>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: cols }).map((_, colIndex) => (
              <td
                key={colIndex}
                className="border border-gray-300 p-2 text-sm"
                style={{
                  width: cellWidth,
                  height: cellHeight,
                  backgroundColor: rowIndex === 0 ? '#f3f4f6' : 'white',
                  fontWeight: rowIndex === 0 ? 'bold' : 'normal',
                }}
              >
                {getCellContent(rowIndex, colIndex)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default memo(TableObjectComponent);

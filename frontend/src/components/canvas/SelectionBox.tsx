interface SelectionBoxProps {
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export default function SelectionBox({ box }: SelectionBoxProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: Math.min(box.x, box.x + box.width),
    top: Math.min(box.y, box.y + box.height),
    width: Math.abs(box.width),
    height: Math.abs(box.height),
    border: '2px dashed #4F46E5',
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    pointerEvents: 'none',
  };

  return <div style={style} />;
}

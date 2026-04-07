import { useMemo } from 'react';
import { useCanvasStore } from '@/stores/canvasStore';

interface AutoCompleteProps {
  query: string;
  position: { x: number; y: number };
  onSelect: (word: string) => void;
  onClose: () => void;
}

export default function AutoComplete({ query, position, onSelect, onClose }: AutoCompleteProps) {
  const { objects } = useCanvasStore();

  // Extract all words from canvas objects
  const canvasWords = useMemo(() => {
    const words = new Set<string>();
    objects.forEach((obj) => {
      if (obj.type === 'text') {
        const text = obj.data.text || '';
        text.split(/\s+/).forEach((word) => {
          if (word.length >= 2) {
            words.add(word);
          }
        });
      }
    });
    return Array.from(words);
  }, [objects]);

  // Filter suggestions based on query
  const suggestions = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    return canvasWords
      .filter((word) => word.toLowerCase().startsWith(lowerQuery) && word.toLowerCase() !== lowerQuery)
      .slice(0, 7);
  }, [canvasWords, query]);

  if (suggestions.length === 0) return null;

  return (
    <div
      className="fixed bg-white border rounded-lg shadow-lg py-1 z-50 min-w-[150px]"
      style={{ left: position.x, top: position.y }}
    >
      {suggestions.map((word, index) => (
        <button
          key={index}
          onClick={() => onSelect(word)}
          className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
        >
          <span>
            <span className="font-bold">{word.slice(0, query.length)}</span>
            <span>{word.slice(query.length)}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

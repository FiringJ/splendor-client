'use client';

import type { AIControlProps } from '../../types/components';
import { useGameStore } from '../../store/gameStore';

export const AIControl = ({ onToggle }: AIControlProps) => {
  const isAIEnabled = useGameStore(state => state.isAIEnabled);

  const handleToggle = () => {
    const action = {
      type: 'TOGGLE_AI' as const,
      payload: {
        enabled: !isAIEnabled,
      },
    };
    onToggle(action);
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        px-4 py-2 rounded-lg
        ${isAIEnabled ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}
        hover:opacity-80 transition-opacity
      `}
    >
      {isAIEnabled ? 'AI 已开启' : 'AI 已关闭'}
    </button>
  );
}; 
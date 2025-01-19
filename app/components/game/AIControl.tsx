import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const AIControl: React.FC = () => {
  const { isAIEnabled, enableAI } = useGameStore();

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isAIEnabled}
          onChange={(e) => enableAI(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className="ml-2 text-sm font-medium text-gray-900">
          启用AI玩家
        </span>
      </label>
    </div>
  );
}; 
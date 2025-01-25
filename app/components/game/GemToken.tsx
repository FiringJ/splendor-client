'use client';

import type { GemTokenProps } from '../../types/components';
import { GemType } from '../../types/game';
import { useGameStore } from '../../store/gameStore';
import { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';
import { GameValidator } from '../../lib/game/validator';

const gemColors: Record<GemType, string> = {
  red: 'bg-red-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  white: 'bg-gray-100',
  black: 'bg-gray-800',
  gold: 'bg-yellow-400',
};

const gemNames: Record<GemType, string> = {
  red: '红宝石',
  green: '祖母绿',
  blue: '蓝宝石',
  white: '钻石',
  black: '玛瑙',
  gold: '黄金',
};

export const GemToken = ({ gems, onSelect, disabled }: GemTokenProps) => {
  const gameState = useGameStore(state => state.gameState);
  const [selectedGems, setSelectedGems] = useState<Record<GemType, number>>({
    red: 0,
    green: 0,
    blue: 0,
    white: 0,
    black: 0,
    gold: 0,
  });

  const handleGemClick = useCallback((gemType: GemType) => {
    if (!gameState || disabled) return;

    const newSelectedGems = { ...selectedGems };
    newSelectedGems[gemType] = (newSelectedGems[gemType] || 0) + 1;

    const action = {
      type: 'TAKE_GEMS' as const,
      payload: {
        gems: newSelectedGems,
      },
    };

    if (GameValidator.canTakeGems(gameState, action)) {
      setSelectedGems(newSelectedGems);
      onSelect(action);
    }
  }, [gameState, selectedGems, onSelect, disabled]);

  const debouncedGemClick = debounce(handleGemClick, 200);

  return (
    <div className="grid grid-cols-3 gap-4">
      {Object.entries(gems).map(([type, count]) => {
        const gemType = type as GemType;
        if (gemType === 'gold') return null; // 不显示黄金宝石

        return (
          <button
            key={type}
            className={`
              relative w-20 h-20 rounded-full
              ${gemColors[gemType]}
              ${count > 0 && !disabled ? 'cursor-pointer hover:opacity-80' : 'opacity-50 cursor-not-allowed'}
              transition-all duration-200
              flex items-center justify-center
              text-white font-bold text-2xl
            `}
            onClick={() => debouncedGemClick(gemType)}
            disabled={count === 0 || disabled}
            title={`${gemNames[gemType]} (${count})`}
          >
            {count}
          </button>
        );
      })}
    </div>
  );
}; 
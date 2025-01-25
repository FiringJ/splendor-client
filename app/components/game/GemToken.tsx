'use client';

import { GemType } from '../../types/game';
import { useGameStore } from '../../store/gameStore';
import { debounce } from 'lodash';
import { useCallback } from 'react';

interface GemTokenProps {
  gems?: Partial<Record<GemType, number>>;
  disabled?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const gemColorMap: Record<GemType, string> = {
  diamond: 'bg-white border-2',
  sapphire: 'bg-blue-500',
  emerald: 'bg-green-500',
  ruby: 'bg-red-500',
  onyx: 'bg-gray-800',
  gold: 'bg-yellow-400',
};

const gemNameMap: Record<GemType, string> = {
  diamond: '钻石',
  sapphire: '蓝宝石',
  emerald: '祖母绿',
  ruby: '红宝石',
  onyx: '玛瑙',
  gold: '黄金',
};

export const GemToken = ({ gems = {}, disabled, onConfirm, onCancel }: GemTokenProps) => {
  const selectedGems = useGameStore(state => state.selectedGems);
  const selectGem = useGameStore(state => state.selectGem);

  // 使用 useCallback 包装防抖函数，避免重复创建
  const handleGemClick = useCallback((gemType: GemType) => {
    const debouncedFn = debounce(() => {
      if (!disabled) {
        selectGem(gemType);
      }
    }, 20);
    debouncedFn();
    return () => debouncedFn.cancel();
  }, [disabled, selectGem]);

  const hasSelectedGems = Object.values(selectedGems).some(count => count > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 justify-center items-center p-4">
        {(Object.keys(gemColorMap) as GemType[]).map((gemType) => {
          const count = gems[gemType] ?? 0;
          const selectedCount = selectedGems[gemType] ?? 0;
          const remainingCount = count - selectedCount;
          const isSelected = selectedCount > 0;

          return (
            <button
              key={gemType}
              className={`
                relative w-20 h-20 rounded-full
                ${gemColorMap[gemType]}
                ${remainingCount > 0 && !disabled ? 'cursor-pointer hover:opacity-80' : 'opacity-50 cursor-not-allowed'}
                ${isSelected ? 'ring-4 ring-yellow-400 ring-offset-2' : ''}
                transition-all duration-200
                flex items-center justify-center
                shadow-lg
              `}
              onClick={() => handleGemClick(gemType)}
              disabled={remainingCount === 0 || disabled}
              title={`${gemNameMap[gemType]} (剩余: ${remainingCount}, 已选: ${selectedCount})`}
            >
              <span className="text-2xl">{remainingCount}</span>
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold">
                  {selectedCount}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {hasSelectedGems && (
        <div className="flex justify-center gap-2">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            onClick={onCancel}
          >
            取消选择
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            onClick={onConfirm}
          >
            确认选择
          </button>
        </div>
      )}
    </div>
  );
}; 
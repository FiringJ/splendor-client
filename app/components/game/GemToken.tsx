'use client';

import { GemType } from '../../types/game';
import { debounce } from 'lodash';

interface GemTokenProps {
  gems?: Partial<Record<GemType, number>>;
  onSelect?: (gemType: GemType) => void;
  disabled?: boolean;
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

export const GemToken = ({ gems = {}, onSelect, disabled }: GemTokenProps) => {
  const debouncedGemClick = debounce((gemType: GemType) => {
    if (onSelect && !disabled) {
      onSelect(gemType);
    }
  }, 300);

  return (
    <div className="flex flex-wrap gap-4 justify-center items-center p-4">
      {(Object.keys(gemColorMap) as GemType[]).map((gemType) => {
        const count = gems[gemType] ?? 0;
        return (
          <button
            key={gemType}
            className={`
              relative w-20 h-20 rounded-full
              ${gemColorMap[gemType]}
              ${count > 0 && !disabled ? 'cursor-pointer hover:opacity-80' : 'opacity-50 cursor-not-allowed'}
              transition-all duration-200
              flex items-center justify-center
              shadow-lg
            `}
            onClick={() => debouncedGemClick(gemType)}
            disabled={count === 0 || disabled}
            title={`${gemNameMap[gemType]} (${count})`}
          >
            <span className="text-2xl">{count}</span>
          </button>
        );
      })}
    </div>
  );
}; 
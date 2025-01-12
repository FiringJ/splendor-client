'use client';

import { GemType } from '../../types/game';
import { useGameStore } from '../../store/gameStore';
import { useState } from 'react';

interface GemTokenProps {
  gems: Record<GemType, number>;
}

const gemColors: Record<GemType, string> = {
  diamond: 'text-gray-700 bg-white border-2 border-gray-300',
  sapphire: 'text-white bg-blue-500',
  emerald: 'text-white bg-green-500',
  ruby: 'text-white bg-red-500',
  onyx: 'text-white bg-gray-800',
  gold: 'text-black bg-yellow-400'
};

export const GemToken = ({ gems }: GemTokenProps) => {
  const { takeGems } = useGameStore();
  const [selectedGems, setSelectedGems] = useState<Partial<Record<GemType, number>>>({});

  const handleGemClick = (gemType: GemType) => {
    const currentCount = selectedGems[gemType] || 0;
    const availableGems = gems[gemType];

    // 如果已经选择了2个同色宝石，取消选择
    if (currentCount === 2) {
      const newSelected = { ...selectedGems };
      delete newSelected[gemType];
      setSelectedGems(newSelected);
      return;
    }

    // 检查是否可以选择更多宝石
    const totalSelected = Object.values(selectedGems).reduce((a, b) => a + (b || 0), 0);
    const sameColorCount = Math.max(...Object.values(selectedGems).map(v => v || 0));

    // 如果已经选择了3个不同颜色的宝石，不能再选
    if (totalSelected >= 3 && currentCount === 0) return;

    // 如果已经选择了2个同色宝石，不能选择其他颜色
    if (sameColorCount === 2 && currentCount === 0) return;

    // 如果已经选择了其他颜色，不能选择2个同色
    if (totalSelected > 0 && currentCount === 1) return;

    // 更新选择的宝石
    if (availableGems > currentCount) {
      setSelectedGems({
        ...selectedGems,
        [gemType]: currentCount + 1
      });
    }
  };

  const handleConfirm = () => {
    if (Object.keys(selectedGems).length > 0) {
      const success = takeGems(selectedGems);
      if (success) {
        setSelectedGems({});
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        {Object.entries(gems).map(([gem, count]) => (
          <div
            key={gem}
            className="flex flex-col items-center gap-2"
            onClick={() => handleGemClick(gem as GemType)}
          >
            <div className={`
              w-12 h-12 rounded-full cursor-pointer
              ${gemColors[gem as GemType]}
              flex items-center justify-center
              ${selectedGems[gem as GemType] ? 'ring-2 ring-yellow-400' : ''}
              hover:opacity-80 transition-opacity
            `}>
              {count}
            </div>
            {selectedGems[gem as GemType] && (
              <div className="text-sm font-bold">
                已选: {selectedGems[gem as GemType]}
              </div>
            )}
          </div>
        ))}
      </div>

      {Object.keys(selectedGems).length > 0 && (
        <button
          onClick={handleConfirm}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          确认选择
        </button>
      )}
    </div>
  );
}; 
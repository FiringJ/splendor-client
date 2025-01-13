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
  const { takeGems, addAction, gameState } = useGameStore();
  const [selectedGems, setSelectedGems] = useState<Partial<Record<GemType, number>>>({});

  // 计算玩家当前拥有的宝石总数
  const getCurrentPlayerGemCount = () => {
    if (!gameState) return 0;
    const currentPlayer = gameState.players[gameState.currentPlayer];
    return Object.values(currentPlayer.gems).reduce((sum, count) => sum + count, 0);
  };

  const handleGemClick = (gemType: GemType) => {
    if (gemType === 'gold') return;

    const currentCount = selectedGems[gemType] || 0;
    const availableGems = gems[gemType];
    const totalSelected = Object.values(selectedGems).reduce((a, b) => a + (b || 0), 0);
    const currentPlayerGemCount = getCurrentPlayerGemCount();

    // 检查是否会超过10个宝石限制
    if (currentPlayerGemCount + totalSelected + 1 > 10) {
      return;
    }

    // 如果已经选择了这个宝石
    if (currentCount > 0) {
      // 如果只选择了这个宝石，且可用数量>=4，则可以选择第二个
      if (Object.keys(selectedGems).length === 1 && availableGems >= 4) {
        if (currentCount === 1) {
          setSelectedGems({
            [gemType]: 2
          });
          return;
        }
      }
      // 其他情况下点击则取消选择
      const newSelected = { ...selectedGems };
      delete newSelected[gemType];
      setSelectedGems(newSelected);
      return;
    }

    // 尝试选择第一个宝石
    if (currentCount === 0) {
      // 如果已经选择了3个不同颜色的宝石，不能再选
      if (totalSelected >= 3) {
        return;
      }

      // 如果剩余宝石数量大于等于4个，允许选择2个
      if (availableGems >= 4) {
        setSelectedGems({
          ...selectedGems,
          [gemType]: 1
        });
      } else if (availableGems > 0) {
        // 否则只能选择1个
        setSelectedGems({
          ...selectedGems,
          [gemType]: 1
        });
      }
      return;
    }
  };

  // 双击处理函数，用于快速选择2个同色宝石
  const handleDoubleClick = (gemType: GemType) => {
    if (gemType === 'gold') return;

    const availableGems = gems[gemType];
    const currentPlayerGemCount = getCurrentPlayerGemCount();

    // 检查是否会超过10个宝石限制
    if (currentPlayerGemCount + 2 > 10) {
      return;
    }

    // 检查是否有足够的宝石可选
    if (availableGems < 4) {
      return;
    }

    const currentCount = selectedGems[gemType] || 0;

    // 只有当没有选择其他宝石，且该颜色宝石数量>=4时，才能选择2个
    if (Object.keys(selectedGems).length === 0 ||
      (Object.keys(selectedGems).length === 1 && selectedGems[gemType])) {
      if (availableGems >= 4) {
        setSelectedGems({
          [gemType]: currentCount === 2 ? 0 : 2
        });
      }
    }
  };

  const handleConfirm = () => {
    if (Object.keys(selectedGems).length === 0) {
      return;
    }

    const success = takeGems(selectedGems);

    if (success && gameState) {
      const currentPlayer = gameState.players[gameState.currentPlayer];
      addAction({
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        type: 'takeGems',
        details: {
          gems: selectedGems
        }
      });
      setSelectedGems({});
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-6 gap-2">
        {Object.entries(gems).map(([gem, count]) => (
          <div
            key={gem}
            className="flex flex-col items-center"
            onClick={() => handleGemClick(gem as GemType)}
            onDoubleClick={() => handleDoubleClick(gem as GemType)}
          >
            <div className={`
              aspect-square w-full rounded-full cursor-pointer
              ${gemColors[gem as GemType]}
              flex items-center justify-center
              ${selectedGems[gem as GemType] ? 'ring-2 ring-yellow-400' : ''}
              hover:opacity-80 transition-opacity
              text-sm
            `}>
              {count}
            </div>
            {selectedGems[gem as GemType] && (
              <div className="text-xs font-bold text-center whitespace-nowrap mt-1">
                已选: {selectedGems[gem as GemType]}
              </div>
            )}
          </div>
        ))}
      </div>

      {Object.keys(selectedGems).length > 0 && (
        <button
          onClick={handleConfirm}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-fit"
        >
          确认选择
        </button>
      )}
    </div>
  );
}; 
'use client';

import { GemType } from '../../types/game';
import { useGameStore } from '../../store/gameStore';
import { useState } from 'react';

interface GemTokenProps {
  gems?: Partial<Record<GemType, number>>;
  disabled?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const gemColorMap: Record<GemType, string> = {
  diamond: 'from-white to-gray-200 border-gray-200 shadow-gray-300/50',
  sapphire: 'from-blue-400 to-blue-600 border-blue-300 shadow-blue-500/50',
  emerald: 'from-green-400 to-green-600 border-green-300 shadow-green-500/50',
  ruby: 'from-red-400 to-red-600 border-red-300 shadow-red-500/50',
  onyx: 'from-gray-700 to-gray-900 border-gray-600 shadow-gray-800/50',
  gold: 'from-yellow-300 to-yellow-500 border-yellow-200 shadow-yellow-400/50',
};

const gemNameMap: Record<GemType, string> = {
  diamond: '钻石',
  sapphire: '蓝宝石',
  emerald: '祖母绿',
  ruby: '红宝石',
  onyx: '黑曜石',
  gold: '黄金',
};

export const GemToken = ({ gems = {}, disabled, onConfirm, onCancel }: GemTokenProps) => {
  const selectedGems = useGameStore(state => state.selectedGems);
  const addSelectedGem = useGameStore(state => state.addSelectedGem);
  const removeSelectedGem = useGameStore(state => state.removeSelectedGem);
  const loading = useGameStore(state => state.loading);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGemClick = (gemType: GemType) => {
    if (disabled || loading || isSubmitting) return;

    // 检查同色宝石是否已经选了2个
    const currentCount = selectedGems[gemType] || 0;
    if (currentCount >= 2) return;

    // 检查已选的不同宝石颜色数量
    const differentColors = Object.keys(selectedGems).length;
    const totalSelected = Object.values(selectedGems).reduce((a, b) => a + b, 0);

    // 如果选中的宝石种类已有3种且不是已选择的宝石
    if (differentColors >= 3 && !selectedGems[gemType]) return;

    // 如果已经选了2个同色宝石，不能再选其他的
    if (Object.values(selectedGems).some(count => count === 2) && 
        (!selectedGems[gemType] || selectedGems[gemType] === 0)) return;

    // 如果总选择超过3个
    if (totalSelected >= 3 && !selectedGems[gemType]) return;

    addSelectedGem(gemType);
  };

  const handleGemRightClick = (gemType: GemType, e: React.MouseEvent) => {
    e.preventDefault(); // 防止弹出右键菜单
    if (disabled || loading || isSubmitting) return;
    
    const currentCount = selectedGems[gemType] || 0;
    if (currentCount > 0) {
      removeSelectedGem(gemType);
    }
    return false;
  };

  const handleConfirm = async () => {
    if (onConfirm && !disabled && !loading && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onConfirm();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const hasSelectedGems = Object.values(selectedGems).some(count => count > 0);
  
  // 将宝石分为两行显示
  const gemTypes = Object.keys(gemColorMap) as GemType[];
  const firstRow = gemTypes.slice(0, 3);
  const secondRow = gemTypes.slice(3);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {/* 两行显示宝石代币 */}
        <div className="grid grid-cols-3 gap-2 justify-items-center">
          {firstRow.map((gemType) => renderGem(gemType))}
        </div>
        <div className="grid grid-cols-3 gap-2 justify-items-center">
          {secondRow.map((gemType) => renderGem(gemType))}
        </div>
      </div>

      {hasSelectedGems && (
        <div className="flex justify-center gap-2">
          <button
            className="px-3 py-1.5 bg-red-500 text-white rounded-md text-xs
                      hover:bg-red-600 active:bg-red-700
                      shadow-md shadow-red-500/30
                      hover:shadow-lg hover:shadow-red-500/40
                      active:shadow-sm
                      transform active:scale-95
                      transition-all duration-200
                      font-medium
                      disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onCancel}
            disabled={loading || isSubmitting}
          >
            取消
          </button>
          <button
            className="px-3 py-1.5 bg-green-500 text-white rounded-md text-xs
                      hover:bg-green-600 active:bg-green-700
                      shadow-md shadow-green-500/30
                      hover:shadow-lg hover:shadow-green-500/40
                      active:shadow-sm
                      transform active:scale-95
                      transition-all duration-200
                      font-medium
                      disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleConfirm}
            disabled={loading || isSubmitting}
          >
            {isSubmitting ? '处理中...' : '确认'}
          </button>
        </div>
      )}
    </div>
  );
  
  function renderGem(gemType: GemType) {
    const count = gems[gemType] ?? 0;
    const selectedCount = selectedGems[gemType] ?? 0;
    const remainingCount = count - selectedCount;
    const isSelected = selectedCount > 0;
    
    // 黄金宝石无法被选择
    const isGoldGem = gemType === 'gold';
    const isDisabled = remainingCount === 0 || disabled || isGoldGem || loading || isSubmitting;
    
    return (
      <div key={gemType} className="flex flex-col items-center">
        <button
          className={`
            relative w-14 h-14 rounded-full
            bg-gradient-to-br ${gemColorMap[gemType]}
            border
            ${remainingCount > 0 && !isDisabled ? 'cursor-pointer transform hover:-translate-y-1 hover:shadow-lg' : 'opacity-50 cursor-not-allowed'}
            ${isSelected ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}
            transition-all duration-300 ease-in-out
            flex items-center justify-center
            shadow-md
            before:content-[''] before:absolute before:inset-[3px] before:rounded-full before:bg-gradient-to-tl before:from-white/20 before:to-transparent before:opacity-80
          `}
          onClick={() => !isDisabled && handleGemClick(gemType)}
          onContextMenu={(e) => !isDisabled && handleGemRightClick(gemType, e)}
          disabled={isDisabled}
          title={`${gemNameMap[gemType]} ${isGoldGem ? '(无法直接获取)' : `(剩余: ${remainingCount}, 已选: ${selectedCount})`}${isSelected ? '，右键点击减少' : ''}`}
        >
          <span className="text-lg font-bold relative z-10 text-white drop-shadow-md">
            {remainingCount}
          </span>
          {isSelected && (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-yellow-400 rounded-full 
                          flex items-center justify-center text-xs font-bold 
                          shadow-md border border-yellow-300 animate-pulse">
              {selectedCount}
            </div>
          )}
        </button>
        <p className="mt-1 text-xs font-medium text-gray-600 truncate w-14 text-center">
          {gemNameMap[gemType]}
          {isGoldGem && <span className="block text-[10px] text-yellow-600">预留时获得</span>}
        </p>
      </div>
    );
  }
}; 
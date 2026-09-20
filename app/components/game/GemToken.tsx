'use client';

import { GemType } from '../../types/game';
import { useGameStore } from '../../store/gameStore';
import { useState } from 'react';
import { useSound } from '../../hooks/useSound';

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
  const playSound = useSound();

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

    // REQ-012: 播放选择音效
    playSound('select_gem');
    addSelectedGem(gemType);
  };

  const handleGemRightClick = (gemType: GemType, e: React.MouseEvent) => {
    e.preventDefault(); // 防止弹出右键菜单
    if (disabled || loading || isSubmitting) return false; // 修改：确保返回 boolean

    const currentCount = selectedGems[gemType] || 0;
    if (currentCount > 0) {
      // REQ-012: 播放取消选择音效
      playSound('deselect_gem');
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

  const gemTypes = Object.keys(gemColorMap) as GemType[];
  const firstRow = gemTypes.slice(0, 3);
  const secondRow = gemTypes.slice(3);

  return (
    <div className="flex flex-col gap-2 md:gap-3">
      <div className="flex flex-col gap-1.5 md:gap-2">
        {/* 两行显示宝石代币 - REQ-001: 调整 gap */}
        <div className="grid grid-cols-3 gap-1.5 md:gap-2 justify-items-center">
          {firstRow.map((gemType) => renderGem(gemType))}
        </div>
        <div className="grid grid-cols-3 gap-1.5 md:gap-2 justify-items-center">
          {secondRow.map((gemType) => renderGem(gemType))}
        </div>
      </div>

      {hasSelectedGems && (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            className="btn-ghost"
            onClick={onCancel}
            disabled={loading || isSubmitting}
          >
            取消
          </button>
          <button
            type="button"
            className="btn-confirm"
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
            relative 
            w-14 h-14 rounded-full
            bg-gradient-to-br ${gemColorMap[gemType]}
            border
            ${remainingCount > 0 && !isDisabled ? 'cursor-pointer transform hover:-translate-y-1 hover:shadow-lg' : 'cursor-not-allowed'}
            ${isGoldGem ? 'opacity-70' : ''}
            ${isSelected ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}
            transition-all duration-300 ease-in-out
            flex items-center justify-center
            shadow-md
            before:content-[''] before:absolute before:inset-[2px] md:before:inset-[3px] before:rounded-full before:bg-gradient-to-tl before:from-white/20 before:to-transparent before:opacity-80
          `}
          onClick={() => !isDisabled && handleGemClick(gemType)}
          onContextMenu={(e) => !isDisabled && handleGemRightClick(gemType, e)}
          disabled={isDisabled}
          title={`${gemNameMap[gemType]} ${isGoldGem ? '(无法直接获取)' : `(剩余: ${remainingCount}, 已选: ${selectedCount})`}${isSelected ? '，右键点击减少' : ''}`}
        >
          <span className={`relative z-10 text-lg font-bold drop-shadow-md ${gemType === 'diamond' || gemType === 'gold' ? 'text-slate-800' : 'text-white'}`}>
            {remainingCount}
          </span>
          {isSelected && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-amber-300 bg-amber-400 text-[10px] font-bold text-amber-950 shadow-sm">
              {selectedCount}
            </span>
          )}
        </button>
        <p className="mt-1 text-[11px] font-medium text-slate-600 truncate w-14 text-center">
          {gemNameMap[gemType]}
          {isGoldGem && <span className="block text-[10px] text-amber-600">预留时获得</span>}
        </p>
        {isSelected && !isGoldGem && (
          <button
            type="button"
            aria-label={`减少${gemNameMap[gemType]}`}
            className="btn-ghost mt-1 h-11 w-11 px-0"
            onClick={(event) => handleGemRightClick(gemType, event)}
          >
            −
          </button>
        )}
      </div>
    );
  }
}; 
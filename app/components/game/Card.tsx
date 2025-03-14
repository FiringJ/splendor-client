'use client';

import { Card as CardType, GemType } from '../../types/game';

interface CardProps {
  card: CardType;
  onPurchase?: () => void;
  onReserve?: () => void;
  disabled?: boolean;
  isCardBack?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
}

const cardColors: Record<GemType, string> = {
  diamond: 'from-gray-100 to-gray-300 border-gray-300',
  sapphire: 'from-blue-300 to-blue-600 border-blue-300',
  emerald: 'from-green-300 to-green-600 border-green-300',
  ruby: 'from-red-300 to-red-600 border-red-300',
  onyx: 'from-gray-600 to-gray-900 border-gray-700',
  gold: 'from-yellow-300 to-yellow-500 border-yellow-300'
};

const gemColors: Record<GemType, string> = {
  diamond: 'text-gray-700 bg-white border border-gray-300',
  sapphire: 'text-white bg-blue-500',
  emerald: 'text-white bg-green-500',
  ruby: 'text-white bg-red-500',
  onyx: 'text-white bg-gray-800',
  gold: 'text-black bg-yellow-400'
};

export const Card = ({ card, onPurchase, onReserve, disabled, isCardBack = false, onClick, isSelected }: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={`
      relative w-28 h-40 rounded-lg
      bg-gradient-to-br ${cardColors[card.gem]}
      border
      ${disabled ? 'opacity-60 saturate-50' : isSelected ? 'z-30' : 'hover:shadow-xl hover:-translate-y-1 hover:shadow-[0_8px_20px_-5px_rgba(0,0,0,0.25)] hover:[transform:perspective(600px)_rotateY(5deg)]'}
      transition-all duration-300 ease-out
      cursor-pointer
      ${isSelected ? 'scale-[1.2] z-30 shadow-xl shadow-black/20' : 'shadow-md shadow-black/10'}
      group
    `}>
      {/* 卡片内容容器 */}
      <div className="relative w-full h-full overflow-hidden rounded-lg backdrop-blur-sm">
        {/* 卡片发光效果 */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* 卡牌图案 */}
        <div
          className="absolute inset-0 bg-[url('/images/cards.webp')] bg-no-repeat"
          style={{
            backgroundSize: '500% 600%',
            backgroundPosition: isCardBack ?
              `${(card.level - 1) * 25}% 100%` :
              `${card.spritePosition.x * 25}% ${getBackgroundY(card) * 20}%`
          }}
        />

        {/* 卡片顶部信息 */}
        <div className="absolute top-1.5 right-1.5 left-1.5 flex justify-between items-center h-6 px-1.5
                      bg-white/50 backdrop-blur-sm rounded-md shadow-sm">
          {card.points > 0 && (
            <div className="w-5 h-5 rounded-full 
                        bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-sm
                        flex items-center justify-center
                        text-xs font-bold border border-yellow-200">
              <span className="text-white drop-shadow-sm">
                {card.points}
              </span>
            </div>
          )}
          <div className="w-5 h-5 bg-[url('/images/gems.webp')] bg-no-repeat ml-auto"
            style={{
              backgroundSize: '500% 100%',
              backgroundPosition: `${getGemSpritePosition(card.gem)}% 0%`
            }}
          />
        </div>

        {/* 卡片等级标记 */}
        <div className="absolute top-2.5 left-1.5">
          {Array(card.level).fill(0).map((_, i) => (
            <div key={i} className="w-1 h-1 bg-white rounded-full mb-0.5 shadow-sm"></div>
          ))}
        </div>

        {/* 费用区域 */}
        <div className="absolute bottom-1.5 left-1 right-1 
                      bg-white/50 backdrop-blur-sm rounded-md p-1 shadow-sm">
          <div className="flex flex-wrap items-center justify-start gap-0.5">
            {Object.entries(card.cost).map(([gem, count]) => (
              <div key={gem}
                className="flex items-center gap-0.5 bg-white/70 
                            rounded px-0.5 py-0.5 shadow-sm">
                <div className={`w-3 h-3 rounded-full ${gemColors[gem as GemType]} 
                              shadow-sm`} />
                <span className="text-xs font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 操作按钮 - 只在选中状态下显示 */}
      {isSelected && !disabled && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 
                      flex gap-1 w-28 animate-fade-in">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPurchase?.();
            }}
            className="flex-1 h-7 bg-blue-500 rounded-md
                     text-white text-xs font-medium
                     shadow-md shadow-blue-500/30
                     hover:bg-blue-600 hover:shadow-blue-600/30
                     focus:ring-1 focus:ring-blue-400 focus:ring-offset-1
                     active:transform active:scale-95
                     transition-all duration-200"
          >
            购买
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReserve?.();
            }}
            className="flex-1 h-7 bg-gray-600 rounded-md
                     text-white text-xs font-medium
                     shadow-md shadow-gray-600/30
                     hover:bg-gray-700 hover:shadow-gray-700/30
                     focus:ring-1 focus:ring-gray-500 focus:ring-offset-1
                     active:transform active:scale-95
                     transition-all duration-200"
          >
            预留
          </button>
        </div>
      )}
    </div>
  );
};

// 辅助函数：获取卡片背景的y坐标
const getBackgroundY = (card: CardType): number => {
  // 根据宝石类型确定y坐标
  const gemPositions: Record<GemType, number> = {
    sapphire: 0,  // 蓝色卡牌
    onyx: 1,      // 黑色卡牌
    ruby: 2,      // 红色卡牌
    emerald: 3,   // 绿色卡牌
    diamond: 4,   // 白色卡牌
    gold: 0       // 金色（预留）
  };
  return gemPositions[card.gem];
};

const getGemSpritePosition = (gemType: GemType): number => {
  const gemPositions: Record<GemType, number> = {
    diamond: 0,    // 白色宝石
    sapphire: 25,  // 蓝色宝石
    onyx: 50,      // 黑色宝石
    ruby: 75,      // 红色宝石
    emerald: 100,  // 绿色宝石
    gold: 0        // 金色（预留）
  };
  return gemPositions[gemType];
}; 
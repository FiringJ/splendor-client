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
  diamond: 'from-gray-100 to-gray-200 border-gray-300',
  sapphire: 'from-blue-100 to-blue-200 border-blue-300',
  emerald: 'from-green-100 to-green-200 border-green-300',
  ruby: 'from-red-100 to-red-200 border-red-300',
  onyx: 'from-gray-700 to-gray-800 border-gray-900',
  gold: 'from-yellow-100 to-yellow-200 border-yellow-300'
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
      relative w-32 h-44 rounded-xl
      bg-gradient-to-br ${cardColors[card.gem]}
      border-2
      ${disabled ? 'opacity-50' : isSelected ? '' : 'hover:shadow-2xl transform hover:-translate-y-1 hover:border-opacity-70'}
      transition-all duration-300 ease-in-out
      cursor-pointer
      ${isSelected ? 'scale-150 z-50' : ''}
    `}>
      {/* 卡片内容容器 */}
      <div className="relative w-full h-full overflow-hidden rounded-xl backdrop-blur-sm">
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
        <div className="absolute top-2 right-2 left-2 flex justify-between items-center h-7 px-1
                      bg-white bg-opacity-50 backdrop-blur-sm rounded-lg">
          {card.points > 0 && (
            <div className="w-6 h-6 rounded-full 
                        bg-white shadow-sm
                        flex items-center justify-center
                        text-sm font-bold">
              <span className="text-yellow-600">
                {card.points}
              </span>
            </div>
          )}
          <div className="w-6 h-6 bg-[url('/images/gems.webp')] bg-no-repeat ml-auto"
            style={{
              backgroundSize: '500% 100%',
              backgroundPosition: `${getGemSpritePosition(card.gem)}% 0%`
            }}
          />
        </div>

        {/* 费用区域 */}
        <div className="absolute bottom-2 left-1 right-1 
                      bg-white bg-opacity-50 backdrop-blur-sm rounded-lg p-0.5">
          <div className="flex items-center justify-start gap-0.5">
            {Object.entries(card.cost).map(([gem, count]) => (
              <div key={gem}
                className="flex items-center gap-0.5 bg-white bg-opacity-70 
                            rounded-sm px-0.5">
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
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 
                      flex gap-2 w-32">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPurchase?.();
            }}
            className="flex-1 h-8 bg-blue-500 rounded-lg
                     text-white text-sm font-medium
                     shadow-md shadow-blue-500/30
                     hover:bg-blue-600 hover:shadow-blue-600/30
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
            className="flex-1 h-8 bg-gray-600 rounded-lg
                     text-white text-sm font-medium
                     shadow-md shadow-gray-600/30
                     hover:bg-gray-700 hover:shadow-gray-700/30
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
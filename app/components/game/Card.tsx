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
      relative w-[6.5rem] h-[8.5rem] md:w-28 md:h-40 rounded-lg
      bg-gradient-to-br ${cardColors[card.gem]}
      border
      ${disabled ? 'cursor-not-allowed' : isSelected ? 'z-30' : 'hover:-translate-y-1 hover:shadow-[0_8px_20px_-5px_rgba(0,0,0,0.25)] hover:[transform:perspective(600px)_rotateY(5deg)] cursor-pointer'}
      transition-all duration-300 ease-out
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
        <div className="absolute top-1 right-1 left-1 md:top-1.5 md:right-1.5 md:left-1.5 flex justify-between items-center h-5 md:h-6 px-1 md:px-1.5
                      bg-white/50 backdrop-blur-sm rounded-md shadow-sm">
          {card.points > 0 && (
            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full 
                        bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-sm
                        flex items-center justify-center
                        text-[10px] md:text-xs font-bold border border-yellow-200">
              <span className="text-white drop-shadow-sm">
                {card.points}
              </span>
            </div>
          )}
          <div className="w-4 h-4 md:w-5 md:h-5 bg-[url('/images/gems.webp')] bg-no-repeat ml-auto"
            style={{
              backgroundSize: '500% 100%',
              backgroundPosition: `${getGemSpritePosition(card.gem)}% 0%`
            }}
          />
        </div>

        {/* 卡片等级标记 */}
        <div className="absolute top-2 left-1 md:left-1.5">
          {Array(card.level).fill(0).map((_, i) => (
            <div key={i} className="w-1 h-1 bg-white rounded-full mb-0.5 shadow-sm"></div>
          ))}
        </div>

        {/* 费用区域 */}
        <div className="absolute bottom-1 left-1 right-1 md:bottom-1.5 
                      bg-white/50 backdrop-blur-sm rounded-md p-1 shadow-sm">
          <div className="flex flex-wrap items-center justify-start gap-0.5">
            {Object.entries(card.cost).map(([gem, count]) => (
              <div key={gem}
                className="flex items-center gap-0.5 bg-white/70 
                            rounded px-0.5 py-0.5 shadow-sm">
                <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${gemColors[gem as GemType]} 
                              shadow-sm`} />
                <span className="text-[10px] md:text-xs font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 选中状态叠加层 */}
      {isSelected && !disabled && (
        <div className="absolute inset-0 rounded-lg bg-black/30 backdrop-blur-[1px] 
                      flex flex-col items-center justify-center gap-2
                      animate-fade-in z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPurchase?.();
            }}
            className="w-3/4 py-1 md:py-1.5 bg-blue-500 rounded-md md:rounded-lg
                     text-white text-[10px] md:text-sm font-medium
                     shadow-lg shadow-blue-500/30
                     hover:bg-blue-600 hover:shadow-blue-600/30
                     focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
                     active:transform active:scale-95
                     transition-all duration-200
                     flex items-center justify-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            购买
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReserve?.();
            }}
            className="w-3/4 py-1 md:py-1.5 bg-yellow-500 rounded-md md:rounded-lg
                     text-white text-[10px] md:text-sm font-medium
                     shadow-lg shadow-yellow-500/30
                     hover:bg-yellow-600 hover:shadow-yellow-600/30
                     focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1
                     active:transform active:scale-95
                     transition-all duration-200
                     flex items-center justify-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
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
'use client';

import { Card as CardType, GemType } from '../../types/game';

interface CardProps {
  card: CardType;
  onPurchase?: () => void;
  onReserve?: () => void;
  disabled?: boolean;
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

export const Card = ({ card, onPurchase, onReserve, disabled }: CardProps) => {
  return (
    <div className={`
      relative w-32 h-44 rounded-xl
      bg-gradient-to-br ${cardColors[card.gem]}
      border-2
      ${disabled ? 'opacity-50' : 'hover:shadow-2xl transform hover:-translate-y-1 hover:border-opacity-70'}
      transition-all duration-300 ease-in-out
      overflow-hidden backdrop-blur-sm
    `}>
      {/* 卡牌背景装饰 */}
      <div className="absolute inset-0 bg-opacity-10">
        <div className="w-full h-full bg-[url('/images/card-pattern.png')] bg-repeat opacity-20" />
      </div>

      {/* 卡牌点数 - 只在大于0时显示 */}
      {card.points > 0 && (
        <div className="absolute top-2 right-2 w-7 h-7 rounded-full 
                      bg-white shadow-lg border-2 border-current
                      flex items-center justify-center
                      text-sm font-bold transform hover:scale-105 transition-transform">
          <span className="text-yellow-600">
            {card.points}
          </span>
        </div>
      )}

      {/* 产出宝石 */}
      <div className={`
        absolute top-10 left-1/2 transform -translate-x-1/2
        w-12 h-12 rounded-full
        ${gemColors[card.gem]} 
        shadow-xl border-2 border-white
        flex items-center justify-center
        hover:scale-105 transition-transform duration-200
      `}>
        <span className="text-2xl transform hover:rotate-12 transition-transform">{getGemEmoji(card.gem)}</span>
      </div>

      {/* 费用区域 */}
      <div className="absolute bottom-8 left-1 right-1 
                    bg-white bg-opacity-50 backdrop-blur-sm rounded-lg p-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          {Object.entries(card.cost).map(([gem, count]) => (
            <div key={gem}
              className="flex items-center gap-1.5 bg-white bg-opacity-70 
                          rounded-md px-2 py-0.5 shadow-sm">
              <div className={`w-4 h-4 rounded-full ${gemColors[gem as GemType]} 
                            shadow-md transform hover:scale-110 transition-transform`} />
              <span className="text-xs font-semibold">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      {!disabled && (
        <div className="absolute bottom-0 left-0 right-0 
                      bg-gradient-to-t from-black to-transparent 
                      text-white py-1.5">
          <div className="flex justify-around gap-1 px-1">
            <button
              onClick={onPurchase}
              className="px-3 py-0.5 rounded-full bg-white bg-opacity-25 
                       hover:bg-opacity-40 transition-all duration-200
                       text-xs font-medium shadow-md backdrop-blur-sm"
            >
              购买
            </button>
            <button
              onClick={onReserve}
              className="px-3 py-0.5 rounded-full bg-white bg-opacity-25 
                       hover:bg-opacity-40 transition-all duration-200
                       text-xs font-medium shadow-md backdrop-blur-sm"
            >
              预留
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 辅助函数：获取宝石对应的emoji
const getGemEmoji = (gem: GemType): string => {
  const emojiMap: Record<GemType, string> = {
    diamond: '💎',
    sapphire: '🔷',
    emerald: '💚',
    ruby: '❤️',
    onyx: '⚫',
    gold: '⭐'
  };
  return emojiMap[gem];
}; 
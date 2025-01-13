'use client';

import { Card as CardType, GemType } from '../../types/game';

interface CardProps {
  card: CardType;
  onPurchase?: () => void;
  onReserve?: () => void;
  disabled?: boolean;
}

const gemColors: Record<GemType, string> = {
  diamond: 'text-gray-700 bg-white border border-gray-300',
  sapphire: 'text-white bg-blue-500',
  emerald: 'text-white bg-green-500',
  ruby: 'text-white bg-red-500',
  onyx: 'text-white bg-gray-800',
  gold: 'text-black bg-yellow-400'
};

const levelColors = {
  1: 'from-green-100 to-green-200 border-green-300',
  2: 'from-yellow-100 to-yellow-200 border-yellow-300',
  3: 'from-blue-100 to-blue-200 border-blue-300'
};

export const Card = ({ card, onPurchase, onReserve, disabled }: CardProps) => {
  return (
    <div className={`
      relative w-32 h-44 rounded-lg
      bg-gradient-to-br ${levelColors[card.level]}
      border-2
      ${disabled ? 'opacity-50' : 'hover:shadow-xl transform hover:-translate-y-1'}
      transition-all duration-300 ease-in-out
      overflow-hidden
    `}>
      {/* 卡牌背景装饰 */}
      <div className="absolute inset-0 bg-opacity-10">
        <div className="w-full h-full bg-[url('/images/card-pattern.png')] bg-repeat opacity-10" />
      </div>

      {/* 卡牌等级指示器 */}
      <div className="absolute top-0 left-0 w-5 h-5 flex items-center justify-center
                    bg-black bg-opacity-20 rounded-br-lg">
        <span className="text-white text-xs font-bold">{card.level}</span>
      </div>

      {/* 卡牌点数 */}
      <div className="absolute top-1 right-1 w-6 h-6 rounded-full 
                    bg-white shadow-lg border-2 border-current
                    flex items-center justify-center
                    text-sm font-bold">
        <span className={`${card.points > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
          {card.points}
        </span>
      </div>

      {/* 产出宝石 */}
      <div className={`
        absolute top-10 left-1/2 transform -translate-x-1/2
        w-10 h-10 rounded-full
        ${gemColors[card.gem]} 
        shadow-lg border-2 border-white
        flex items-center justify-center
        animate-pulse
      `}>
        <span className="text-xl">{getGemEmoji(card.gem)}</span>
      </div>

      {/* 费用区域 */}
      <div className="absolute bottom-8 left-1 right-1 
                    bg-white bg-opacity-40 rounded-lg p-1">
        <div className="grid grid-cols-2 gap-1">
          {Object.entries(card.cost).map(([gem, count]) => (
            <div key={gem}
              className="flex items-center gap-1 bg-white bg-opacity-60 
                          rounded-sm px-1">
              <div className={`w-4 h-4 rounded-full ${gemColors[gem as GemType]} 
                            shadow-sm transform hover:scale-110 transition-transform`} />
              <span className="text-xs font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      {!disabled && (
        <div className="absolute bottom-0 left-0 right-0 
                      bg-gradient-to-t from-black to-transparent 
                      text-white py-1">
          <div className="flex justify-around">
            <button
              onClick={onPurchase}
              className="px-2 py-0.5 rounded-full bg-white bg-opacity-20 
                       hover:bg-opacity-30 transition-all duration-200
                       text-xs font-medium"
            >
              购买
            </button>
            <button
              onClick={onReserve}
              className="px-2 py-0.5 rounded-full bg-white bg-opacity-20 
                       hover:bg-opacity-30 transition-all duration-200
                       text-xs font-medium"
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
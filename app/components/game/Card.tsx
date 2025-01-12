'use client';

import { Card as CardType, GemType } from '../../types/game';

interface CardProps {
  card: CardType;
  onPurchase?: () => void;
  onReserve?: () => void;
  disabled?: boolean;
}

const gemColors: Record<GemType, string> = {
  diamond: 'text-gray-700 bg-white',
  sapphire: 'text-white bg-blue-500',
  emerald: 'text-white bg-green-500',
  ruby: 'text-white bg-red-500',
  onyx: 'text-white bg-gray-800',
  gold: 'text-black bg-yellow-400'
};

export const Card = ({ card, onPurchase, onReserve, disabled }: CardProps) => {
  return (
    <div className={`
      relative w-32 h-44 rounded-lg shadow-md 
      ${disabled ? 'opacity-50' : 'hover:shadow-lg'}
      transition-all duration-200
      bg-white
    `}>
      {/* 卡牌点数 */}
      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-800 
                    text-white flex items-center justify-center">
        {card.points}
      </div>

      {/* 产出宝石 */}
      <div className={`
        absolute top-2 left-2 w-6 h-6 rounded-full
        ${gemColors[card.gem]} 
        flex items-center justify-center
      `} />

      {/* 费用区域 */}
      <div className="absolute bottom-2 left-2 right-2">
        {Object.entries(card.cost).map(([gem, count]) => (
          <div key={gem} className="flex items-center gap-1 mb-1">
            <div className={`w-4 h-4 rounded-full ${gemColors[gem as GemType]}`} />
            <span className="text-sm">{count}</span>
          </div>
        ))}
      </div>

      {/* 操作按钮 */}
      {!disabled && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-around 
                      bg-black bg-opacity-50 rounded-b-lg p-1">
          <button
            onClick={onPurchase}
            className="text-xs text-white hover:text-yellow-400"
          >
            购买
          </button>
          <button
            onClick={onReserve}
            className="text-xs text-white hover:text-yellow-400"
          >
            预留
          </button>
        </div>
      )}
    </div>
  );
}; 
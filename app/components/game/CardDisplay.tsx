'use client';

import { Card as CardType } from '../../types/game';
import { Card } from './Card';
import { useGameStore } from '../../store/gameStore';

interface CardDisplayProps {
  cards: {
    level1: CardType[];
    level2: CardType[];
    level3: CardType[];
  };
}

export const CardDisplay = ({ cards }: CardDisplayProps) => {
  const { purchaseCard, reserveCard } = useGameStore();

  return (
    <div className="flex flex-col gap-4">
      {/* 三级卡牌 */}
      <div className="flex items-center gap-4">
        {/* 三级卡牌剩余数量 */}
        <div className="w-16 h-44 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 
                    border-2 border-blue-300 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-blue-600">16</span>
          <span className="text-sm text-blue-600">三级卡</span>
        </div>
        {cards.level3.map((card) => (
          <Card
            key={card.id}
            card={card}
            onPurchase={() => purchaseCard(card)}
            onReserve={() => reserveCard(card)}
          />
        ))}
      </div>

      {/* 二级卡牌 */}
      <div className="flex items-center gap-4">
        {/* 二级卡牌剩余数量 */}
        <div className="w-16 h-44 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 
                    border-2 border-yellow-300 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-yellow-600">26</span>
          <span className="text-sm text-yellow-600">二级卡</span>
        </div>
        {cards.level2.map((card) => (
          <Card
            key={card.id}
            card={card}
            onPurchase={() => purchaseCard(card)}
            onReserve={() => reserveCard(card)}
          />
        ))}
      </div>

      {/* 一级卡牌 */}
      <div className="flex items-center gap-4">
        {/* 一级卡牌剩余数量 */}
        <div className="w-16 h-44 rounded-xl bg-gradient-to-br from-green-100 to-green-200 
                    border-2 border-green-300 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-green-600">36</span>
          <span className="text-sm text-green-600">一级卡</span>
        </div>
        {cards.level1.map((card) => (
          <Card
            key={card.id}
            card={card}
            onPurchase={() => purchaseCard(card)}
            onReserve={() => reserveCard(card)}
          />
        ))}
      </div>
    </div>
  );
}; 
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
      <div className="flex gap-4">
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
      <div className="flex gap-4">
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
      <div className="flex gap-4">
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
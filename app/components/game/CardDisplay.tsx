'use client';

import type { CardDisplayProps } from '../../types/components';
import { Card } from './Card';
import { useGameStore } from '../../store/gameStore';
import { GameValidator } from '../../lib/game/validator';

export const CardDisplay = ({ cards, onPurchase, onReserve, disabled }: CardDisplayProps) => {
  const gameState = useGameStore(state => state.gameState);

  const handleCardClick = (cardId: string, level: number) => {
    if (!gameState || disabled) return;

    const action = {
      type: 'PURCHASE_CARD' as const,
      payload: {
        cardId,
        level,
      },
    };

    if (GameValidator.canPurchaseCard(gameState, action)) {
      onPurchase(action);
    }
  };

  const handleCardReserve = (cardId: string, level: number) => {
    if (!gameState || disabled) return;

    const action = {
      type: 'RESERVE_CARD' as const,
      payload: {
        cardId,
        level,
      },
    };

    if (GameValidator.canReserveCard(gameState, action)) {
      onReserve(action);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Level 3 */}
      <div className="flex flex-col gap-2">
        <h4 className="text-lg font-bold text-gray-800">Level 3</h4>
        <div className="grid grid-cols-4 gap-2">
          {cards.level3.map((card) => (
            <Card
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card.id, 3)}
              onReserve={() => handleCardReserve(card.id, 3)}
              disabled={disabled}
            />
          ))}
          {cards.deck3.length > 0 && (
            <div className="w-32 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-600">牌堆: {cards.deck3.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Level 2 */}
      <div className="flex flex-col gap-2">
        <h4 className="text-lg font-bold text-gray-800">Level 2</h4>
        <div className="grid grid-cols-4 gap-2">
          {cards.level2.map((card) => (
            <Card
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card.id, 2)}
              onReserve={() => handleCardReserve(card.id, 2)}
              disabled={disabled}
            />
          ))}
          {cards.deck2.length > 0 && (
            <div className="w-32 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-600">牌堆: {cards.deck2.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Level 1 */}
      <div className="flex flex-col gap-2">
        <h4 className="text-lg font-bold text-gray-800">Level 1</h4>
        <div className="grid grid-cols-4 gap-2">
          {cards.level1.map((card) => (
            <Card
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card.id, 1)}
              onReserve={() => handleCardReserve(card.id, 1)}
              disabled={disabled}
            />
          ))}
          {cards.deck1.length > 0 && (
            <div className="w-32 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-600">牌堆: {cards.deck1.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
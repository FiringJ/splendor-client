'use client';

import type { CardDisplayProps } from '../../types/components';
import { Card } from './Card';
import { useGameStore } from '../../store/gameStore';
import { GameValidator } from '../../lib/game/validator';

const EmptyDeck = ({ count }: { count: number }) => (
  <div className="w-32 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
    <span className="text-gray-600">牌堆: {count}</span>
  </div>
);

export const CardDisplay = ({ cards, onPurchase, onReserve, disabled }: CardDisplayProps) => {
  const gameState = useGameStore(state => state.gameState);

  // 确保所有卡牌数组都存在
  const safeCards = {
    level1: cards?.level1 ?? [],
    level2: cards?.level2 ?? [],
    level3: cards?.level3 ?? [],
    deck1: cards?.deck1 ?? [],
    deck2: cards?.deck2 ?? [],
    deck3: cards?.deck3 ?? [],
  };

  const handleCardClick = (cardId: number) => {
    if (!gameState || disabled) return;

    const action = {
      type: 'PURCHASE_CARD' as const,
      payload: {
        cardId
      },
    };

    if (GameValidator.canPurchaseCard(gameState, action)) {
      onPurchase(action);
    }
  };

  const handleCardReserve = (cardId: number) => {
    if (!gameState || disabled) return;

    const action = {
      type: 'RESERVE_CARD' as const,
      payload: {
        cardId
      },
    };

    if (GameValidator.canReserveCard(gameState, action)) {
      onReserve(action);
    }
  };

  // 先注释掉从牌堆预定的功能
  // const handleDeckReserve = (level: number) => {
  //   if (!gameState || disabled) return;

  //   const action = {
  //     type: 'RESERVE_CARD' as const,
  //     payload: {
  //       cardId: `deck${level}`,
  //       level,
  //     },
  //   };

  //   if (GameValidator.canReserveCard(gameState, action)) {
  //     onReserve(action);
  //   }
  // };

  return (
    <div className="flex flex-col gap-4">
      {/* Level 3 */}
      <div className="flex flex-col gap-2">
        <h4 className="text-lg font-bold text-gray-800">Level 3</h4>
        <div className="grid grid-cols-4 gap-2">
          {safeCards.level3.map((card) => (
            <Card
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card.id)}
              onReserve={() => handleCardReserve(card.id)}
              disabled={disabled}
            />
          ))}
          {safeCards.deck3.length > 0 && (
            <div className="relative">
              <EmptyDeck count={safeCards.deck3.length} />
              {!disabled && (
                <button
                  // onClick={() => handleDeckReserve(3)}
                  className="absolute bottom-2 left-1/2 -translate-x-1/2
                            px-4 py-1 bg-yellow-500 text-white text-sm rounded-lg
                            shadow-md shadow-yellow-500/30
                            hover:bg-yellow-600 hover:shadow-yellow-600/30
                            active:transform active:scale-95
                            transition-all duration-200"
                >
                  预定
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Level 2 */}
      <div className="flex flex-col gap-2">
        <h4 className="text-lg font-bold text-gray-800">Level 2</h4>
        <div className="grid grid-cols-4 gap-2">
          {safeCards.level2.map((card) => (
            <Card
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card.id)}
              onReserve={() => handleCardReserve(card.id)}
              disabled={disabled}
            />
          ))}
          {safeCards.deck2.length > 0 && (
            <div className="relative">
              <EmptyDeck count={safeCards.deck2.length} />
              {!disabled && (
                <button
                  // onClick={() => handleDeckReserve(2)}
                  className="absolute bottom-2 left-1/2 -translate-x-1/2
                            px-4 py-1 bg-yellow-500 text-white text-sm rounded-lg
                            shadow-md shadow-yellow-500/30
                            hover:bg-yellow-600 hover:shadow-yellow-600/30
                            active:transform active:scale-95
                            transition-all duration-200"
                >
                  预定
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Level 1 */}
      <div className="flex flex-col gap-2">
        <h4 className="text-lg font-bold text-gray-800">Level 1</h4>
        <div className="grid grid-cols-4 gap-2">
          {safeCards.level1.map((card) => (
            <Card
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card.id)}
              onReserve={() => handleCardReserve(card.id)}
              disabled={disabled}
            />
          ))}
          {safeCards.deck1.length > 0 && (
            <div className="relative">
              <EmptyDeck count={safeCards.deck1.length} />
              {!disabled && (
                <button
                  // onClick={() => handleDeckReserve(1)}
                  className="absolute bottom-2 left-1/2 -translate-x-1/2
                            px-4 py-1 bg-yellow-500 text-white text-sm rounded-lg
                            shadow-md shadow-yellow-500/30
                            hover:bg-yellow-600 hover:shadow-yellow-600/30
                            active:transform active:scale-95
                            transition-all duration-200"
                >
                  预定
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
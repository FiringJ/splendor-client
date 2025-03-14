'use client';

import { useState } from 'react';
import type { CardDisplayProps } from '../../types/components';
import { Card } from './Card';
import { useGameStore } from '../../store/gameStore';
import { GameValidator } from '../../lib/game/validator';

const EmptyDeck = ({ count }: { count: number }) => (
  <div className="w-28 h-40 bg-gray-200 rounded-lg flex items-center justify-center shadow-inner">
    <span className="text-gray-600 text-sm font-medium">牌堆: {count}</span>
  </div>
);

export const CardDisplay = ({ cards, onPurchase, onReserve, disabled }: CardDisplayProps) => {
  const gameState = useGameStore(state => state.gameState);
  // 添加选中卡片的状态
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  // 确保所有卡牌数组都存在
  const safeCards = {
    level1: cards?.level1 ?? [],
    level2: cards?.level2 ?? [],
    level3: cards?.level3 ?? [],
    deck1: cards?.deck1 ?? [],
    deck2: cards?.deck2 ?? [],
    deck3: cards?.deck3 ?? [],
  };

  // 修改为选中卡片的处理函数
  const handleCardClick = (cardId: number) => {
    if (disabled) return;
    
    // 如果已经选中该卡片，则取消选中
    if (selectedCardId === cardId) {
      setSelectedCardId(null);
    } else {
      // 否则选中该卡片
      setSelectedCardId(cardId);
    }
  };

  // 处理卡片购买
  const handleCardPurchase = (cardId: number) => {
    if (!gameState || disabled) return;

    const action = {
      type: 'PURCHASE_CARD' as const,
      payload: {
        cardId
      },
    };

    if (GameValidator.canPurchaseCard(gameState, action)) {
      onPurchase(action);
      // 购买后取消选中状态
      setSelectedCardId(null);
    }
  };

  // 处理卡片预留
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
      // 预留后取消选中状态
      setSelectedCardId(null);
    }
  };

  // 处理从牌堆预定卡片
  const handleDeckReserve = (level: number) => {
    if (!gameState || disabled) return;

    const action = {
      type: 'RESERVE_CARD' as const,
      payload: {
        cardId: -1, // 使用特殊ID表示从牌堆预定
        level,
      },
    };

    if (GameValidator.canReserveCard(gameState, action)) {
      onReserve(action);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {/* Level 3 */}
      <div className="flex flex-col gap-1 mb-2">
        <h4 className="text-sm font-bold text-gray-800 bg-gradient-to-r from-purple-100 to-transparent px-2 py-1 rounded-md">Level 3</h4>
        <div className="grid grid-cols-4 gap-1 mx-auto">
          {safeCards.level3.map((card) => (
            <Card
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card.id)}
              onPurchase={() => handleCardPurchase(card.id)}
              onReserve={() => handleCardReserve(card.id)}
              disabled={disabled}
              isSelected={selectedCardId === card.id}
            />
          ))}
          {safeCards.deck3.length > 0 && (
            <div className="relative">
              <EmptyDeck count={safeCards.deck3.length} />
              {!disabled && (
                <button
                  onClick={() => handleDeckReserve(3)}
                  className="absolute bottom-1 left-1/2 -translate-x-1/2
                            px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-md
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
      <div className="flex flex-col gap-1 mb-2">
        <h4 className="text-sm font-bold text-gray-800 bg-gradient-to-r from-blue-100 to-transparent px-2 py-1 rounded-md">Level 2</h4>
        <div className="grid grid-cols-4 gap-1 mx-auto">
          {safeCards.level2.map((card) => (
            <Card
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card.id)}
              onPurchase={() => handleCardPurchase(card.id)}
              onReserve={() => handleCardReserve(card.id)}
              disabled={disabled}
              isSelected={selectedCardId === card.id}
            />
          ))}
          {safeCards.deck2.length > 0 && (
            <div className="relative">
              <EmptyDeck count={safeCards.deck2.length} />
              {!disabled && (
                <button
                  onClick={() => handleDeckReserve(2)}
                  className="absolute bottom-1 left-1/2 -translate-x-1/2
                            px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-md
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
      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-bold text-gray-800 bg-gradient-to-r from-green-100 to-transparent px-2 py-1 rounded-md">Level 1</h4>
        <div className="grid grid-cols-4 gap-1 mx-auto">
          {safeCards.level1.map((card) => (
            <Card
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card.id)}
              onPurchase={() => handleCardPurchase(card.id)}
              onReserve={() => handleCardReserve(card.id)}
              disabled={disabled}
              isSelected={selectedCardId === card.id}
            />
          ))}
          {safeCards.deck1.length > 0 && (
            <div className="relative">
              <EmptyDeck count={safeCards.deck1.length} />
              {!disabled && (
                <button
                  onClick={() => handleDeckReserve(1)}
                  className="absolute bottom-1 left-1/2 -translate-x-1/2
                            px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-md
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
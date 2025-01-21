'use client';

import { Card as CardType } from '../../types/game';
import { Card } from './Card';
import { useGameStore } from '../../store/gameStore';
import { useState } from 'react';

interface CardDisplayProps {
  cards: {
    level1: CardType[];
    level2: CardType[];
    level3: CardType[];
  };
}

export const CardDisplay = ({ cards }: CardDisplayProps) => {
  const gameState = useGameStore(state => state.gameState);
  const performAction = useGameStore(state => state.performAction);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);

  const handleCardClick = (card: CardType) => {
    if (selectedCard?.id === card.id) {
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  };

  // 点击背景时取消选中
  const handleBackgroundClick = () => {
    setSelectedCard(null);
  };

  const handlePurchaseCard = (card: CardType) => {
    if (!gameState) return;

    const currentPlayer = gameState.players[gameState.currentPlayer];
    performAction({
      type: 'purchaseCard',
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      details: {
        card: {
          id: card.id,
          gem: card.gem,
          points: card.points
        }
      },
      timestamp: Date.now()
    });
    setSelectedCard(null);
  };

  const handleReserveCard = (card: CardType) => {
    if (!gameState) return;

    const currentPlayer = gameState.players[gameState.currentPlayer];
    performAction({
      type: 'reserveCard',
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      details: {
        card: {
          id: card.id,
          gem: card.gem,
          points: card.points
        },
        gems: gameState.gems.gold > 0 ? { gold: 1 } : undefined
      },
      timestamp: Date.now()
    });
    setSelectedCard(null);
  };

  return (
    <div className="flex flex-col gap-4" onClick={handleBackgroundClick}>
      {/* 三级卡牌 */}
      <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
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
            onPurchase={() => handlePurchaseCard(card)}
            onReserve={() => handleReserveCard(card)}
            onClick={() => handleCardClick(card)}
            isSelected={selectedCard?.id === card.id}
          />
        ))}
      </div>

      {/* 二级卡牌 */}
      <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
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
            onPurchase={() => handlePurchaseCard(card)}
            onReserve={() => handleReserveCard(card)}
            onClick={() => handleCardClick(card)}
            isSelected={selectedCard?.id === card.id}
          />
        ))}
      </div>

      {/* 一级卡牌 */}
      <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
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
            onPurchase={() => handlePurchaseCard(card)}
            onReserve={() => handleReserveCard(card)}
            onClick={() => handleCardClick(card)}
            isSelected={selectedCard?.id === card.id}
          />
        ))}
      </div>

      {/* 遮罩层 - 当有卡片被选中时显示 */}
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleBackgroundClick}
        />
      )}
    </div>
  );
}; 
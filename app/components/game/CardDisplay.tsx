'use client';

import { useState, useMemo } from 'react';
import type { CardDisplayProps } from '../../types/components';
import { Card } from './Card';
import { useGameStore } from '../../store/gameStore';
import { GameValidator } from '../../lib/game/validator';
import type { Card as CardType } from '../../types/game';

const DeckCard = ({ level, count, onClick }: { level: number; count: number; onClick?: () => void }) => {
  const [showReserveButton, setShowReserveButton] = useState(false);
  const gameState = useGameStore(state => state.gameState);
  
  // 检查是否可以预留卡牌
  const canReserveFromDeck = useMemo(() => {
    if (!gameState || !count) return false;
    
    // 获取当前玩家
    const currentPlayerId = gameState.currentTurn;
    const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
    if (!currentPlayer) return false;
    
    // 检查预留卡数量限制
    if (currentPlayer.reservedCards.length >= 3) return false;
    
    // 检查是否是当前回合
    return GameValidator.canReserveCard(gameState, {
      type: 'RESERVE_CARD',
      payload: { cardId: -1, level }
    });
  }, [gameState, count, level]);
  
  return (
    <div 
      className={`
        relative w-[6.5rem] h-[8.5rem] md:w-28 md:h-40 rounded-lg
        border border-gray-300
        ${!count ? 'opacity-40 cursor-not-allowed' : 
          'cursor-pointer hover:shadow-lg transition-all duration-300'}
        shadow-md
        overflow-hidden
      `}
      onMouseEnter={() => count > 0 && setShowReserveButton(true)}
      onMouseLeave={() => setShowReserveButton(false)}
    >
      {/* 卡牌背面图案 */}
      <div
        className="absolute inset-0 bg-[url('/images/cards.webp')] bg-no-repeat"
        style={{
          backgroundSize: '500% 600%',
          backgroundPosition: `${(level - 1) * 25}% 100%`
        }}
      />
      
      {/* 卡牌等级标记 */}
      <div className="absolute top-2 left-2">
        {Array(level).fill(0).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 bg-white rounded-full mb-0.5 shadow-sm"></div>
        ))}
      </div>

      {/* 卡牌数量显示 */}
      <div className="absolute bottom-2 right-2 w-6 h-6 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center">
        <span className="text-xs font-bold">{count}</span>
      </div>

      {/* 预留按钮 - 只有在可以预留时显示 */}
      {showReserveButton && canReserveFromDeck && onClick && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
          <button
            onClick={onClick}
            className="px-3 py-1.5 bg-yellow-500 text-white rounded-md text-xs
                     hover:bg-yellow-600 active:bg-yellow-700
                     shadow-md shadow-yellow-500/30
                     hover:shadow-lg hover:shadow-yellow-500/40
                     transform active:scale-95
                     transition-all duration-200
                     font-medium"
          >
            预留卡牌
          </button>
        </div>
      )}
    </div>
  );
};

export const CardDisplay = ({ cards, onPurchase, onReserve, disabled }: CardDisplayProps) => {
  const gameState = useGameStore(state => state.gameState);
  // 不再需要选中卡片的状态，改为悬停时显示按钮
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);

  // 确保所有卡牌数组都存在
  const safeCards = {
    level1: cards?.level1 ?? [],
    level2: cards?.level2 ?? [],
    level3: cards?.level3 ?? [],
    deck1: cards?.deck1 ?? [],
    deck2: cards?.deck2 ?? [],
    deck3: cards?.deck3 ?? [],
  };

  // 处理卡片悬停
  const handleCardMouseEnter = (cardId: number) => {
    if (disabled) return;
    setHoveredCardId(cardId);
  };

  const handleCardMouseLeave = () => {
    setHoveredCardId(null);
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
      setHoveredCardId(null);
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
      setHoveredCardId(null);
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

  const renderCardWithHoverControls = (card: CardType) => {
    const canPurchase = gameState && GameValidator.canPurchaseCard(gameState, {
      type: 'PURCHASE_CARD',
      payload: { cardId: card.id }
    });
    
    const canReserve = gameState && GameValidator.canReserveCard(gameState, {
      type: 'RESERVE_CARD',
      payload: { cardId: card.id }
    });
    
    const isHovered = hoveredCardId === card.id;
    
    return (
      <div 
        className="relative"
        onMouseEnter={() => handleCardMouseEnter(card.id)}
        onMouseLeave={handleCardMouseLeave}
      >
        <Card
          key={card.id}
          card={card}
          disabled={disabled}
          isSelected={false}
        />
        
        {/* 悬停时的操作按钮 */}
        {isHovered && !disabled && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30 backdrop-blur-[1px]">
            {canPurchase && (
              <button
                onClick={() => handleCardPurchase(card.id)}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-xs
                         hover:bg-blue-600 active:bg-blue-700
                         shadow-md shadow-blue-500/30
                         hover:shadow-lg hover:shadow-blue-500/40
                         transform active:scale-95
                         transition-all duration-200
                         font-medium"
              >
                购买卡牌
              </button>
            )}
            
            {canReserve && (
              <button
                onClick={() => handleCardReserve(card.id)}
                className="px-3 py-1.5 bg-yellow-500 text-white rounded-md text-xs
                         hover:bg-yellow-600 active:bg-yellow-700
                         shadow-md shadow-yellow-500/30
                         hover:shadow-lg hover:shadow-yellow-500/40
                         transform active:scale-95
                         transition-all duration-200
                         font-medium"
              >
                预留卡牌
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 max-w-6xl mx-auto">
      {/* Level 3 - 高级卡牌 */}
      <div className="bg-gradient-to-r from-purple-50 to-transparent p-2 md:p-4 rounded-lg shadow-sm">
        <h4 className="text-base font-bold text-purple-800 mb-2 md:mb-3 flex items-center">
          <span className="w-6 h-6 mr-2 bg-purple-100 rounded-full flex items-center justify-center text-purple-700">3</span>
          高级卡牌
        </h4>
        <div className="flex items-start">
          {/* 牌堆 */}
          <div className="flex-shrink-0 mr-2 md:mr-8">
            <DeckCard 
              level={3} 
              count={safeCards.deck3.length}
              onClick={!disabled ? () => handleDeckReserve(3) : undefined}
            />
          </div>
          
          {/* 卡牌展示区 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 justify-items-center w-full">
            {safeCards.level3.map((card) => (
              <div key={card.id}>
                {renderCardWithHoverControls(card)}
              </div>
            ))}
            {/* 填充空位保持布局 */}
            {safeCards.level3.length < (window.innerWidth < 768 ? 2 : 4) && 
              Array.from({ length: (window.innerWidth < 768 ? 2 : 4) - safeCards.level3.length }).map((_, i) => (
                <div key={`empty-${i}`} className="w-[6.5rem] h-[8.5rem] md:w-28 md:h-40 bg-gray-100/50 rounded-lg border border-dashed border-gray-200"></div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Level 2 - 中级卡牌 */}
      <div className="bg-gradient-to-r from-blue-50 to-transparent p-2 md:p-4 rounded-lg shadow-sm">
        <h4 className="text-base font-bold text-blue-800 mb-2 md:mb-3 flex items-center">
          <span className="w-6 h-6 mr-2 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">2</span>
          中级卡牌
        </h4>
        <div className="flex items-start">
          {/* 牌堆 */}
          <div className="flex-shrink-0 mr-2 md:mr-8">
            <DeckCard 
              level={2}
              count={safeCards.deck2.length}
              onClick={!disabled ? () => handleDeckReserve(2) : undefined}
            />
          </div>
          
          {/* 卡牌展示区 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 justify-items-center w-full">
            {safeCards.level2.map((card) => (
              <div key={card.id}>
                {renderCardWithHoverControls(card)}
              </div>
            ))}
            {/* 填充空位保持布局 */}
            {safeCards.level2.length < (window.innerWidth < 768 ? 2 : 4) && 
              Array.from({ length: (window.innerWidth < 768 ? 2 : 4) - safeCards.level2.length }).map((_, i) => (
                <div key={`empty-${i}`} className="w-[6.5rem] h-[8.5rem] md:w-28 md:h-40 bg-gray-100/50 rounded-lg border border-dashed border-gray-200"></div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Level 1 - 初级卡牌 */}
      <div className="bg-gradient-to-r from-green-50 to-transparent p-2 md:p-4 rounded-lg shadow-sm">
        <h4 className="text-base font-bold text-green-800 mb-2 md:mb-3 flex items-center">
          <span className="w-6 h-6 mr-2 bg-green-100 rounded-full flex items-center justify-center text-green-700">1</span>
          初级卡牌
        </h4>
        <div className="flex items-start">
          {/* 牌堆 */}
          <div className="flex-shrink-0 mr-2 md:mr-8">
            <DeckCard 
              level={1} 
              count={safeCards.deck1.length}
              onClick={!disabled ? () => handleDeckReserve(1) : undefined}
            />
          </div>
          
          {/* 卡牌展示区 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 justify-items-center w-full">
            {safeCards.level1.map((card) => (
              <div key={card.id}>
                {renderCardWithHoverControls(card)}
              </div>
            ))}
            {/* 填充空位保持布局 */}
            {safeCards.level1.length < (window.innerWidth < 768 ? 2 : 4) && 
              Array.from({ length: (window.innerWidth < 768 ? 2 : 4) - safeCards.level1.length }).map((_, i) => (
                <div key={`empty-${i}`} className="w-[6.5rem] h-[8.5rem] md:w-28 md:h-40 bg-gray-100/50 rounded-lg border border-dashed border-gray-200"></div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}; 
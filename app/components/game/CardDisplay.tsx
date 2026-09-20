'use client';

import { useState, useMemo } from 'react';
import type { CardDisplayProps } from '../../types/components';
import { Card } from './Card';
import { useGameStore } from '../../store/gameStore';
import { GameValidator } from '../../lib/game/validator';
import type { Card as CardType } from '../../types/game';
import { useSound } from '../../hooks/useSound';
import { boardRowClass } from './boardLayout';

const DeckCard = ({ level, count, onClick }: { level: number; count: number; onClick?: () => void }) => {
  const [showReserveButton, setShowReserveButton] = useState(false);
  const gameState = useGameStore(state => state.gameState);
  const playSound = useSound();

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

  const handleButtonClick = () => {
    if (onClick) {
      playSound('reserve_card');
      onClick();
    }
  };

  return (
    <div className="flex w-[6.5rem] flex-col md:w-28">
    <div
      className={`
        relative h-[8.5rem] w-full rounded-xl
        border border-slate-200 md:h-40
        ${!count ? 'opacity-40 cursor-not-allowed' :
          'cursor-pointer hover:shadow-lg transition-all duration-300'}
        shadow-sm
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

      {/* 桌面：悬停后才出现。手机上悬停不可靠，按钮单独放在卡牌下方。 */}
      {showReserveButton && canReserveFromDeck && onClick && (
        <div className="absolute inset-0 hidden items-center justify-center bg-black/35 backdrop-blur-[1px] md:flex">
          <button
            type="button"
            onClick={handleButtonClick}
            className="btn-reserve"
          >
            预留卡牌
          </button>
        </div>
      )}
    </div>
    {canReserveFromDeck && onClick && (
      <button
        type="button"
        onClick={handleButtonClick}
        aria-label={`预留${level}级牌堆`}
        className="btn-reserve mt-1 w-full md:hidden"
      >
        预留
      </button>
    )}
    </div>
  );
};

export const CardDisplay = ({ cards, onPurchase, onReserve, disabled }: CardDisplayProps) => {
  const gameState = useGameStore(state => state.gameState);
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);
  const playSound = useSound();

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
      playSound('purchase_card');
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
      playSound('reserve_card');
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

    const showTouchActions = !disabled && (canPurchase || canReserve);

    return (
      <div
        className="flex w-[6.5rem] flex-col md:w-28"
        onMouseEnter={() => handleCardMouseEnter(card.id)}
        onMouseLeave={handleCardMouseLeave}
      >
        <div className="relative">
          <Card
            key={card.id}
            card={card}
            disabled={disabled}
            isSelected={false}
          />

          {isHovered && !disabled && (
            <div className="absolute inset-0 hidden flex-col items-center justify-center gap-2 bg-black/35 backdrop-blur-[1px] md:flex">
              {canPurchase && (
                <button
                  type="button"
                  onClick={() => handleCardPurchase(card.id)}
                  className="btn-buy"
                >
                  购买卡牌
                </button>
              )}

              {canReserve && (
                <button
                  type="button"
                  onClick={() => handleCardReserve(card.id)}
                  className="btn-reserve"
                >
                  预留卡牌
                </button>
              )}
            </div>
          )}
        </div>

        {showTouchActions && (
          <div className="mt-1 grid grid-cols-2 gap-1 md:hidden">
            {canPurchase && (
              <button
                type="button"
                onClick={() => handleCardPurchase(card.id)}
                className="btn-buy !px-1 text-xs"
              >
                购买
              </button>
            )}
            {canReserve && (
              <button
                type="button"
                onClick={() => handleCardReserve(card.id)}
                className={`btn-reserve !px-1 text-xs ${canPurchase ? '' : 'col-span-2'}`}
              >
                预留
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderLevel = (
    level: 1 | 2 | 3,
    title: string,
    tone: string,
    badge: string,
    faceUp: CardType[],
    deckCount: number,
  ) => (
    <div className={`rounded-xl py-1.5 shadow-sm ${tone}`}>
      <h4 className="mb-2 flex items-center text-sm font-semibold">
        <span className={`mr-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${badge}`}>
          {level}
        </span>
        {title}
      </h4>
      <div className={boardRowClass}>
        <DeckCard
          level={level}
          count={deckCount}
          onClick={!disabled ? () => handleDeckReserve(level) : undefined}
        />
        <div className="grid min-w-0 grid-cols-2 justify-items-start gap-2 md:grid-cols-3 xl:grid-cols-4">
          {faceUp.map((card) => (
            <div key={card.id} className="min-w-0">
              {renderCardWithHoverControls(card)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-2">
      {renderLevel(3, '高级卡牌', 'bg-gradient-to-r from-purple-50 to-transparent text-purple-900', 'bg-purple-100 text-purple-700', safeCards.level3, safeCards.deck3.length)}
      {renderLevel(2, '中级卡牌', 'bg-gradient-to-r from-blue-50 to-transparent text-blue-900', 'bg-blue-100 text-blue-700', safeCards.level2, safeCards.deck2.length)}
      {renderLevel(1, '初级卡牌', 'bg-gradient-to-r from-emerald-50 to-transparent text-emerald-900', 'bg-emerald-100 text-emerald-700', safeCards.level1, safeCards.deck1.length)}
    </div>
  );
}; 
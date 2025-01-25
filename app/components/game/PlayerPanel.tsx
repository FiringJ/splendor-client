'use client';

import type { PlayerPanelProps } from '../../types/components';
import { GemType, Card as CardType } from '../../types/game';
import { Card } from './Card';
import { Noble } from './Noble';
import { useGameStore } from '../../store/gameStore';
import { useSocket } from '../../hooks/useSocket';
import { useRoomStore } from '../../store/roomStore';
import { GameValidator } from '../../lib/game/validator';

const gemColors: Record<GemType, string> = {
  red: 'text-white bg-red-500',
  green: 'text-white bg-green-500',
  blue: 'text-white bg-blue-500',
  white: 'text-gray-700 bg-white border-2 border-gray-300',
  black: 'text-white bg-gray-800',
  gold: 'text-black bg-yellow-400',
};

const gemNames: Record<GemType, string> = {
  red: '红宝石',
  green: '祖母绿',
  blue: '蓝宝石',
  white: '钻石',
  black: '玛瑙',
  gold: '黄金',
};

export const PlayerPanel = ({ player, isActive }: PlayerPanelProps) => {
  const gameState = useGameStore(state => state.gameState);
  const roomId = useRoomStore(state => state.roomId);
  const { performGameAction } = useSocket();

  const handlePurchaseReservedCard = async (card: CardType) => {
    if (!gameState || !roomId) return;

    const action = {
      type: 'PURCHASE_CARD' as const,
      payload: {
        cardId: card.id,
        level: card.level,
      },
    };

    if (GameValidator.canPurchaseCard(gameState, action)) {
      try {
        await performGameAction(roomId, action);
      } catch (error) {
        console.error('Failed to purchase reserved card:', error);
      }
    }
  };

  return (
    <div className={`
      p-3 rounded-lg shadow-sm
      ${isActive ? 'bg-yellow-50 ring-2 ring-yellow-400' : 'bg-white'}
    `}>
      {/* 玩家信息头部 */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold">{player.name}</span>
          {isActive && <span className="text-sm text-yellow-600">(当前回合)</span>}
        </div>
        <div className="text-xl font-bold text-purple-800">
          {player.points} 分
        </div>
      </div>

      {/* 宝石资源区域 */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold">宝石资源</h3>
          <span className="text-sm text-gray-500">{Object.values(player.gems).reduce((a, b) => a + b, 0)}/10</span>
        </div>
        <div className="flex gap-2.5">
          {/* 普通宝石组 */}
          {(['white', 'blue', 'green', 'red', 'black'] as const).map((gemType) => (
            <div key={gemType} className="flex gap-1">
              <div className={`w-6 h-6 ${gemColors[gemType]} 
                            flex items-center justify-center text-sm font-bold shadow-sm select-none`}>
                {player.cards.filter(card => card.gem === gemType).length}
              </div>
              <div className={`w-6 h-6 rounded-full ${gemColors[gemType]} 
                            flex items-center justify-center text-sm font-bold shadow-sm select-none`}>
                {player.gems[gemType] || 0}
              </div>
            </div>
          ))}

          {/* 黄金组 */}
          <div className="flex">
            <div className={`w-6 h-6 rounded-full ${gemColors['gold']} 
                          flex items-center justify-center text-sm font-bold shadow-sm select-none`}>
              {player.gems['gold'] || 0}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* 左侧：预留卡区域 */}
        <div>
          <h3 className="text-sm font-bold mb-2">预留卡: {player.reservedCards.length}/3</h3>
          <div className="flex flex-row gap-2">
            {player.reservedCards.map((card) => (
              <div key={card.id} className="transform scale-75 origin-top-left relative -ml-4 first:ml-0">
                <Card
                  card={card}
                  disabled={!isActive}
                />
                {isActive && GameValidator.canPurchaseCard(gameState!, {
                  type: 'PURCHASE_CARD',
                  payload: {
                    cardId: card.id,
                    level: card.level,
                  },
                }) && (
                    <button
                      onClick={() => handlePurchaseReservedCard(card)}
                      className="absolute -bottom-4 left-1/2 -translate-x-1/2 
                              px-4 py-1 bg-blue-500 text-white text-sm rounded-lg
                              shadow-md shadow-blue-500/30
                              hover:bg-blue-600 hover:shadow-blue-600/30
                              active:transform active:scale-95
                              transition-all duration-200"
                    >
                      购买
                    </button>
                  )}
              </div>
            ))}
          </div>
        </div>

        {/* 右侧：贵族区域 */}
        {player.nobles.length > 0 && (
          <div>
            <h3 className="text-sm font-bold mb-1">贵族:</h3>
            <div className="flex flex-col gap-2">
              {player.nobles.map((noble) => (
                <div key={noble.id} className="transform scale-75 origin-top-left -ml-6">
                  <Noble noble={noble} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 
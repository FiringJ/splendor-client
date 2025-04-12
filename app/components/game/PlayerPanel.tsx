'use client';

import type { PlayerPanelProps } from '../../types/components';
import { GemType, Card as CardType } from '../../types/game';
import { Card } from './Card';
import { Noble } from './Noble';
import { useGameStore } from '../../store/gameStore';
import { useSocket } from '../../hooks/useSocket';
import { useRoomStore } from '../../store/roomStore';
import { useUserStore } from '../../store/userStore';
import { GameValidator } from '../../lib/game/validator';

const gemColorMap: Record<GemType, string> = {
  diamond: 'text-gray-700 bg-gradient-to-br from-white to-gray-200 border-gray-300',
  sapphire: 'text-white bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300',
  emerald: 'text-white bg-gradient-to-br from-green-400 to-green-600 border-green-300',
  ruby: 'text-white bg-gradient-to-br from-red-400 to-red-600 border-red-300',
  onyx: 'text-white bg-gradient-to-br from-gray-700 to-gray-900 border-gray-600',
  gold: 'text-gray-800 bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-300',
};

const gemNameMap: Record<GemType, string> = {
  diamond: '钻石',
  sapphire: '蓝宝石',
  emerald: '祖母绿',
  ruby: '红宝石',
  onyx: '黑曜石',
  gold: '黄金',
};

export const PlayerPanel = ({ player, isActive }: PlayerPanelProps) => {
  const gameState = useGameStore(state => state.gameState);
  const roomId = useRoomStore(state => state.roomId);
  const currentUserId = useUserStore(state => state.playerId);
  const { performGameAction } = useSocket();

  const isSelf = player.id === currentUserId;

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
      p-2 md:p-3 rounded-lg shadow-md border 
      transition-all duration-300
      ${isActive
        ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300 shadow-yellow-100'
        : 'bg-white border-gray-100 hover:border-indigo-100 hover:shadow-md'}
      ${isSelf ? 'order-first' : ''}
    `}>
      {/* 玩家信息头部 */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-1.5">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-xs">
              {player.name.charAt(0)}
            </div>
            <span className="font-medium text-gray-800 text-sm">{player.name}</span>
          </div>
          {isActive && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <svg className="w-1.5 h-1.5 mr-1 text-yellow-400 animate-ping" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" />
              </svg>
              当前回合
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <div className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            {player.points}
          </div>
          <span className="text-xs text-gray-600">分</span>
        </div>
      </div>

      {/* 宝石资源区域 */}
      <div className="mb-2 p-2 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-xs font-medium text-gray-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
            </svg>
            宝石资源
          </h3>
          <span className="text-xs px-1.5 py-0.5 bg-white rounded-full shadow-sm text-gray-500 font-medium">
            {Object.values(player.gems).reduce((a, b) => a + b, 0)}/10
          </span>
        </div>

        {/* 宝石资源栏 - 水平紧凑布局 */}
        <div className="flex justify-around">
          {(['diamond', 'sapphire', 'emerald', 'ruby', 'onyx', 'gold'] as GemType[]).map((gemType) => (
            <div key={gemType} className="flex flex-col items-center">
              <div className="flex flex-row items-center gap-1">
                <div className={`w-5 h-5 rounded-md ${gemColorMap[gemType]} 
                            flex items-center justify-center text-xs font-bold shadow-sm border
                            select-none text-center`}
                  title={`${gemNameMap[gemType]}卡牌数量`}>
                  {gemType !== 'gold' ? player.cards.filter(card => card.gem === gemType).length : ''}
                </div>
                <div className={`w-5 h-5 rounded-full ${gemColorMap[gemType]} 
                              flex items-center justify-center text-xs font-bold shadow-sm border
                              select-none ${player.gems[gemType] ? '' : 'opacity-40'}`}
                  title={`${gemNameMap[gemType]}宝石数量`}>
                  {player.gems[gemType] || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REQ-009 & REQ-013: 只为当前玩家显示预留卡和贵族，并优化布局 */}
      {isSelf ? (
        // REQ-013: 使用两行横向布局
        <div className="grid grid-cols-2 gap-2 mt-2">
          {/* 左侧：预留卡区域 - 两行横向 */}
          <div className="bg-blue-50 rounded-lg p-1.5">
            <h3 className="text-xs font-medium text-blue-700 mb-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              预留卡: {player.reservedCards.length}/3
            </h3>
            {/* 使用 grid 实现两行，每行最多2个 */}
            <div className="grid grid-rows-2 grid-flow-col gap-x-1 gap-y-0 justify-center items-center min-h-[110px]">
              {player.reservedCards.length > 0 ? (
                player.reservedCards.map((card) => (
                  <div
                    key={card.id}
                    className="transform scale-[0.55] md:scale-[0.6] origin-center flex-shrink-0 -my-3 md:-my-2" // 调整 scale 和 margin
                  >
                    <div className="relative">
                      <Card
                        card={card}
                        disabled={!isActive}
                      />
                      {isActive && GameValidator.canPurchaseCard(gameState!, {
                        type: 'PURCHASE_CARD',
                        payload: { cardId: card.id },
                      }) && (
                          <button
                            onClick={() => handlePurchaseReservedCard(card)}
                            className="absolute -bottom-4 left-1/2 -translate-x-1/2 
                                  px-2 py-0.5 bg-blue-500 text-white text-xs rounded-md
                                  shadow-md shadow-blue-500/30
                                  hover:bg-blue-600 hover:shadow-blue-600/30
                                  active:transform active:scale-95
                                  transition-all duration-200 whitespace-nowrap"
                          >
                            购买
                          </button>
                        )}
                    </div>
                  </div>
                ))
              ) : (
                <span className="row-span-2 flex items-center justify-center w-full h-full text-xs text-blue-400 italic">无预留卡</span>
              )}
            </div>
          </div>

          {/* 右侧：贵族区域 - 两行横向 */}
          <div className="bg-purple-50 rounded-lg p-1.5">
            <h3 className="text-xs font-medium text-purple-700 mb-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              贵族: {player.nobles.length}
            </h3>
            {/* 使用 grid 实现两行，每行最多... 根据需要调整 */}
            <div className="grid grid-rows-2 grid-flow-col gap-x-0 gap-y-0 justify-center items-center min-h-[85px]">
              {player.nobles.length > 0 ? (
                player.nobles.map((noble) => (
                  <div
                    key={noble.id}
                    className={`transform scale-[0.55] md:scale-[0.6] origin-center flex-shrink-0 -my-3 md:-my-2`} // 调整 scale 和 margin
                  >
                    <Noble noble={noble} />
                  </div>
                ))
              ) : (
                <span className="row-span-2 flex items-center justify-center w-full h-full text-xs text-purple-400 italic">无贵族</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        // REQ-014: 其他玩家：显示数量
        <div className="flex justify-between items-center mt-2 px-1 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            <span>预留: {player.reservedCards.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span>贵族: {player.nobles.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}; 
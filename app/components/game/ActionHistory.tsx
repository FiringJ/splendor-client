'use client';

import { useEffect, useRef } from 'react';
import type { ActionHistoryProps } from '../../types/components';
import type { GameAction, GemType, Card, Noble, GameState as GameStateType } from '../../types/game';
import { useGameStore } from '../../store/gameStore';

// 不再使用颜色映射，改为使用图标更直观
const gemIconMap: Record<GemType, string> = {
  diamond: '💎',
  sapphire: '🔷',
  emerald: '🟢',
  ruby: '🔴',
  onyx: '⚫',
  gold: '🟡',
};

const getActionIcon = (action: GameAction) => {
  switch (action.type) {
    case 'TAKE_GEMS':
      return '💰';
    case 'PURCHASE_CARD':
      return '🛒';
    case 'RESERVE_CARD':
      return '📝';
    case 'CLAIM_NOBLE':
      return '👑';
    case 'RESTART_GAME':
      return '🔄';
    default:
      return '❓';
  }
};

// 查找卡牌
const findCard = (gameState: GameStateType | null, cardId: number): Card | undefined => {
  if (!gameState) return undefined;
  
  // 需要同时在所有可能的地方查找卡牌
  const allCards = [
    ...gameState.cards.level1,
    ...gameState.cards.level2,
    ...gameState.cards.level3,
    ...gameState.cards.deck1,
    ...gameState.cards.deck2,
    ...gameState.cards.deck3,
    ...gameState.players.flatMap(p => [...p.cards, ...p.reservedCards])
  ];
  return allCards.find(card => card.id === cardId);
};

// 查找贵族
const findNoble = (gameState: GameStateType | null, nobleId: number): Noble | undefined => {
  if (!gameState) return undefined;
  
  // 查找贵族，包括已被获得的和仍在展示区的
  const allNobles = [
    ...gameState.nobles,
    ...gameState.players.flatMap(p => p.nobles)
  ];
  return allNobles.find(noble => noble.id === nobleId);
};

// 获取卡牌描述
const getCardDescription = (card: Card | undefined): string => {
  if (!card) return '卡牌';
  
  const levelMap: Record<number, string> = { 1: '初级', 2: '中级', 3: '高级' };
  const gemIcon = gemIconMap[card.gem];
  const pointsText = card.points > 0 ? `${card.points}分` : '';
  
  return `${levelMap[card.level]}${gemIcon}${pointsText}卡牌`;
};

const formatAction = (action: GameAction, gameState: GameStateType | null) => {
  switch (action.type) {
    case 'TAKE_GEMS':
      const gems = Object.entries(action.payload.gems)
        .filter(([, count]) => count > 0)
        .map(([gem, count]) => {
          const gemType = gem as GemType;
          return `${count}${gemIconMap[gemType]}`;
        });
      return `获取宝石：${gems.join(' ')}`;
      
    case 'PURCHASE_CARD': {
      const card = findCard(gameState, action.payload.cardId);
      return `购买${getCardDescription(card)}`;
    }
      
    case 'RESERVE_CARD':
      if (action.payload.cardId === -1) {
        return `从牌堆预留${action.payload.level}级卡牌`;
      } else {
        const card = findCard(gameState, action.payload.cardId);
        return `预留${getCardDescription(card)}`;
      }
      
    case 'CLAIM_NOBLE': {
      const noble = findNoble(gameState, action.payload.nobleId);
      if (noble) {
        return `获得贵族「${noble.name}」(${noble.points}分)`;
      }
      return '获得一位贵族';
    }
      
    case 'RESTART_GAME':
      return '重新开始游戏';
      
    default:
      return '未知操作';
  }
};

export const ActionHistory = ({ actions }: ActionHistoryProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const gameState = useGameStore(state => state.gameState);
  
  // 自动滚动到底部，当actions变化或actions长度变化时触发
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [actions, actions.length]);

  // 获取玩家名字的辅助函数
  const getPlayerName = (playerId?: string) => {
    if (!gameState || !playerId) return '';
    
    // 正确获取player对象，players是一个Map
    const player = Array.from(gameState.players.values()).find(p => p.id === playerId);
    return player ? player.name : '';
  };

  return (
    <div 
      ref={scrollRef}
      className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-1.5 max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
    >
      <h3 className="text-xs font-medium text-gray-700 mb-1 px-1 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-3.707-8.707a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L10 9.586l-.879-.879z" clipRule="evenodd" />
        </svg>
        操作记录
      </h3>
      
      {actions.length === 0 ? (
        <div className="text-gray-500 text-center p-2 italic text-xs">
          <p>暂无操作记录</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {actions.map((action, index) => {
            // 正确获取playerId
            const playerId = 'playerId' in action ? action.playerId : undefined;
            const playerName = getPlayerName(playerId);
            
            return (
              <div
                key={index}
                className={`
                  text-xs flex items-start gap-1 py-1 px-1 border-b border-gray-100 last:border-b-0
                  ${index === actions.length - 1 ? 'bg-blue-50 rounded' : ''}
                `}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {getActionIcon(action)}
                </div>
                <div className="flex-1">
                  {playerName && (
                    <span className="font-medium text-indigo-600 mr-1">{playerName}</span>
                  )}
                  <span className={index === actions.length - 1 ? 'font-medium text-blue-700' : 'text-gray-600'}>
                    {formatAction(action, gameState)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
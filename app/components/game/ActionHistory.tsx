'use client';

import { useEffect, useRef } from 'react';
import type { ActionHistoryProps } from '../../types/components';
import type { GameAction, GemType, Card, Noble, GameState as GameStateType } from '../../types/game';
import { useGameStore } from '../../store/gameStore';
import { DecisionPanel, decisionBadgeClass } from './DecisionPanel';

// 使用颜色映射，与 PlayerPanel 保持一致
const gemColorMap: Record<GemType, string> = {
  diamond: 'bg-gradient-to-br from-white to-gray-200 border-gray-300',
  sapphire: 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300',
  emerald: 'bg-gradient-to-br from-green-400 to-green-600 border-green-300',
  ruby: 'bg-gradient-to-br from-red-400 to-red-600 border-red-300',
  onyx: 'bg-gradient-to-br from-gray-700 to-gray-900 border-gray-600',
  gold: 'bg-gradient-to-br from-gray-100 to-gray-300 border-gray-200', // 使用更新后的金色
};

const gemTextColorMap: Record<GemType, string> = {
  diamond: 'text-gray-700',
  sapphire: 'text-white',
  emerald: 'text-white',
  ruby: 'text-white',
  onyx: 'text-white',
  gold: 'text-gray-800',
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
const getCardDescription = (card: Card | undefined): React.ReactNode => {
  if (!card) return '卡牌';

  const levelMap: Record<number, string> = { 1: '初级', 2: '中级', 3: '高级' };
  // 使用宝石方块图标代替 Emoji
  const gemIcon = (
    <span className={`inline-block w-2.5 h-2.5 rounded-sm ${gemColorMap[card.gem]} border mr-0.5 align-middle`}></span>
  );
  const pointsText = card.points > 0 ? `${card.points}分` : '';

  return (
    <>
      {levelMap[card.level]}
      {gemIcon}
      {pointsText}卡牌
    </>
  );
};

const formatAction = (action: GameAction, gameState: GameStateType | null) => {
  switch (action.type) {
    case 'TAKE_GEMS':
      const gemsTaken = Object.entries(action.payload.gems)
        .filter(([, count]) => count > 0)
        .map(([gem, count]) => {
          const gemType = gem as GemType;
          return (
            <span key={gemType} className="inline-flex items-center mx-0.5">
              <span className={`w-3 h-3 rounded-full ${gemColorMap[gemType]} border ${gemTextColorMap[gemType]} flex items-center justify-center text-[8px] font-bold mr-0.5`}>
                {count}
              </span>
            </span>
          );
        });
      return <span>获取宝石：{gemsTaken}</span>;

    case 'PURCHASE_CARD': {
      const card = findCard(gameState, action.payload.cardId);
      return <span>购买{getCardDescription(card)}</span>;
    }

    case 'RESERVE_CARD':
      if (action.payload.cardId === -1) {
        return <span>从牌堆预留{action.payload.level}级卡牌</span>;
      } else {
        const card = findCard(gameState, action.payload.cardId);
        return <span>预留{getCardDescription(card)}</span>;
      }

    case 'CLAIM_NOBLE': {
      const noble = findNoble(gameState, action.payload.nobleId);
      if (noble) {
        return <span>获得贵族「{noble.name}」({noble.points}分)</span>;
      }
      return <span>获得一位贵族</span>;
    }

    case 'RESTART_GAME':
      return <span>重新开始游戏</span>;

    case 'DISCARD_GEMS': {
      const gemsDiscarded = Object.entries(action.payload.gems)
        .filter(([, count]) => count > 0)
        .map(([gem, count]) => {
          const gemType = gem as GemType;
          return (
            <span key={gemType} className="inline-flex items-center mx-0.5">
              <span className={`w-3 h-3 rounded-full ${gemColorMap[gemType]} border ${gemTextColorMap[gemType]} flex items-center justify-center text-[8px] font-bold mr-0.5`}>
                {count}
              </span>
            </span>
          );
        });
      return <span>丢弃宝石：{gemsDiscarded}</span>;
    }

    default:
      return <span>未知操作</span>;
  }
};

interface ActionHistoryViewProps extends ActionHistoryProps {
  /** When false, the list grows with its parent instead of nesting another scroller. */
  framed?: boolean;
  testId?: string;
}

export const ActionHistory = ({
  actions,
  framed = true,
  testId = 'action-history',
}: ActionHistoryViewProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const gameState = useGameStore(state => state.gameState);
  const latestDecision = useGameStore(state => state.latestDecision);
  const decisionsByActionIndex = useGameStore(state => state.decisionsByActionIndex);

  // 自动滚动到底部，当actions变化或actions长度变化时触发
  useEffect(() => {
    const node = scrollRef.current;
    if (!node || node.scrollHeight <= node.clientHeight) return;
    node.scrollTop = node.scrollHeight;
  }, [actions, actions.length]);

  // 获取玩家名字的辅助函数
  const getPlayerName = (playerId?: string) => {
    if (!gameState || !playerId) return '';

    // 正确获取player对象，players是一个Map
    const player = Array.from(gameState.players.values()).find(p => p.id === playerId);
    return player ? player.name : '';
  };

  return (
    <div data-testid={testId}>
      {latestDecision && <DecisionPanel meta={latestDecision} />}
      <div
        ref={scrollRef}
        className={framed
          ? 'max-h-44 overflow-y-auto rounded-xl border border-indigo-100 bg-white/90 p-1.5 shadow-sm'
          : 'overflow-visible'}
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
            const decision = decisionsByActionIndex[index];

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
                  {decision && (
                    <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[10px] text-gray-500">
                      <span data-testid={`decision-source-${index}`} className={decisionBadgeClass(decision.source)}>
                        {decision.source}
                      </span>
                      {decision.chosenOptionLabel && <span>{decision.chosenOptionLabel}</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
};
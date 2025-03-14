'use client';

import { useEffect, useRef } from 'react';
import type { ActionHistoryProps } from '../../types/components';
import type { GameAction, GemType } from '../../types/game';

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

const formatAction = (action: GameAction) => {
  switch (action.type) {
    case 'TAKE_GEMS':
      const gems = Object.entries(action.payload.gems)
        .filter(([, count]) => count > 0)
        .map(([gem, count]) => {
          const gemType = gem as GemType;
          return `${count}${gemIconMap[gemType]}`;
        });
      return `获取宝石：${gems.join(' ')}`;
    case 'PURCHASE_CARD':
      return `购买卡牌 #${action.payload.cardId}`;
    case 'RESERVE_CARD':
      return `预定卡牌 #${action.payload.cardId}`;
    case 'CLAIM_NOBLE':
      return `获得贵族 #${action.payload.nobleId}`;
    case 'RESTART_GAME':
      return '重新开始游戏';
    default:
      return '未知操作';
  }
};

export const ActionHistory = ({ actions }: ActionHistoryProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [actions]);

  return (
    <div 
      ref={scrollRef}
      className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-1.5 max-h-[150px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
    >
      {actions.length === 0 ? (
        <div className="text-gray-500 text-center p-2 italic text-xs">
          <p>暂无操作记录</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {actions.map((action, index) => (
            <div
              key={index}
              className={`
                text-xs flex items-start gap-1 py-1 border-b border-gray-100 last:border-b-0
                ${index === actions.length - 1 ? 'font-medium text-blue-700' : 'text-gray-600'}
              `}
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                {getActionIcon(action)}
              </div>
              <div className="flex-1 truncate">
                {formatAction(action)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
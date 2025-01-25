'use client';

import type { ActionHistoryProps } from '../../types/components';
import type { GameAction, GemType } from '../../types/game';

const gemColors: Record<GemType, string> = {
  red: 'text-red-500',
  green: 'text-green-500',
  blue: 'text-blue-500',
  white: 'text-gray-500',
  black: 'text-gray-800',
  gold: 'text-yellow-500',
};

const gemNames: Record<GemType, string> = {
  red: '红宝石',
  green: '祖母绿',
  blue: '蓝宝石',
  white: '钻石',
  black: '玛瑙',
  gold: '黄金',
};

const formatAction = (action: GameAction) => {
  switch (action.type) {
    case 'TAKE_GEMS':
      return `获取宝石：${Object.entries(action.payload.gems)
        .filter(([_, count]) => count > 0)
        .map(([gem, count]) => `${count} 个${gemNames[gem as GemType]}`)
        .join('、')}`;
    case 'PURCHASE_CARD':
      return `购买卡牌：${action.payload.cardId}`;
    case 'RESERVE_CARD':
      return `预定卡牌：${action.payload.cardId}`;
    case 'CLAIM_NOBLE':
      return `获得贵族：${action.payload.nobleId}`;
    default:
      return '未知操作';
  }
};

export const ActionHistory = ({ actions }: ActionHistoryProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-h-[400px] overflow-y-auto">
      {actions.length === 0 ? (
        <div className="text-gray-500 text-center">暂无操作记录</div>
      ) : (
        <div className="flex flex-col gap-2">
          {actions.map((action, index) => (
            <div
              key={index}
              className="text-sm text-gray-600 border-b border-gray-100 last:border-b-0 py-2"
            >
              {formatAction(action)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 
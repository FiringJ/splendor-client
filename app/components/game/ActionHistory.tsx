'use client';

import type { ActionHistoryProps } from '../../types/components';
import type { GameAction, GemType } from '../../types/game';

const gemColorMap: Record<GemType, string> = {
  diamond: 'text-gray-500',
  sapphire: 'text-blue-500',
  emerald: 'text-green-500',
  ruby: 'text-red-500',
  onyx: 'text-gray-800',
  gold: 'text-yellow-500',
};

const gemNameMap: Record<GemType, string> = {
  diamond: '钻石',
  sapphire: '蓝宝石',
  emerald: '祖母绿',
  ruby: '红宝石',
  onyx: '玛瑙',
  gold: '黄金',
};

const formatAction = (action: GameAction) => {
  switch (action.type) {
    case 'TAKE_GEMS':
      return `获取宝石：${Object.entries(action.payload.gems)
        .filter(([, count]) => count > 0)
        .map(([gem, count]) => `${count} 个${gemNameMap[gem as GemType]}`)
        .join('、')}`;
    case 'PURCHASE_CARD':
      return `购买卡牌：${action.payload.cardId}`;
    case 'RESERVE_CARD':
      return `预定卡牌：${action.payload.cardId}`;
    case 'CLAIM_NOBLE':
      return `获得贵族：${action.payload.nobleId}`;
    case 'RESTART_GAME':
      return '重新开始游戏';
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
              className={`text-sm ${gemColorMap[action.type === 'TAKE_GEMS' ? (Object.entries(action.payload.gems).find(([, count]) => count > 0)?.[0] as GemType) || 'diamond' : 'diamond']} border-b border-gray-100 last:border-b-0 py-2`}
            >
              {formatAction(action)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
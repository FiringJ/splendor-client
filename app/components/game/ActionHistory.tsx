import { useGameStore } from '../../store/gameStore';
import type { GameStore } from '../../store/gameStore';
import type { GameAction } from '../../types/game';

export const ActionHistory = () => {
  const actionHistory = useGameStore((state: GameStore) => state.actionHistory);

  const formatAction = (action: GameAction) => {
    switch (action.type) {
      case 'takeGems':
        return `${action.playerName} 获取了宝石: ${Object.entries(action.details.gems || {})
          .map(([gem, count]) => `${count}个${gem}`)
          .join(', ')}`;
      case 'purchaseCard':
        return `${action.playerName} 购买了一张${action.details.card?.points}点数的卡牌`;
      case 'reserveCard':
        return `${action.playerName} 预留了一张卡牌`;
      case 'acquireNoble':
        return `${action.playerName} 获得了一位贵族`;
      default:
        return '未知操作';
    }
  };

  return (
    <div className="fixed right-4 top-4 w-64 bg-white rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
      <h3 className="font-bold mb-2">操作历史</h3>
      <div className="space-y-2">
        {actionHistory.map((action, index) => (
          <div key={index} className="text-sm text-gray-600 border-b pb-1">
            {formatAction(action)}
          </div>
        ))}
      </div>
    </div>
  );
}; 
import { useGameStore } from '../../store/gameStore';
import type { GameStore } from '../../store/gameStore';

export const GameStatus = () => {
  const gameState = useGameStore((state: GameStore) => state.gameState);

  if (!gameState) return null;

  const currentPlayer = gameState.players[gameState.currentPlayer];

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 
                    bg-white shadow-lg rounded-lg px-6 py-3 z-50">
      <div className="text-center">
        <div className="font-bold text-lg mb-2">
          {currentPlayer.name} 的回合
        </div>
        <div className="text-sm text-gray-600">
          请选择一个操作：
          <ul className="mt-1">
            <li>• 收集宝石</li>
            <li>• 购买发展卡</li>
            <li>• 预留发展卡</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 
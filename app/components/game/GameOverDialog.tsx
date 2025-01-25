'use client';

import type { GameOverDialogProps } from '../../types/components';
import { useGameStore } from '../../store/gameStore';

export const GameOverDialog = ({ onPlayAgain }: GameOverDialogProps) => {
  const gameState = useGameStore(state => state.gameState);

  if (!gameState?.winner) return null;

  const handlePlayAgain = () => {
    const action = {
      type: 'RESTART_GAME' as const,
      payload: {},
    };
    onPlayAgain(action);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-4">游戏结束</h2>
        <p className="text-lg text-center mb-6">
          恭喜 {gameState.winner.name} 获得胜利！
        </p>
        <div className="flex justify-center">
          <button
            onClick={handlePlayAgain}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            再来一局
          </button>
        </div>
      </div>
    </div>
  );
}; 
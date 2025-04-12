'use client';

import type { GameOverDialogProps } from '../../types/components';
import { useGameStore } from '../../store/gameStore';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const GameOverDialog = ({ onPlayAgain }: GameOverDialogProps) => {
  const gameState = useGameStore(state => state.gameState);
  const resetGameState = useGameStore(state => state.resetGameState);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (!gameState?.winner) return null;

  const handlePlayAgain = async () => {
    try {
      setIsLoading(true);
      const action = {
        type: 'RESTART_GAME' as const,
        payload: {
          players: Array.from(gameState.players.values()).map(p => p.id)
        }
      };
      await onPlayAgain(action);
    } catch (error) {
      console.error('重新开始游戏失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnToLobby = () => {
    resetGameState();
    router.push('/');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 md:p-8 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">游戏结束</h2>
        <p className="text-lg text-center mb-6 text-gray-600">
          恭喜 <span className="font-semibold text-indigo-600">{gameState.winner.name}</span> 获得胜利！
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleReturnToLobby}
            className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            返回大厅
          </button>
          <button
            onClick={handlePlayAgain}
            disabled={isLoading}
            className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isLoading ? '处理中...' : '再来一局'}
          </button>
        </div>
      </div>
    </div>
  );
}; 
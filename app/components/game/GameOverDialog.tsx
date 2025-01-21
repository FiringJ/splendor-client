import { useGameStore } from '../../store/gameStore';

export const GameOverDialog = () => {
  const gameState = useGameStore(state => state.gameState);

  if (!gameState || gameState.status !== 'finished' || !gameState.winner) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
        <h2 className="text-2xl font-bold mb-4">游戏结束！</h2>
        <div className="mb-6">
          <p className="text-xl text-gray-800">
            恭喜 <span className="text-blue-600 font-bold">{gameState.winner}</span> 获得胜利！
          </p>
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            开始新游戏
          </button>
        </div>
      </div>
    </div>
  );
}; 
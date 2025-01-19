import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { Player } from '../../types/game';

export const GameSetup: React.FC = () => {
  const [playerCount, setPlayerCount] = useState(2);
  const [includeAI, setIncludeAI] = useState(false);
  const initializeGame = useGameStore(state => state.initializeGame);
  const enableAI = useGameStore(state => state.enableAI);

  const handleStartGame = () => {
    const players: Player[] = Array(playerCount).fill(null).map((_, index) => {
      if (includeAI && index === playerCount - 1) {
        return {
          id: `player-${index}`,
          name: 'AI',
          gems: {},
          cards: [],
          reservedCards: [],
          nobles: [],
          points: 0
        };
      }
      return {
        id: `player-${index}`,
        name: `玩家 ${index + 1}`,
        gems: {},
        cards: [],
        reservedCards: [],
        nobles: [],
        points: 0
      };
    });

    initializeGame(players);
    enableAI(includeAI);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800">游戏设置</h2>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            玩家数量
          </label>
          <select
            value={playerCount}
            onChange={(e) => setPlayerCount(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2}>2人</option>
            <option value={3}>3人</option>
            <option value={4}>4人</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeAI"
            checked={includeAI}
            onChange={(e) => setIncludeAI(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="includeAI" className="ml-2 text-sm font-medium text-gray-700">
            包含AI玩家（替换最后一个玩家）
          </label>
        </div>

        <button
          onClick={handleStartGame}
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          开始游戏
        </button>
      </div>
    </div>
  );
}; 
'use client';

import { useGameStore } from '../../store/gameStore';
import { useRoomStore } from '../../store/roomStore';
import { useSocket } from '../../hooks/useSocket';
import { GemType } from '../../types/game';

export const GameTester = () => {
  const gameState = useGameStore(state => state.gameState);
  const roomId = useRoomStore(state => state.roomId);
  const { performGameAction } = useSocket();

  if (!gameState || !roomId) return null;

  const testTakeGems = async () => {
    const action = {
      type: 'TAKE_GEMS' as const,
      payload: {
        gems: {
          red: 1,
          green: 1,
          blue: 1,
          white: 0,
          black: 0,
          gold: 0,
        },
      },
    };
    await performGameAction(roomId, action);
  };

  const testPurchaseCard = async () => {
    if (gameState.cards.level1.length === 0) return;
    const card = gameState.cards.level1[0];
    const action = {
      type: 'PURCHASE_CARD' as const,
      payload: {
        cardId: card.id,
        level: 1,
      },
    };
    await performGameAction(roomId, action);
  };

  const testReserveCard = async () => {
    if (gameState.cards.level1.length === 0) return;
    const card = gameState.cards.level1[0];
    const action = {
      type: 'RESERVE_CARD' as const,
      payload: {
        cardId: card.id,
        level: 1,
      },
    };
    await performGameAction(roomId, action);
  };

  const testClaimNoble = async () => {
    if (gameState.nobles.length === 0) return;
    const noble = gameState.nobles[0];
    const action = {
      type: 'CLAIM_NOBLE' as const,
      payload: {
        nobleId: noble.id,
      },
    };
    await performGameAction(roomId, action);
  };

  const testToggleAI = async () => {
    const action = {
      type: 'TOGGLE_AI' as const,
      payload: {
        enabled: !gameState.isAIEnabled,
      },
    };
    await performGameAction(roomId, action);
  };

  const testRestartGame = async () => {
    const action = {
      type: 'RESTART_GAME' as const,
      payload: {},
    };
    await performGameAction(roomId, action);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 space-y-2 z-50">
      <h3 className="font-bold text-lg mb-4">游戏操作测试</h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={testTakeGems}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          获取宝石
        </button>
        <button
          onClick={testPurchaseCard}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          购买卡牌
        </button>
        <button
          onClick={testReserveCard}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          预定卡牌
        </button>
        <button
          onClick={testClaimNoble}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          获得贵族
        </button>
        <button
          onClick={testToggleAI}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          切换 AI
        </button>
        <button
          onClick={testRestartGame}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          重新开始
        </button>
      </div>
    </div>
  );
}; 
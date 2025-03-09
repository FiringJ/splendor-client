"use client";

import { useSocket } from '../hooks/useSocket';
import { GameBoard } from './game/GameBoard';
import { GameSetup } from './game/GameSetup';
import { useGameStore } from '../store/gameStore';

export default function GameLayout() {
  // 将 socket 初始化移到这里
  useSocket();
  const gameState = useGameStore(state => state.gameState);

  return (
    <main className="min-h-screen bg-green-50">
      <div className="container mx-auto p-4">
        <GameSetup />
        {gameState && <GameBoard />}
      </div>
    </main>
  );
} 
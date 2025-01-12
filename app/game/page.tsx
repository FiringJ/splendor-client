'use client';

import { useEffect } from 'react';
import { GameBoard } from '../components/game/GameBoard';
import { useGameStore } from '../store/gameStore';
import type { GameStore } from '../store/gameStore';

export default function GamePage() {
  const initGame = useGameStore((state: GameStore) => state.initGame);

  useEffect(() => {
    initGame(2); // 初始化4人游戏
  }, [initGame]);

  return (
    <main className="min-h-screen bg-green-50 p-4">
      <GameBoard />
    </main>
  );
} 
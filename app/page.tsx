'use client';

import { useGameStore } from './store/gameStore';
import { GameBoard } from './components/game/GameBoard';
import { GameSetup } from './components/game/GameSetup';

export default function Home() {
  const gameState = useGameStore(state => state.gameState);

  return (
    <main className="min-h-screen bg-green-50">
      {gameState ? <GameBoard /> : <GameSetup />}
    </main>
  );
}

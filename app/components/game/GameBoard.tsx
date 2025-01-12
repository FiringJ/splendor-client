'use client';

import { useGameStore } from '../../store/gameStore';
import type { GameStore } from '../../store/gameStore';
import { Player } from '../../types/game';
import { GemToken } from './GemToken';
import { CardDisplay } from './CardDisplay';
import { PlayerPanel } from './PlayerPanel';
import { NobleDisplay } from './NobleDisplay';

export const GameBoard = () => {
  const gameState = useGameStore((state: GameStore) => state.gameState);

  if (!gameState) return null;

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="game-area">
        {/* 贵族区域 */}
        <div className="nobles-area">
          <NobleDisplay nobles={gameState.nobles} />
        </div>

        {/* 卡牌区域 */}
        <div className="cards-area">
          <CardDisplay cards={gameState.cards} />
        </div>

        {/* 宝石区域 */}
        <div className="gems-area">
          <GemToken gems={gameState.gems} />
        </div>
      </div>

      {/* 玩家区域 */}
      <div className="players-area">
        {gameState.players.map((player: Player, index: number) => (
          <PlayerPanel
            key={player.id}
            player={player}
            isActive={index === gameState.currentPlayer}
          />
        ))}
      </div>
    </div>
  );
}; 
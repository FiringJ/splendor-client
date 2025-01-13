'use client';

import { Noble as NobleType } from '../../types/game';
import { Noble } from './Noble';
import { useGameStore } from '../../store/gameStore';
import type { GameStore } from '../../store/gameStore';
import { GameValidator } from '../../lib/game/validator';

interface NobleDisplayProps {
  nobles: NobleType[];
}

export const NobleDisplay = ({ nobles }: NobleDisplayProps) => {
  const gameState = useGameStore((state: GameStore) => state.gameState);

  if (!gameState) return null;

  const currentPlayer = gameState.players[gameState.currentPlayer];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 flex-wrap">
        {nobles.map((noble) => {
          const canAcquire = GameValidator.canAcquireNoble(noble, currentPlayer);

          return (
            <div
              key={noble.id}
              className={`
                transition-transform duration-200
                ${canAcquire ? 'hover:scale-105 cursor-pointer' : ''}
                ${canAcquire ? 'ring-2 ring-yellow-400' : ''}
              `}
              title={canAcquire ? '可以获得此贵族' : undefined}
            >
              <Noble noble={noble} />
            </div>
          );
        })}
      </div>

      {nobles.length === 0 && (
        <div className="text-gray-500 text-center py-4">
          没有可用的贵族卡
        </div>
      )}
    </div>
  );
}; 
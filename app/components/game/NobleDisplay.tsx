'use client';

import type { NobleDisplayProps } from '../../types/components';
import { Noble } from './Noble';
import { useGameStore } from '../../store/gameStore';
import { GameValidator } from '../../lib/game/validator';

export const NobleDisplay = ({ nobles, onSelect }: NobleDisplayProps) => {
  const gameState = useGameStore(state => state.gameState);

  const handleNobleClick = (nobleId: string) => {
    if (!gameState) return;

    const action = {
      type: 'CLAIM_NOBLE' as const,
      payload: {
        nobleId,
      },
    };

    if (GameValidator.canClaimNoble(gameState, action)) {
      onSelect(action);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {nobles.map((noble) => (
        <Noble
          key={noble.id}
          noble={noble}
          onClick={() => handleNobleClick(noble.id)}
        />
      ))}
    </div>
  );
}; 
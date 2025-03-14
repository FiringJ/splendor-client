'use client';

import type { NobleDisplayProps } from '../../types/components';
import { Noble } from './Noble';
// import { useGameStore } from '../../store/gameStore';
// import { GameValidator } from '../../lib/game/validator';

export const NobleDisplay = ({ nobles }: NobleDisplayProps) => {
  // const gameState = useGameStore(state => state.gameState);

  // const handleNobleClick = (nobleId: number) => {
  //   if (!gameState) return;

  //   const action = {
  //     type: 'CLAIM_NOBLE' as const,
  //     payload: {
  //       nobleId,
  //     },
  //   };

  //   if (GameValidator.canClaimNoble(gameState, action)) {
  //     onSelect(action);
  //   }
  // };

  return (
    <div className="flex flex-col">
      {nobles.length === 0 ? (
        <div className="p-2 text-center text-purple-500 italic text-sm">
          <p>目前没有可用的贵族</p>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <div className="flex flex-wrap gap-2 justify-center">
            {nobles.map((noble) => (
              <div key={noble.id} className="transform hover:scale-105 transition-transform duration-300">
                <Noble
                  noble={noble}
                  // onClick={() => handleNobleClick(noble.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 
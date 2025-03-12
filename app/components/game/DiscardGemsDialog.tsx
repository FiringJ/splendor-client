'use client';

import { useGameStore } from '../../store/gameStore';
import { useRoomStore } from '../../store/roomStore';
// import { useSocket } from '../../hooks/useSocket';
import { GemType } from '../../types/game';
import { useState } from 'react';

const gemColorMap: Record<GemType, string> = {
  diamond: 'bg-white border-2',
  sapphire: 'bg-blue-500',
  emerald: 'bg-green-500',
  ruby: 'bg-red-500',
  onyx: 'bg-gray-800',
  gold: 'bg-yellow-400',
};

const gemNameMap: Record<GemType, string> = {
  diamond: '钻石',
  sapphire: '蓝宝石',
  emerald: '祖母绿',
  ruby: '红宝石',
  onyx: '玛瑙',
  gold: '黄金',
};

export function DiscardGemsDialog() {
  const gameState = useGameStore(state => state.gameState);
  const gemsToDiscard = useGameStore(state => state.gemsToDiscard);
  // const hideGemsToDiscard = useGameStore(state => state.hideGemsToDiscard);
  const roomId = useRoomStore(state => state.roomId);
  // const { performGameAction } = useSocket();
  const [selectedGems, setSelectedGems] = useState<Partial<Record<GemType, number>>>({});

  if (!gemsToDiscard?.isOpen || !gameState || !roomId) return null;

  const currentPlayer = gameState.players.find(p => p.id === gemsToDiscard.playerId);
  if (!currentPlayer) return null;

  const currentTotal = Object.values(currentPlayer.gems).reduce((sum, count) => sum + (count || 0), 0);
  const selectedTotal = Object.values(selectedGems).reduce((sum, count) => sum + (count || 0), 0);
  const remainingToDiscard = currentTotal - 10 - selectedTotal;

  const handleGemClick = (gemType: GemType) => {
    const currentGemCount = currentPlayer.gems[gemType] || 0;
    const selectedCount = selectedGems[gemType] || 0;

    if (selectedCount < currentGemCount && remainingToDiscard > 0) {
      setSelectedGems(prev => ({
        ...prev,
        [gemType]: (prev[gemType] || 0) + 1
      }));
    }
  };

  const handleConfirm = async () => {
    // if (remainingToDiscard === 0) {
    //   try {
    //     await performGameAction(roomId, {
    //       type: 'DISCARD_GEMS',
    //       playerId: gemsToDiscard.playerId,
    //       gems: selectedGems
    //     });
    //     hideGemsToDiscard();
    //   } catch (error) {
    //     console.error('Failed to discard gems:', error);
    //   }
    // }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">需要丢弃宝石</h2>
        <p className="mb-4">
          你的宝石总数为 {currentTotal}，超过了上限 10 个。
          请丢弃 {remainingToDiscard} 个宝石。
        </p>

        <div className="grid grid-cols-5 gap-4 mb-6">
          {(Object.keys(gemColorMap) as GemType[]).map((gemType) => {
            const count = currentPlayer.gems[gemType] || 0;
            const selectedCount = selectedGems[gemType] || 0;
            const remainingCount = count - selectedCount;

            if (count === 0) return null;

            return (
              <button
                key={gemType}
                className={`
                  relative p-4 rounded-lg
                  ${gemColorMap[gemType]}
                  ${remainingCount > 0 && remainingToDiscard > 0 ? 'cursor-pointer hover:opacity-80' : 'opacity-50 cursor-not-allowed'}
                  transition-all duration-200
                  flex flex-col items-center justify-center
                  shadow-lg
                `}
                onClick={() => handleGemClick(gemType)}
                disabled={remainingCount === 0 || remainingToDiscard === 0}
              >
                <span className="text-sm font-bold mb-1">{gemNameMap[gemType]}</span>
                <span className="text-lg">{remainingCount}</span>
                {selectedCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    -{selectedCount}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-4">
          <button
            className={`
              px-4 py-2 rounded
              ${remainingToDiscard === 0 ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 cursor-not-allowed'}
              text-white font-bold
              transition-colors
            `}
            onClick={handleConfirm}
            disabled={remainingToDiscard > 0}
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
} 
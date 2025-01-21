'use client';

import { useGameStore } from '../../store/gameStore';
import type { Player } from '../../types/game';
import { NobleDisplay } from './NobleDisplay';
import { CardDisplay } from './CardDisplay';
import { GemToken } from './GemToken';
import { PlayerPanel } from './PlayerPanel';
import { ConfirmDialog } from './ConfirmDialog';
import { ActionHistory } from './ActionHistory';
import { AIControl } from './AIControl';
import { GameOverDialog } from './GameOverDialog';

export const GameBoard = () => {
  const gameState = useGameStore(state => state.gameState);
  const confirmDialog = useGameStore(state => state.confirmDialog);

  if (!gameState) return null;

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="w-full max-w-[1700px] mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Splendor</h1>
          <AIControl />
        </div>
        {confirmDialog && (
          <ConfirmDialog
            isOpen={confirmDialog.isOpen}
            title={confirmDialog.title}
            message={confirmDialog.message}
            onConfirm={() => {
              confirmDialog.onConfirm();
              useGameStore.getState().hideConfirm();
            }}
            onCancel={() => useGameStore.getState().hideConfirm()}
          />
        )}
        <GameOverDialog />

        <div className="h-full mx-auto px-4 py-2 grid grid-cols-[360px_minmax(600px,_1fr)_400px] gap-4">
          {/* 左侧：贵族区域和操作历史 */}
          <div className="flex flex-col gap-4 w-full">
            <div className="w-full">
              <h3 className="text-lg font-bold text-purple-800 mb-2">贵族区域</h3>
              <NobleDisplay nobles={gameState.nobles} />
            </div>
            <div className="w-full">
              <h3 className="text-lg font-bold text-gray-800 mb-2">操作历史</h3>
              <ActionHistory />
            </div>
          </div>

          {/* 中间：卡牌区域 */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">发展卡</h3>
            <div className="w-full flex justify-center">
              <CardDisplay cards={gameState.cards} />
            </div>
          </div>

          {/* 右侧：宝石和玩家信息 */}
          <div className="flex flex-col gap-4 w-full">
            <div className="w-full bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">宝石区域</h3>
              <GemToken gems={gameState.gems} />
            </div>

            <div className="w-full bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">玩家信息</h3>
              <div className="flex flex-col gap-2">
                {gameState.players.map((player: Player, index: number) => (
                  <PlayerPanel
                    key={player.id}
                    player={player}
                    isActive={index === gameState.currentPlayer}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
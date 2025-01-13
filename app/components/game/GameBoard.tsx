'use client';

import { useGameStore } from '../../store/gameStore';
import type { GameStore } from '../../store/gameStore';
import { Player } from '../../types/game';
import { GemToken } from './GemToken';
import { CardDisplay } from './CardDisplay';
import { PlayerPanel } from './PlayerPanel';
import { NobleDisplay } from './NobleDisplay';
import { GameStatus } from './GameStatus';
import { ActionHistory } from './ActionHistory';
import { ConfirmDialog } from './ConfirmDialog';

export const GameBoard = () => {
  const gameState = useGameStore((state: GameStore) => state.gameState);
  const confirmDialog = useGameStore((state: GameStore) => state.confirmDialog);

  if (!gameState) return null;

  return (
    <div className="flex flex-col gap-2 p-2 max-h-screen overflow-auto">
      <div className="flex justify-between items-start gap-2">
        <GameStatus />
        <ActionHistory />
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

      <div className="game-area grid grid-cols-[1fr_2fr_1fr] gap-2">
        {/* 左侧：贵族区域 */}
        <div className="nobles-area flex flex-col gap-2">
          <h3 className="text-lg font-bold text-purple-800">贵族区域</h3>
          <div className="grid grid-cols-1 gap-2">
            <NobleDisplay nobles={gameState.nobles} />
          </div>
        </div>

        {/* 中间：卡牌区域 */}
        <div className="cards-area flex flex-col gap-2">
          <h3 className="text-lg font-bold text-gray-800">发展卡</h3>
          <CardDisplay cards={gameState.cards} />
        </div>

        {/* 右侧：宝石和玩家信息 */}
        <div className="right-area flex flex-col gap-2">
          <div className="gems-area">
            <h3 className="text-lg font-bold text-gray-800 mb-2">宝石区域</h3>
            <GemToken gems={gameState.gems} />
          </div>

          <div className="players-area mt-4">
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
  );
};
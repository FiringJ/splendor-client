'use client';

import { useGameStore } from '../../store/gameStore';
import { useRoomStore } from '../../store/roomStore';
import { useUserStore } from '../../store/userStore';
import { useSocket } from '../../hooks/useSocket';
import type { Player, GameAction, GemType } from '../../types/game';
import { NobleDisplay } from './NobleDisplay';
import { CardDisplay } from './CardDisplay';
import { GemToken } from './GemToken';
import { PlayerPanel } from './PlayerPanel';
import { ConfirmDialog } from './ConfirmDialog';
import { ActionHistory } from './ActionHistory';
import { AIControl } from './AIControl';
import { GameOverDialog } from './GameOverDialog';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
// import { GameTester } from './GameTester';

export const GameBoard = () => {
  const gameState = useGameStore(state => state.gameState);
  const error = useGameStore(state => state.error);
  const loading = useGameStore(state => state.loading);
  const confirmDialog = useGameStore(state => state.confirmDialog);
  const roomId = useRoomStore(state => state.roomId);
  const playerId = useUserStore(state => state.playerId);
  const { performGameAction } = useSocket();

  if (!gameState) return null;

  const handleAction = async (action: GameAction) => {
    if (!roomId) return;
    try {
      await performGameAction(roomId, action);
    } catch (error) {
      console.error('Failed to perform action:', error);
    }
  };

  const isCurrentPlayer = playerId === gameState.currentTurn;

  const handleGemSelect = (gemType: GemType) => {
    handleAction({
      type: 'TAKE_GEMS',
      payload: {
        gems: { [gemType]: 1 } as Record<GemType, number>
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="w-full max-w-[1700px] mx-auto">
        {/* 错误提示 */}
        {error && (
          <Alert
            type="error"
            message={error}
            className="mb-4"
            onClose={() => useGameStore.getState().setError(null)}
          />
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Spinner />
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Splendor</h1>
          <AIControl onToggle={handleAction} />
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
        <GameOverDialog onPlayAgain={handleAction} />

        <div className="h-full mx-auto px-4 py-2 grid grid-cols-[360px_minmax(600px,_1fr)_400px] gap-4">
          {/* 左侧：贵族区域和操作历史 */}
          <div className="flex flex-col gap-4 w-full">
            <div className="w-full">
              <h3 className="text-lg font-bold text-purple-800 mb-2">贵族区域</h3>
              <NobleDisplay nobles={gameState.nobles} onSelect={handleAction} />
            </div>
            <div className="w-full">
              <h3 className="text-lg font-bold text-gray-800 mb-2">操作历史</h3>
              <ActionHistory actions={gameState.actions} />
            </div>
          </div>

          {/* 中间：卡牌区域 */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">发展卡</h3>
            <div className="w-full flex justify-center">
              <CardDisplay
                cards={gameState.cards}
                onPurchase={handleAction}
                onReserve={handleAction}
                disabled={loading || !isCurrentPlayer}
              />
            </div>
          </div>

          {/* 右侧：宝石和玩家信息 */}
          <div className="flex flex-col gap-4 w-full">
            <div className="w-full bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">宝石区域</h3>
              <GemToken
                gems={gameState.gems}
                onSelect={handleGemSelect}
                disabled={loading || !isCurrentPlayer}
              />
            </div>

            <div className="w-full bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">玩家信息</h3>
              <div className="flex flex-col gap-2">
                {Array.from(gameState.players.values()).map((player: Player) => (
                  <PlayerPanel
                    key={player.id}
                    player={player}
                    isActive={player.id === gameState.currentTurn}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 游戏测试工具 */}
        {/* {process.env.NODE_ENV === 'development' && <GameTester />} */}
      </div>
    </div>
  );
};
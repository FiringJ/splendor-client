'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useRoomStore } from '../../store/roomStore';
import { useUserStore } from '../../store/userStore';
import { useSocket } from '../../hooks/useSocket';
import type { Player, GameAction, GemType } from '../../types/game';
import { useSound } from '../../hooks/useSound';
import { NobleDisplay } from './NobleDisplay';
import { CardDisplay } from './CardDisplay';
import { GemToken } from './GemToken';
import { PlayerPanel } from './PlayerPanel';
import { ConfirmDialog } from './ConfirmDialog';
import { ActionHistory } from './ActionHistory';
import { GameOverDialog } from './GameOverDialog';
import { Alert } from '../../components/ui/Alert';
import { DiscardGemsDialog } from './DiscardGemsDialog';
import { ChatPanel } from './ChatPanel';
import { BackgroundMusic } from './BackgroundMusic';
import { StatusBar } from './StatusBar';
import { Surface } from './Surface';
import { InsightSheet } from './InsightSheet';
import { BoardChromeProvider } from './boardChrome';

export const GameBoard = () => {
  const gameState = useGameStore(state => state.gameState);
  const error = useGameStore(state => state.error);
  const loading = useGameStore(state => state.loading);
  const confirmDialog = useGameStore(state => state.confirmDialog);
  const selectedGems = useGameStore(state => state.selectedGems);
  const clearSelectedGems = useGameStore(state => state.clearSelectedGems);
  const roomId = useRoomStore(state => state.roomId);
  const playerId = useUserStore(state => state.playerId);
  const { performGameAction } = useSocket();
  const playSound = useSound();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  const prevTurnRef = useRef<string | null>(null);
  const prevWinnerRef = useRef<Player | null>(null);
  const prevErrorRef = useRef<string | null>(null);
  const prevActionCountRef = useRef<number>(0);

  useEffect(() => {
    if (gameState && gameState.currentTurn === playerId && prevTurnRef.current !== playerId) {
      playSound('your_turn');
    }
    if (gameState) {
      prevTurnRef.current = gameState.currentTurn;
    }
  }, [gameState, playerId, playSound]);

  useEffect(() => {
    if (gameState && !prevTurnRef.current) {
      playSound('game_start');
    }
    if (gameState?.winner && !prevWinnerRef.current) {
      playSound('game_over');
    }
    prevWinnerRef.current = gameState?.winner ?? null;
  }, [gameState, playSound]);

  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      playSound('error');
    }
    prevErrorRef.current = error;
  }, [error, playSound]);

  useEffect(() => {
    if (!gameState || !gameState.actions) return;

    const currentActionCount = gameState.actions.length;
    if (currentActionCount > prevActionCountRef.current) {
      const newActions = gameState.actions.slice(prevActionCountRef.current);
      if (newActions.some(action => action.type === 'CLAIM_NOBLE')) {
        playSound('claim_noble');
      }
    }
    prevActionCountRef.current = currentActionCount;
  }, [gameState, playSound]);

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

  const handleConfirmGems = async () => {
    const totalSelected = Object.values(selectedGems).reduce((a, b) => a + b, 0);
    if (totalSelected === 0) return;

    try {
      useGameStore.getState().setLoading(true);
      await handleAction({
        type: 'TAKE_GEMS',
        payload: {
          gems: selectedGems as Record<GemType, number>
        }
      });
      clearSelectedGems();
    } catch (error) {
      console.error('Failed to take gems:', error);
    } finally {
      useGameStore.getState().setLoading(false);
    }
  };

  const players = Array.from(gameState.players.values());

  const renderGemBank = () => (
    <GemToken
      gems={gameState.gems}
      disabled={loading || !isCurrentPlayer}
      onConfirm={handleConfirmGems}
      onCancel={clearSelectedGems}
    />
  );

  const renderPlayerList = () => (
    <div className="flex flex-col gap-2">
      {players.map((player: Player) => (
        <PlayerPanel
          key={player.id}
          player={player}
          isActive={player.id === gameState.currentTurn}
        />
      ))}
    </div>
  );

  return (
    <BoardChromeProvider value={{ sheetOpen }}>
      <div className="flex h-dvh max-w-full flex-col overflow-hidden">
        <StatusBar />

        {error && (
          <Alert
            type="error"
            message={error}
            className="mx-2 mt-2"
            onClose={() => useGameStore.getState().setError(null)}
          />
        )}

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
        <DiscardGemsDialog />

        <div
          className={`grid min-h-0 flex-1 grid-cols-1 gap-2 px-2 pt-2 ${
            sidebarOpen ? 'md:grid-cols-[minmax(0,1fr)_20rem]' : 'md:grid-cols-[minmax(0,1fr)_4.5rem]'
          }`}
        >
          <div className="min-h-0 min-w-0 space-y-2 overflow-y-auto overflow-x-hidden overscroll-contain pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-2">
            <Surface title="贵族">
              <NobleDisplay nobles={gameState.nobles} onSelect={handleAction} />
            </Surface>

            <div className="md:hidden">
              <Surface title="宝石银行">
                {renderGemBank()}
              </Surface>
            </div>

            <Surface id="development-cards" title="发展卡">
              <CardDisplay
                cards={gameState.cards}
                onPurchase={handleAction}
                onReserve={handleAction}
                disabled={loading || !isCurrentPlayer}
              />
            </Surface>

            <div className="md:hidden">
              <Surface title="玩家">
                {renderPlayerList()}
              </Surface>
            </div>
          </div>

          <aside
            data-testid="game-sidebar"
            className="hidden min-h-0 flex-col md:flex"
          >
            <button
              type="button"
              data-testid="sidebar-toggle"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(open => !open)}
              className="btn-ghost mb-2 w-full"
            >
              {sidebarOpen ? '收起侧栏' : '展开'}
            </button>

            {sidebarOpen && (
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-0.5">
                <Surface title="宝石银行">
                  {renderGemBank()}
                </Surface>
                <Surface title="玩家">
                  {renderPlayerList()}
                </Surface>
                <Surface title="操作历史">
                  <ActionHistory actions={gameState.actions} framed={false} />
                </Surface>
              </div>
            )}
          </aside>
        </div>

        <InsightSheet
          actions={gameState.actions}
          open={sheetOpen}
          onToggle={() => setSheetOpen(open => !open)}
        />
        <ChatPanel />
        <BackgroundMusic />
      </div>
    </BoardChromeProvider>
  );
};
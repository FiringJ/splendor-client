'use client';

import { useEffect, useRef } from 'react';
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
import { Spinner } from '../../components/ui/Spinner';
import { DiscardGemsDialog } from './DiscardGemsDialog';
import { ChatPanel } from './ChatPanel';
import { BackgroundMusic } from './BackgroundMusic';
// import { DiscardGemsDialog } from './DiscardGemsDialog';

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
  }, [gameState?.currentTurn, playerId, playSound]);

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
  }, [gameState?.actions, playSound]);

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

  return (
    <div className="relative h-screen overflow-hidden">
      <div className="flex flex-col h-full items-center gap-2 p-2">
        <div className="w-full max-w-[1600px] mx-auto h-full flex flex-col">
          {/* 错误提示 */}
          {error && (
            <Alert
              type="error"
              message={error}
              className="mb-2"
              onClose={() => useGameStore.getState().setError(null)}
            />
          )}

          {/* 加载状态 */}
          {loading && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white/90 p-4 rounded-xl shadow-2xl">
                <Spinner />
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              璀璨宝石
            </h1>
            {isCurrentPlayer && (
              <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2 py-0.5 rounded-full flex items-center">
                <svg className="w-1.5 h-1.5 mr-1 text-green-500 animate-ping" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
                你的回合
              </span>
            )}
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
          <DiscardGemsDialog />
          <ChatPanel />
          <BackgroundMusic />

          {/* 移除移动设备的导航栏 */}

          {/* 桌面版布局 - REQ-003 & REQ-001 */}
          <div className="hidden md:grid md:grid-cols-[1fr_360px] gap-2 h-[calc(100vh-80px)] md:overflow-hidden">

            {/* 左侧：卡牌区域 & 贵族区域 */}
            <div className="flex flex-col gap-2 overflow-hidden">
              {/* 贵族区域 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-2 border border-indigo-100">
                <h3 className="text-sm font-bold text-purple-800 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  贵族区域
                </h3>
                <NobleDisplay nobles={gameState.nobles} onSelect={handleAction} />
              </div>
              {/* 卡牌区域 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-2 border border-indigo-100 flex-1 overflow-auto">
                <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  发展卡
                </h3>
                <CardDisplay
                  cards={gameState.cards}
                  onPurchase={handleAction}
                  onReserve={handleAction}
                  disabled={loading || !isCurrentPlayer}
                />
              </div>
            </div>

            {/* 右侧：宝石区域、玩家信息、操作历史 */}
            <div className="flex flex-col gap-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {/* 宝石区域 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-2 border border-indigo-100">
                <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  宝石区域
                </h3>
                <GemToken
                  gems={gameState.gems}
                  disabled={loading || !isCurrentPlayer}
                  onConfirm={handleConfirmGems}
                  onCancel={clearSelectedGems}
                />
              </div>

              {/* 玩家信息 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-2 border border-indigo-100">
                <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center sticky top-0 bg-white/90 z-10 pb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  玩家信息
                </h3>
                <div className="flex flex-col gap-2">
                  {Array.from(gameState.players.values()).map((player: Player) => (
                    <PlayerPanel
                      key={player.id}
                      player={player}
                      isActive={player.id === gameState.currentTurn}
                    // 将来在这里添加 isSelf 判断 (REQ-009)
                    />
                  ))}
                </div>
              </div>

              {/* 操作历史 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-2 border border-indigo-100">
                <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  操作历史
                </h3>
                <ActionHistory actions={gameState.actions} />
              </div>
            </div>
          </div>

          {/* 移动设备布局 - REQ-001 (垂直堆叠) */}
          <div className="md:hidden h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="flex flex-col gap-2 p-1">
              {/* 贵族区域 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-2 border border-indigo-100">
                <h3 className="text-xs font-bold text-purple-800 mb-1.5 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  贵族
                </h3>
                <NobleDisplay nobles={gameState.nobles} onSelect={handleAction} />
              </div>

              {/* 宝石区域 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-2 border border-indigo-100">
                <h3 className="text-xs font-bold text-gray-800 mb-1.5 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  宝石
                </h3>
                <GemToken
                  gems={gameState.gems}
                  disabled={loading || !isCurrentPlayer}
                  onConfirm={handleConfirmGems}
                  onCancel={clearSelectedGems}
                />
              </div>

              {/* 玩家信息 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-2 border border-indigo-100">
                <h3 className="text-xs font-bold text-gray-800 mb-1.5 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  玩家
                </h3>
                <div className="flex flex-col gap-1">
                  {Array.from(gameState.players.values()).map((player: Player) => (
                    <PlayerPanel
                      key={player.id}
                      player={player}
                      isActive={player.id === gameState.currentTurn}
                    // 将来在这里添加 isSelf 判断 (REQ-009)
                    />
                  ))}
                </div>
              </div>

              {/* 卡牌区域 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-2 border border-indigo-100">
                <h3 className="text-xs font-bold text-gray-800 mb-1.5 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  发展卡
                </h3>
                <CardDisplay
                  cards={gameState.cards}
                  onPurchase={handleAction}
                  onReserve={handleAction}
                  disabled={loading || !isCurrentPlayer}
                />
              </div>

              {/* 操作历史 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-2 border border-indigo-100">
                <h3 className="text-xs font-bold text-gray-800 mb-1.5 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  操作历史
                </h3>
                <ActionHistory actions={gameState.actions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
'use client';

import { useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useGameStore } from '../../store/gameStore';
import { useRoomStore } from '../../store/roomStore';
import { GameRules } from './GameRules';
import { Spinner } from '../ui/Spinner';
import { useSocketStore } from '../../store/socketStore';
import { useUserStore } from '../../store/userStore';

export function GameSetup() {
  const [playerCount, setPlayerCount] = useState('2');
  const [roomId, setRoomId] = useState('');
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const [mode, setMode] = useState<'local' | 'online'>('local');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createRoom, joinRoom, startGame } = useSocket();
  const setGameState = useGameStore(state => state.setGameState);
  const roomState = useRoomStore(state => state.roomState);
  const [playerId] = useState(() => `player_${Math.random().toString(36).substr(2, 9)}`);
  const userStore = useUserStore();
  const [playerName, setPlayerName] = useState(userStore.playerName || '');
  const [roomIdToJoin, setRoomIdToJoin] = useState('');
  const [copiedRoomId, setCopiedRoomId] = useState(false);
  const { socket } = useSocketStore();

  // 本地游戏开始时保存玩家名称
  const savePlayerName = () => {
    if (playerName.trim()) {
      userStore.setPlayer(playerId, playerName);
    }
  };

  // AI对战
  const handleLocalGame = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting AI game with player count:', playerCount);
      
      // 保存玩家名称
      savePlayerName();
      
      // 先创建房间
      const roomId = await createRoom(playerId, playerName || '玩家1');

      // 创建AI玩家加入房间
      for (let i = 1; i < parseInt(playerCount); i++) {
        const aiId = `ai_${i}_${Math.random().toString(36).substr(2, 9)}`;
        await joinRoom(roomId, aiId, true, `AI玩家${i}`);
      }

      // 开始游戏，传递isLocalMode: true参数
      const response = await startGame(roomId, true);
      if (response.success && response.gameState) {
        console.log('Game started successfully');
        setGameState(response.gameState);
      } else {
        console.error('Failed to start game:', response.error);
        setError(response.error || '启动游戏失败');
      }
    } catch (error) {
      console.error('Failed to start local game:', error);
      setError('启动游戏失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    try {
      setLoading(true);
      setError(null);
      // 保存玩家名称
      savePlayerName();
      const newRoomId = await createRoom(playerId, playerName || '玩家1');
      setRoomId(newRoomId);
      setHasJoinedRoom(true);
    } catch (error) {
      console.error('Failed to create room:', error);
      setError('创建房间失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomIdToJoin.trim()) {
      setError('请输入房间号');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // 保存玩家名称
      savePlayerName();
      const response = await joinRoom(roomIdToJoin.trim(), playerId, false, playerName || '玩家');
      if (response.success && response.room) {
        console.log('成功加入房间:', response.room);
        setRoomId(response.room.id);
        setHasJoinedRoom(true);
      } else {
        setError(response.error || '加入房间失败');
      }
    } catch (error) {
      console.error('加入房间失败:', error);
      setError('加入房间失败，请检查房间号是否正确');
    } finally {
      setLoading(false);
    }
  };

  const handleStartOnlineGame = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await startGame(roomId, false);
      if (response.success && response.gameState) {
        setGameState(response.gameState);
      } else {
        setError(response.error || '开始游戏失败');
      }
    } catch (error) {
      console.error('Failed to start game:', error);
      setError('开始游戏失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedRoomId(true);
    setTimeout(() => setCopiedRoomId(false), 2000);
  };

  const handleAddAI = async () => {
    try {
      setLoading(true);
      setError(null);
      const aiId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const aiName = `AI玩家${roomState?.players?.length || 1}`;
      const response = await joinRoom(roomId, aiId, true, aiName);
      
      if (!response.success) {
        setError(response.error || '添加AI玩家失败');
      }
    } catch (error) {
      console.error('Failed to add AI player:', error);
      setError('添加AI玩家失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAI = async (aiId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!socket) {
        throw new Error('Socket not connected');
      }
      
      return new Promise<void>((resolve, reject) => {
        socket.emit('removePlayer', { roomId, playerId: aiId }, (response: { success: boolean, error?: string }) => {
          if (response.success) {
            resolve();
          } else {
            reject(new Error(response.error || '移除AI玩家失败'));
          }
        });
      });
    } catch (error) {
      console.error('Failed to remove AI player:', error);
      setError(error instanceof Error ? error.message : '移除AI玩家失败');
    } finally {
      setLoading(false);
    }
  };

  // 判断当前玩家是否是房主
  const isHost = roomState?.hostId === playerId;

  // 判断当前玩家是否可以开始游戏
  const canStartGame = isHost && (roomState?.players?.length ?? 0) >= 2;

  const showLoading = loading && (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 p-4 rounded-xl shadow-2xl">
        <Spinner />
      </div>
    </div>
  );

  const renderPlayersList = () => {
    if (!roomState || !roomState.players) return null;
    
    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">房间玩家：</h3>
        <ul className="space-y-2">
          {roomState.players.map((player) => (
            <li key={player.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${player.id === roomState.hostId ? 'bg-yellow-400' : 'bg-green-400'}`}></span>
                <span>{player.name} {player.id === roomState.hostId && '(房主)'}</span>
                {player.isAI && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">AI</span>}
              </div>
              {isHost && player.isAI && roomState.status === 'waiting' && (
                <button
                  onClick={() => handleRemoveAI(player.id)}
                  className="text-red-500 hover:text-red-700"
                  title="移除AI玩家"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-indigo-50 to-purple-100 p-4">
      {showLoading}
      
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">璀璨宝石</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-0">玩家名称</label>
            <GameRules />
          </div>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="请输入你的名字"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="mb-6 flex justify-center space-x-4">
          <button
            onClick={() => setMode('local')}
            className={`px-4 py-2 rounded-lg flex-1 ${mode === 'local' ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-gray-200'}`}
          >
            AI对战
          </button>
          <button
            onClick={() => setMode('online')}
            className={`px-4 py-2 rounded-lg flex-1 ${mode === 'online' ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-gray-200'}`}
          >
            联机模式
          </button>
        </div>

        {mode === 'local' ? (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">AI对手数量</label>
              <select
                value={playerCount}
                onChange={(e) => setPlayerCount(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="2">1个AI对手</option>
                <option value="3">2个AI对手</option>
                <option value="4">3个AI对手</option>
              </select>
            </div>

            <button
              onClick={handleLocalGame}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white p-3 rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transform transition hover:shadow-lg"
            >
              开始游戏
            </button>
          </>
        ) : (
          <div className="space-y-4">
            {!hasJoinedRoom ? (
              <>
                <button
                  onClick={handleCreateRoom}
                  disabled={loading || !playerName.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white p-3 rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transform transition hover:shadow-lg mb-4"
                >
                  创建房间
                </button>

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <p className="text-center text-sm text-gray-500 mb-4">或者加入已有房间</p>
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={roomIdToJoin}
                    onChange={(e) => setRoomIdToJoin(e.target.value)}
                    placeholder="输入房间号"
                    className="flex-1 p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={loading || !roomIdToJoin.trim() || !playerName.trim()}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    加入房间
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-3 flex items-center justify-center space-x-2">
                    <span className="font-medium text-gray-700">房间号:</span>
                    <span className="font-mono bg-white px-3 py-1 rounded border select-all">{roomId}</span>
                    <button
                      onClick={handleCopyRoomId}
                      className="text-blue-500 hover:text-blue-600"
                      title="复制房间号"
                    >
                      {copiedRoomId ? (
                        <span className="text-green-500 text-xs">已复制!</span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {renderPlayersList()}
                  
                  <div className="mt-4 flex flex-col gap-2">
                    {isHost && roomState?.status === 'waiting' && (
                      <button
                        onClick={handleAddAI}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                        disabled={loading || (roomState?.players?.length || 0) >= 4}
                      >
                        添加AI玩家
                      </button>
                    )}
                    
                    {canStartGame && (
                      <button
                        onClick={handleStartOnlineGame}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-400"
                        disabled={loading}
                      >
                        开始游戏
                      </button>
                    )}
                    
                    {!isHost && (
                      <div className="text-center text-sm text-gray-500 mt-2">
                        等待房主开始游戏
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
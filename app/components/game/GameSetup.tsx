'use client';

import { useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useGameStore } from '../../store/gameStore';
import { useRoomStore } from '../../store/roomStore';

export function GameSetup() {
  const [playerCount, setPlayerCount] = useState('2');
  const [roomId, setRoomId] = useState('');
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const [mode, setMode] = useState<'local' | 'online'>('local');
  const { createRoom, joinRoom, startGame } = useSocket();
  const setGameState = useGameStore(state => state.setGameState);
  const roomState = useRoomStore(state => state.roomState);
  const [playerId] = useState(() => `player_${Math.random().toString(36).substr(2, 9)}`);

  // AI对战
  const handleLocalGame = async () => {
    try {
      console.log('Starting AI game with player count:', playerCount);
      
      // 先创建房间
      const roomId = await createRoom(playerId);
      console.log('Created room for AI game:', roomId);

      // 创建AI玩家加入房间
      for (let i = 1; i < parseInt(playerCount); i++) {
        const aiId = `ai_${i}_${Math.random().toString(36).substr(2, 9)}`;
        await joinRoom(roomId, aiId, true);
        console.log(`Added AI player ${i}:`, aiId);
      }

      console.log('Starting game with isLocalMode=true');
      // 开始游戏，传递isLocalMode: true参数
      const response = await startGame(roomId, true);
      if (response.success && response.gameState) {
        console.log('Game started successfully');
        setGameState(response.gameState);
      } else {
        console.error('Failed to start game:', response.error);
      }
    } catch (error) {
      console.error('Failed to start local game:', error);
    }
  };

  const handleCreateRoom = async () => {
    try {
      const newRoomId = await createRoom(playerId);
      setRoomId(newRoomId);
      setHasJoinedRoom(true);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      console.error('请输入房间号');
      return;
    }

    try {
      const response = await joinRoom(roomId.trim(), playerId);
      if (response.success && response.room) {
        console.log('成功加入房间:', response.room);
        setRoomId(response.room.id);
        setHasJoinedRoom(true);
      }
    } catch (error) {
      console.error('加入房间失败:', error);
    }
  };

  const handleStartOnlineGame = async () => {
    try {
      const response = await startGame(roomId, false);
      if (response.success && response.gameState) {
        setGameState(response.gameState);
      }
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
  };

  // 判断当前玩家是否是房主
  const isHost = roomState?.hostId === playerId;

  // 判断当前玩家是否可以开始游戏
  const canStartGame = isHost && (roomState?.players?.length ?? 0) >= 2;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">游戏设置</h1>

        <div className="mb-6 flex justify-center space-x-4">
          <button
            onClick={() => setMode('local')}
            className={`px-4 py-2 rounded ${mode === 'local' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            AI对战
          </button>
          <button
            onClick={() => setMode('online')}
            className={`px-4 py-2 rounded ${mode === 'online' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            联机模式
          </button>
        </div>

        {mode === 'local' ? (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">AI对手数量</label>
              <select
                value={playerCount}
                onChange={(e) => setPlayerCount(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="2">1个AI对手</option>
                <option value="3">2个AI对手</option>
                <option value="4">3个AI对手</option>
              </select>
            </div>

            <button
              onClick={handleLocalGame}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
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
                  className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  创建房间
                </button>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="输入房间号"
                    className="flex-1 p-2 border rounded"
                  />
                  <button
                    onClick={handleJoinRoom}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    加入房间
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="mb-2 flex items-center justify-center space-x-2">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded select-all">{roomId}</span>
                    <button
                      onClick={handleCopyRoomId}
                      className="text-blue-500 hover:text-blue-600"
                      title="复制房间号"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </button>
                  </div>
                  <div className="mb-4">
                    <h3 className="font-bold">当前玩家:</h3>
                    <ul className="list-disc list-inside">
                      {roomState?.players?.map(player => (
                        <li key={player.id} className="flex justify-between items-center">
                          {player.name}
                          {player.id === roomState?.hostId && <span className="text-sm text-gray-500">(房主)</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {canStartGame ? (
                    <button
                      onClick={handleStartOnlineGame}
                      className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
                    >
                      开始游戏
                    </button>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {!isHost ? "等待房主开始游戏" : "需要至少2名玩家才能开始游戏"}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
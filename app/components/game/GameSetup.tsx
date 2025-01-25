'use client';

import { useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useGameStore } from '../../store/gameStore';
import { useRoomStore } from '../../store/roomStore';

export function GameSetup() {
  const [playerCount, setPlayerCount] = useState('2');
  const [includeAI, setIncludeAI] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const [mode, setMode] = useState<'local' | 'online'>('local');
  const { createRoom, joinRoom, startGame } = useSocket();
  const initializeGame = useGameStore(state => state.initializeGame);
  const setGameState = useGameStore(state => state.setGameState);
  const enableAI = useGameStore(state => state.enableAI);
  const roomState = useRoomStore(state => state.roomState);
  const [playerId] = useState(() => `player_${Math.random().toString(36).substr(2, 9)}`);

  const handleLocalGame = () => {
    // 创建玩家数组
    const players = Array.from({ length: parseInt(playerCount) }, (_, i) => ({
      id: `player${i}`,
      name: i === parseInt(playerCount) - 1 && includeAI ? 'AI' : `玩家${i + 1}`,
      gems: { diamond: 0, sapphire: 0, emerald: 0, ruby: 0, onyx: 0, gold: 0 },
      cards: [],
      reservedCards: [],
      nobles: [],
      points: 0
    }));

    initializeGame(players);
    enableAI(includeAI);
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
      const response = await startGame(roomId);
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

  const isHost = roomState?.hostId === playerId;
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
            单机模式
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
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">玩家数量</label>
              <select
                value={playerCount}
                onChange={(e) => setPlayerCount(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="2">2人</option>
                <option value="3">3人</option>
                <option value="4">4人</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeAI}
                  onChange={(e) => setIncludeAI(e.target.checked)}
                  className="mr-2"
                />
                <span>包含AI玩家（替换最后一个玩家）</span>
              </label>
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
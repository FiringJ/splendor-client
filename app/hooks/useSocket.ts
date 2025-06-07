"use client";

import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useUserStore } from '../store/userStore';
import { GameState, GameAction, Player } from '../types/game';
import { useRoomStore } from '../store/roomStore';
import { RoomState, CreateRoomResponse, JoinRoomResponse, StartGameResponse } from '../types/room';
import { useSocketStore } from '../store/socketStore';

// 服务器返回的GameState，其中winner可能是string而非Player对象
interface ServerGameState extends Omit<GameState, 'players' | 'winner'> {
  players: Map<string, Player> | Player[];  // 服务器可能返回Map或Array
  winner: string | null;                    // 服务器返回winnerId
}

// 适配函数：将服务器GameState转换为客户端GameState
function adaptGameState(serverState: ServerGameState): GameState {
  // 确保players是数组形式
  const players = Array.isArray(serverState.players)
    ? serverState.players
    : Array.from(serverState.players.values());

  // 如果有获胜者ID，找到对应的Player对象
  let winner: Player | null = null;
  if (serverState.winner) {
    winner = players.find(p => p.id === serverState.winner) || null;
  }

  return {
    ...serverState,
    players,
    winner
  } as GameState;
}

export const useSocket = () => {
  const { socket, initSocket, isInitialized } = useSocketStore();
  const { setRoomId, setRoomState } = useRoomStore();
  const { setGameState, setError, setLoading } = useGameStore();
  const { setPlayer } = useUserStore();

  useEffect(() => {
    // 如果socket尚未初始化，则初始化它
    if (!isInitialized) {
      const socket = initSocket();

      // 监听房间更新
      socket.on('roomUpdate', (roomState: RoomState) => {
        console.log('Room updated:', roomState);
        setRoomState(roomState);
      });

      // 监听游戏开始
      socket.on('gameStarted', (data: { gameState: ServerGameState; room: RoomState; status: string }) => {
        try {
          console.log('Received gameStarted event:', data);
          if (!data || !data.gameState || !data.room) {
            console.error('Invalid gameStarted data received:', data);
            return;
          }

          // 先更新房间状态
          console.log('Updating room state with:', data.room);
          setRoomState(data.room);

          // 再更新游戏状态 - 使用适配函数转换
          console.log('Converting and updating game state with:', data.gameState);
          const clientGameState = adaptGameState(data.gameState);
          setGameState(clientGameState);

          console.log('Game started successfully, all states updated');
        } catch (error: unknown) {
          console.error('Error handling gameStarted event:', error);
          setError('游戏开始时出现错误，请刷新页面重试');
        }
      });

      // 监听新的游戏状态更新事件
      socket.on('gameStateUpdate', (data: { gameState: ServerGameState; action: GameAction }) => {
        console.log('Game state updated:', data);
        if (data.gameState) {
          // 转换服务器状态为客户端状态
          const clientGameState = adaptGameState(data.gameState);
          setGameState(clientGameState);

          // 如果游戏已结束且有获胜者，显示获胜者信息
          if (clientGameState.winner) {
            useGameStore.getState().showConfirm(
              '游戏结束',
              `${clientGameState.winner.name}获胜！`,
              () => { } // 空函数，只是用于显示信息
            );
          }
        }
      });

      // 监听错误消息
      socket.on('error', (error: string) => {
        console.error('Socket error:', error);
        setError(error);
      });

      // 监听连接事件，处理重连
      socket.on('connect', () => {
        // 重新加入房间（如果有）
        const roomId = useRoomStore.getState().roomId;
        const playerId = useUserStore.getState().playerId;
        if (roomId && playerId) {
          console.log('Rejoining room after reconnect:', { roomId, playerId });
          socket.emit('joinRoom', { roomId, playerId }, (response: { success: boolean; room?: RoomState; error?: string }) => {
            if (response.success && response.room) {
              console.log('Successfully rejoined room:', response.room);
              setRoomState(response.room);
              if (response.room.gameState) {
                setGameState(response.room.gameState);
              }
            } else {
              console.error('Failed to rejoin room:', response.error);
              setError('重新加入房间失败，请刷新页面重试');
            }
          });
        }
      });
    }

    // cleanup函数不需要断开连接，只需要移除当前组件注册的事件监听
    return () => {
      // if (socket) {
      //   只移除当前组件特定的监听器
      //   socket.off('roomUpdate');
      //   socket.off('gameStarted');
      //   socket.off('gameStateUpdate');
      //   socket.off('error');
      // }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 创建房间
  const createRoom = async (playerId: string, playerName: string = '玩家') => {
    setLoading(true);
    try {
      if (!socket) {
        throw new Error('Socket not connected');
      }

      return new Promise<string>((resolve, reject) => {
        socket.emit('createRoom', { playerId, playerName }, (response: CreateRoomResponse) => {
          if (response.roomId) {
            setRoomId(response.roomId);
            setRoomState(response.room);
            setPlayer(playerId, playerName);
            resolve(response.roomId);
          } else {
            reject(new Error('Failed to create room'));
          }
        });
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : '创建房间失败');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 加入房间
  const joinRoom = async (roomId: string, playerId: string, isAI: boolean = false, playerName: string = '玩家') => {
    setLoading(true);
    try {
      if (!socket) {
        throw new Error('Socket not connected');
      }

      return new Promise<JoinRoomResponse>((resolve, reject) => {
        socket.emit('joinRoom', { roomId, playerId, isAI, playerName }, (response: JoinRoomResponse) => {
          if (response.success && response.room) {
            setRoomId(roomId);
            setRoomState(response.room);
            // 只有当不是AI玩家时，才更新当前玩家信息
            if (!isAI) {
              setPlayer(playerId, playerName);
            }
            resolve(response);
          } else {
            reject(new Error(response.error || 'Failed to join room'));
          }
        });
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : '加入房间失败');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 开始游戏
  const startGame = async (roomId: string, isLocalMode?: boolean) => {
    setLoading(true);
    try {
      if (!socket) {
        throw new Error('Socket not connected');
      }

      return new Promise<StartGameResponse>((resolve, reject) => {
        socket.emit('startGame', { roomId, isLocalMode }, (response: StartGameResponse) => {
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.error || 'Failed to start game'));
          }
        });
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : '开始游戏失败');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 在 performGameAction 函数中，我们需要定义一个更具体的响应类型来替代 any
  interface GameActionResponse {
    success: boolean;
    error?: string;
    code?: string;
    data?: {
      currentTotal?: number;
      playerId?: string;
      [key: string]: unknown;
    };
  }

  // 执行游戏动作
  const performGameAction = async (roomId: string, action: GameAction) => {
    setLoading(true);
    try {
      // 如果WebSocket连接已断开，则抛出错误
      if (!socket) {
        throw new Error('Socket未连接');
      }

      return new Promise<void>((resolve, reject) => {
        console.log('执行游戏动作:', action);

        socket.emit('gameAction', { roomId, action }, (response: GameActionResponse) => {
          if (response.success) {
            // 操作成功，不需要在这里处理AI回合，因为会在gameStateUpdated事件中处理
            resolve();
          } else {
            // 处理特殊错误
            if (response.code === 'GEMS_OVERFLOW') {
              const { currentTotal, playerId } = response.data || {};
              if (currentTotal !== undefined && playerId) {
                useGameStore.getState().showGemsToDiscard(playerId, currentTotal);
                resolve();
              } else {
                reject(new Error('无效的GEMS_OVERFLOW响应数据'));
              }
            } else {
              reject(new Error(response.error || '执行动作失败'));
            }
          }
        });
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : '执行动作失败');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    socket,
    createRoom,
    joinRoom,
    startGame,
    performGameAction
  };
}; 
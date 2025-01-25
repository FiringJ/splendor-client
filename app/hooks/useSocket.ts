import { useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';
import { useUserStore } from '../store/userStore';
import { GameState, GameAction } from '../types/game';
import { useRoomStore } from '../store/roomStore';
import { RoomState, CreateRoomResponse, JoinRoomResponse, StartGameResponse, GameStartedEvent } from '../types/socket';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { setRoomId, setRoomState } = useRoomStore();
  const { setGameState, setError, setLoading } = useGameStore();
  const { setPlayer } = useUserStore();

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:3001', {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        timeout: 30000,
        transports: ['websocket'],
        forceNew: false,
        autoConnect: true
      });

      const socket = socketRef.current;

      // 监听连接事件
      socket.on('connect', () => {
        console.log('Connected to server with ID:', socket.id);
        setError(null);

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

      socket.on('disconnect', (reason) => {
        console.log('Disconnected from server, reason:', reason);
        if (reason === 'io server disconnect' || reason === 'io client disconnect') {
          console.log('Attempting to reconnect...');
          socket.connect();
        } else {
          // 对于其他断开原因，也尝试重连
          setTimeout(() => {
            if (!socket.connected) {
              console.log('Still disconnected, attempting to reconnect...');
              socket.connect();
            }
          }, 1000);
        }
        setError('与服务器的连接已断开，正在尝试重新连接...');
      });

      socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setError('连接服务器失败，请检查网络连接');
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log('Reconnected on attempt:', attemptNumber);
        setError(null);
      });

      socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('Attempting to reconnect:', attemptNumber);
        // 尝试先使用polling，然后升级到websocket
        socket.io.opts.transports = ['polling', 'websocket'];
      });

      socket.on('reconnect_error', (error) => {
        console.error('Reconnection error:', error);
      });

      socket.on('reconnect_failed', () => {
        console.error('Failed to reconnect');
        setError('重连失败，请刷新页面重试');
      });

      // 监听房间更新
      socket.on('roomUpdate', (roomState: RoomState) => {
        console.log('Room updated:', roomState);
        setRoomState(roomState);
      });

      // 监听游戏开始
      socket.on('gameStarted', (data: GameStartedEvent) => {
        try {
          console.log('Received gameStarted event:', data);
          if (!data || !data.gameState || !data.room) {
            console.error('Invalid gameStarted data received:', data);
            return;
          }

          // 先更新房间状态
          setRoomState(data.room);

          // 再更新游戏状态
          setGameState(data.gameState);

          console.log('Game started successfully, all states updated');
        } catch (error: unknown) {
          console.error('Error handling gameStarted event:', error);
          setError('游戏开始时出现错误，请刷新页面重试');
        }
      });

      // 监听游戏状态更新
      socket.on('gameStateUpdate', (data: { gameState: GameState; status: string }) => {
        console.log('Game state updated:', data);
        if (data.gameState) {
          setGameState(data.gameState);
        }
      });

      // 监听错误消息
      socket.on('error', (error: string) => {
        console.error('Socket error:', error);
        setError(error);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('connect_error');
        socketRef.current.off('reconnect');
        socketRef.current.off('reconnect_attempt');
        socketRef.current.off('reconnect_failed');
        socketRef.current.off('roomUpdate');
        socketRef.current.off('gameStarted');
        socketRef.current.off('gameStateUpdate');
        socketRef.current.off('error');
        socketRef.current.disconnect();
      }
    };
  }, [setRoomState, setGameState, setError]);

  // 创建房间
  const createRoom = async (playerId: string) => {
    setLoading(true);
    try {
      if (!socketRef.current) {
        throw new Error('Socket not connected');
      }

      return new Promise<string>((resolve, reject) => {
        socketRef.current!.emit('createRoom', { playerId }, (response: CreateRoomResponse) => {
          if (response.roomId) {
            setRoomId(response.roomId);
            setRoomState(response.room);
            setPlayer(playerId, 'Player 1');
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
  const joinRoom = async (roomId: string, playerId: string) => {
    setLoading(true);
    try {
      if (!socketRef.current) {
        throw new Error('Socket not connected');
      }

      return new Promise<JoinRoomResponse>((resolve, reject) => {
        socketRef.current!.emit('joinRoom', { roomId, playerId }, (response: JoinRoomResponse) => {
          if (response.success && response.room) {
            setRoomId(roomId);
            setRoomState(response.room);
            const playerNumber = response.room.players.length;
            setPlayer(playerId, `Player ${playerNumber}`);
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
  const startGame = async (roomId: string) => {
    setLoading(true);
    try {
      if (!socketRef.current) {
        throw new Error('Socket not connected');
      }

      return new Promise<StartGameResponse>((resolve, reject) => {
        socketRef.current!.emit('startGame', { roomId }, (response: StartGameResponse) => {
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

  // 执行游戏动作
  const performGameAction = async (roomId: string, action: GameAction) => {
    setLoading(true);
    try {
      if (!socketRef.current) {
        throw new Error('Socket not connected');
      }

      return new Promise<void>((resolve, reject) => {
        console.log('performGameAction', action);

        socketRef.current!.emit('gameAction', { roomId, action }, (response: { success: boolean; error?: string; code?: string; data?: any }) => {
          if (response.success) {
            resolve();
          } else {
            // 处理特殊错误
            if (response.code === 'GEMS_OVERFLOW') {
              const { currentTotal, playerId } = response.data;
              useGameStore.getState().showGemsToDiscard(currentTotal, playerId);
              resolve();
            } else {
              reject(new Error(response.error || 'Failed to perform action'));
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
    createRoom,
    joinRoom,
    startGame,
    performGameAction,
    socket: socketRef.current
  };
}; 
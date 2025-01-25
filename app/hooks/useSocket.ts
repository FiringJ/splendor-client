import { useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';
import { GameState, GameAction } from '../types/game';
import { useRoomStore } from '../store/roomStore';
import { RoomState, CreateRoomResponse, JoinRoomResponse, StartGameResponse } from '../types/socket';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { setRoomId, setRoomState } = useRoomStore();
  const { setGameState, setError, setLoading } = useGameStore();

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:3001', {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      // 监听连接事件
      socketRef.current.on('connect', () => {
        console.log('Connected to server');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setError('连接服务器失败，请检查网络连接');
      });

      socketRef.current.on('reconnect', (attemptNumber) => {
        console.log('Reconnected on attempt:', attemptNumber);
        setError(null);
      });

      socketRef.current.on('reconnect_failed', () => {
        setError('重连失败，请刷新页面重试');
      });

      // 监听房间更新
      socketRef.current.on('roomUpdate', (roomState: RoomState) => {
        setRoomState(roomState);
      });

      // 监听游戏开始
      socketRef.current.on('gameStarted', (data: { gameState: GameState; status: string }) => {
        if (data.gameState) {
          setGameState(data.gameState);
        }
      });

      // 监听游戏状态更新
      socketRef.current.on('gameStateUpdate', (data: { gameState: GameState; status: string }) => {
        if (data.gameState) {
          setGameState(data.gameState);
        }
      });

      // 监听错误消息
      socketRef.current.on('error', (error: string) => {
        setError(error);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('connect_error');
        socketRef.current.off('reconnect');
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
        socketRef.current!.emit('gameAction', { roomId, action }, (response: { success: boolean; error?: string }) => {
          if (response.success) {
            resolve();
          } else {
            reject(new Error(response.error || 'Failed to perform action'));
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
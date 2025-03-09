"use client";

import { useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';
import { useUserStore } from '../store/userStore';
import { GameState, GameAction, TakeGemsAction, PurchaseCardAction, ReserveCardAction, GemType } from '../types/game';
import { useRoomStore } from '../store/roomStore';
import { RoomState, CreateRoomResponse, JoinRoomResponse, StartGameResponse, GameStartedEvent } from '../types/socket';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { setRoomId, setRoomState } = useRoomStore();
  const { setGameState, setError, setLoading } = useGameStore();
  const { setPlayer } = useUserStore();

  // 使用useRef来跟踪是否已经初始化过socket
  const isInitialized = useRef(false);

  useEffect(() => {
    // 只有在socketRef.current为null且未初始化过时才创建新的socket连接
    if (!socketRef.current && !isInitialized.current) {
      console.log('Initializing socket connection...');
      isInitialized.current = true;
      socketRef.current = io('http://localhost:3001', {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        timeout: 30000,
        transports: ['websocket', 'polling'],
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

        // 获取当前游戏状态和AI状态
        const gameState = useGameStore.getState().gameState;
        const isAIEnabled = useGameStore.getState().isAIEnabled;
        const roomState = useRoomStore.getState().roomState;
        const isAIGame = isAIEnabled || roomState?.isLocalMode;

        console.log('Current game state:', {
          hasGameState: !!gameState,
          isAIEnabled,
          isLocalMode: roomState?.isLocalMode,
          roomStatus: roomState?.status,
          isAIGame
        });

        // 如果是AI对战模式下的游戏已经开始，不要尝试重连也不要显示错误
        if (gameState && isAIGame) {
          console.log('AI game in progress, attempting to reconnect silently');
          // 尝试重连，但不显示错误消息
          setTimeout(() => {
            if (socketRef.current && !socketRef.current.connected) {
              console.log('Attempting to reconnect silently for AI game...');
              socketRef.current.connect();
            }
          }, 1000);
          return;
        }

        // 只有在非AI对战模式下才尝试重连和显示错误
        if (reason === 'io server disconnect' || reason === 'io client disconnect') {
          console.log('Attempting to reconnect...');
          setTimeout(() => {
            if (socketRef.current && !socketRef.current.connected) {
              socketRef.current.connect();
            }
          }, 1000);
        } else {
          // 对于其他断开原因，也尝试重连
          setTimeout(() => {
            if (socketRef.current && !socketRef.current.connected) {
              console.log('Still disconnected, attempting to reconnect...');
              socketRef.current.connect();
            }
          }, 2000);
        }

        // 只有在非AI对战模式下才显示错误
        if (!(gameState && isAIGame)) {
          setError('与服务器的连接已断开，正在尝试重新连接...');
        }
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
          console.log('Updating room state with:', data.room);
          setRoomState(data.room);

          // 再更新游戏状态
          console.log('Updating game state with:', data.gameState);
          setGameState(data.gameState);

          console.log('Game started successfully, all states updated');

          // 确保AI已启用（如果是本地模式）
          if (data.room.isLocalMode) {
            console.log('Local mode detected, ensuring AI is enabled');
            useGameStore.getState().enableAI(true);
          }
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
      // 不在清理函数中断开连接，保持socket连接
      if (socketRef.current) {
        // 只移除事件监听器，不断开连接
        socketRef.current.off('connect');
        socketRef.current.off('connect_error');
        socketRef.current.off('reconnect');
        socketRef.current.off('reconnect_attempt');
        socketRef.current.off('reconnect_failed');
        socketRef.current.off('roomUpdate');
        socketRef.current.off('gameStarted');
        socketRef.current.off('gameStateUpdate');
        socketRef.current.off('error');
        // 不调用disconnect()，保持连接
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
  const startGame = async (roomId: string, isLocalMode?: boolean) => {
    setLoading(true);
    try {
      if (!socketRef.current) {
        throw new Error('Socket not connected');
      }

      return new Promise<StartGameResponse>((resolve, reject) => {
        socketRef.current!.emit('startGame', { roomId, isLocalMode }, (response: StartGameResponse) => {
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
      // 获取当前游戏状态和AI状态
      const gameState = useGameStore.getState().gameState;
      const isAIEnabled = useGameStore.getState().isAIEnabled;
      const roomState = useRoomStore.getState().roomState;
      const isAIGame = isAIEnabled || roomState?.isLocalMode;

      // 检查是否是AI对战模式且WebSocket连接已断开
      if (gameState && isAIGame && (!socketRef.current || !socketRef.current.connected)) {
        console.log('AI game in progress, performing local action:', action);

        // 在本地处理游戏操作
        try {
          // 这里我们需要模拟服务器的响应
          // 对于简单的操作，我们可以直接更新游戏状态
          // 对于复杂的操作，我们可能需要实现一个本地的游戏逻辑

          // 根据不同的操作类型进行处理
          switch (action.type) {
            case 'TAKE_GEMS':
              // 简单模拟拿宝石的操作
              console.log('Local action: TAKE_GEMS', (action as TakeGemsAction).payload.gems);

              // 更新本地游戏状态
              const takeGemsAction = action as TakeGemsAction;
              const newGameStateAfterTakeGems = { ...gameState };

              // 更新玩家宝石
              const currentPlayerIndex = newGameStateAfterTakeGems.players.findIndex(p => p.id === newGameStateAfterTakeGems.currentTurn);
              if (currentPlayerIndex !== -1) {
                const player = { ...newGameStateAfterTakeGems.players[currentPlayerIndex] };

                // 更新玩家宝石
                Object.entries(takeGemsAction.payload.gems).forEach(([gemType, count]) => {
                  const gem = gemType as GemType;
                  player.gems[gem] = (player.gems[gem] || 0) + count;
                });

                // 更新游戏宝石
                Object.entries(takeGemsAction.payload.gems).forEach(([gemType, count]) => {
                  const gem = gemType as GemType;
                  newGameStateAfterTakeGems.gems[gem] = Math.max(0, (newGameStateAfterTakeGems.gems[gem] || 0) - count);
                });

                // 更新玩家
                newGameStateAfterTakeGems.players[currentPlayerIndex] = player;

                // 更新游戏状态
                setGameState(newGameStateAfterTakeGems);

                // 模拟AI回合
                setTimeout(() => {
                  console.log('Simulating AI turn...');
                  // 在实际应用中，这里应该有更复杂的AI逻辑
                  // 但为了简单起见，我们只是随机选择一些宝石

                  // 更新游戏状态，切换到下一个玩家
                  const nextPlayerIndex = (currentPlayerIndex + 1) % newGameStateAfterTakeGems.players.length;
                  const nextGameState = { ...newGameStateAfterTakeGems };
                  nextGameState.currentTurn = nextGameState.players[nextPlayerIndex].id;

                  // 更新游戏状态
                  setGameState(nextGameState);
                }, 1000);
              }

              setLoading(false);
              return Promise.resolve();

            case 'PURCHASE_CARD':
              // 简单模拟购买卡片的操作
              console.log('Local action: PURCHASE_CARD', (action as PurchaseCardAction).payload.cardId);

              // 在实际应用中，这里应该有更复杂的逻辑
              // 但为了简单起见，我们只是记录操作
              setLoading(false);
              return Promise.resolve();

            case 'RESERVE_CARD':
              // 简单模拟预留卡片的操作
              console.log('Local action: RESERVE_CARD', (action as ReserveCardAction).payload.cardId);

              // 在实际应用中，这里应该有更复杂的逻辑
              // 但为了简单起见，我们只是记录操作
              setLoading(false);
              return Promise.resolve();

            default:
              console.error('Unsupported local action type:', action.type);
              setLoading(false);
              return Promise.reject(new Error(`Unsupported local action type: ${action.type}`));
          }
        } catch (error) {
          console.error('Error performing local action:', error);
          setLoading(false);
          return Promise.reject(error);
        }
      }

      // 如果不是AI对战模式或WebSocket连接正常，则正常发送到服务器
      if (!socketRef.current) {
        throw new Error('Socket not connected');
      }

      return new Promise<void>((resolve, reject) => {
        console.log('performGameAction', action);

        socketRef.current!.emit('gameAction', { roomId, action }, (response: GameActionResponse) => {
          if (response.success) {
            resolve();
          } else {
            // 处理特殊错误
            if (response.code === 'GEMS_OVERFLOW') {
              const { currentTotal, playerId } = response.data || {};
              if (currentTotal !== undefined && playerId) {
                useGameStore.getState().showGemsToDiscard(currentTotal, playerId);
                resolve();
              } else {
                reject(new Error('Invalid GEMS_OVERFLOW response data'));
              }
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
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';
import { GameAction, GameState, Player } from '../types/game';
import { useGameStore } from '../store/gameStore';

interface RoomState {
  id: string;
  players: Player[];
  hostId: string;
  status: 'waiting' | 'playing' | 'finished';
}

interface SocketStore {
  socket: Socket | null;
  roomId: string | null;
  roomState: RoomState | null;
  setRoomId: (roomId: string) => void;
  setRoomState: (state: RoomState | null) => void;
}

export const useSocketStore = create<SocketStore>((set) => ({
  socket: null,
  roomId: null,
  roomState: null,
  setRoomId: (roomId) => set({ roomId }),
  setRoomState: (state) => set({ roomState: state }),
}));

interface JoinRoomResponse {
  success: boolean;
  error?: string;
  room?: {
    id: string;
    players: Player[];
    hostId: string;
    status: 'waiting' | 'playing' | 'finished';
  };
}

interface StartGameResponse {
  success: boolean;
  error?: string;
  gameState?: GameState;
}

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { setRoomId } = useSocketStore();
  const initializeGame = useGameStore(state => state.initializeGame);

  useEffect(() => {
    // 连接到服务器
    socketRef.current = io('http://localhost:3001');

    // 设置事件监听
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const createRoom = async (playerId: string) => {
    return new Promise<string>((resolve) => {
      if (!socketRef.current) return;

      socketRef.current.emit('createRoom', { playerId }, (response: { roomId: string; room: RoomState }) => {
        setRoomId(response.roomId);
        useSocketStore.getState().setRoomState({
          ...response.room,
          hostId: playerId // 创建房间的玩家是房主
        });
        resolve(response.roomId);
      });
    });
  };

  const joinRoom = async (roomId: string, playerId: string) => {
    return new Promise<JoinRoomResponse>((resolve, reject) => {
      if (!socketRef.current) return reject(new Error('Socket not connected'));

      socketRef.current.emit('joinRoom', { roomId, playerId }, (response: JoinRoomResponse) => {
        if (response.success && response.room) {
          // 更新房间状态
          useSocketStore.getState().setRoomId(roomId);
          useSocketStore.getState().setRoomState({
            id: response.room.id,
            players: response.room.players,
            hostId: response.room.hostId || response.room.players[0].id,
            status: response.room.status
          });
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  };

  const startGame = async (roomId: string) => {
    return new Promise<StartGameResponse>((resolve, reject) => {
      if (!socketRef.current) return reject(new Error('Socket not connected'));

      socketRef.current.emit('startGame', { roomId }, (response: StartGameResponse) => {
        if (response.success && response.gameState) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  };

  const sendGameAction = async (roomId: string, action: GameAction['type']) => {
    return new Promise<boolean>((resolve, reject) => {
      if (!socketRef.current) return;

      socketRef.current.emit('gameAction', { roomId, action }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  };

  // 添加游戏状态更新监听
  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on('roomUpdate', (data: RoomState) => {
      console.log('Room updated:', data);
      // 确保更新整个房间状态
      useSocketStore.getState().setRoomState({
        ...data,
        hostId: data.hostId || data.players[0]?.id // 确保有 hostId
      });
    });

    socketRef.current.on('gameStateUpdate', (data: { gameState: GameState }) => {
      console.log('Game state updated:', data);
      if (data.gameState) {
        initializeGame(Array.from(data.gameState.players.values()));
      }
    });

    socketRef.current.on('gameStarted', (data: { gameState: GameState; status: string }) => {
      console.log('Game started:', data);
      if (data.gameState) {
        initializeGame(Array.from(data.gameState.players.values()));
      }
    });

    return () => {
      socketRef.current?.off('roomUpdate');
      socketRef.current?.off('gameStateUpdate');
      socketRef.current?.off('gameStarted');
    };
  }, [initializeGame]);

  return {
    socket: socketRef.current,
    createRoom,
    joinRoom,
    startGame,
    sendGameAction,
  };
}; 
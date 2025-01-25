import { useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types/game';
import { useRoomStore } from '../store/roomStore';
import { RoomState, CreateRoomResponse, JoinRoomResponse, StartGameResponse } from '../types/socket';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { setRoomId, setRoomState } = useRoomStore();
  const setGameState = useGameStore(state => state.setGameState);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:3001', {
        withCredentials: true
      });

      // 监听房间更新
      socketRef.current.on('roomUpdate', (roomState: RoomState) => {
        setRoomState(roomState);
      });

      // 监听游戏开始
      socketRef.current.on('gameStarted', (data: { gameState: GameState }) => {
        if (data.gameState) {
          setGameState(data.gameState);
        }
      });
    }

    return () => {
      socketRef.current?.off('roomUpdate');
      socketRef.current?.off('gameStarted');
      socketRef.current?.disconnect();
    };
  }, [setRoomState, setGameState]);

  // 创建房间
  const createRoom = async (playerId: string) => {
    return new Promise<string>((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit('createRoom', { playerId }, (response: CreateRoomResponse) => {
        if (response.roomId) {
          setRoomId(response.roomId);
          setRoomState(response.room);
          resolve(response.roomId);
        } else {
          reject(new Error('Failed to create room'));
        }
      });
    });
  };

  // 加入房间
  const joinRoom = async (roomId: string, playerId: string) => {
    return new Promise<JoinRoomResponse>((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit('joinRoom', { roomId, playerId }, (response: JoinRoomResponse) => {
        if (response.success && response.room) {
          setRoomId(roomId);
          setRoomState(response.room);
          resolve(response);
        } else {
          reject(new Error(response.error || 'Failed to join room'));
        }
      });
    });
  };

  // 开始游戏
  const startGame = async (roomId: string) => {
    return new Promise<StartGameResponse>((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit('startGame', { roomId }, (response: StartGameResponse) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Failed to start game'));
        }
      });
    });
  };

  return {
    createRoom,
    joinRoom,
    startGame
  };
}; 
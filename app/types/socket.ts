import { GameState } from './game';

export interface RoomState {
  id: string;
  players: Array<{
    id: string;
    name: string;
  }>;
  hostId: string;
  status: 'waiting' | 'playing' | 'finished';
}

export interface CreateRoomResponse {
  roomId: string;
  room: RoomState;
}

export interface JoinRoomResponse {
  success: boolean;
  room?: RoomState;
  error?: string;
}

export interface StartGameResponse {
  success: boolean;
  gameState?: GameState;
  error?: string;
} 
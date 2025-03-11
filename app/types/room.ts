import { GameState, Player } from './game';

export interface RoomState {
  id: string;
  players: Array<Player>;
  hostId: string;
  status: 'waiting' | 'playing' | 'finished';
  gameState: GameState | null;
  isLocalMode?: boolean; // 是否是本地对战模式（本地对战模式下，也需要连接到服务端）
}

export interface CreateRoomResponse {
  success: boolean;
  roomId: string;
  room: RoomState;
  error?: string;
}

export interface JoinRoomResponse {
  success: boolean;
  room?: RoomState;
  error?: string;
}

export interface StartGameResponse {
  success: boolean;
  gameState?: GameState;
  room?: RoomState;
  error?: string;
}

export interface GameStartedEvent {
  room: RoomState;
  gameState: GameState;
  status: 'waiting' | 'playing' | 'finished';
} 
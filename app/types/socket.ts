import { GameState } from './game';

export interface RoomState {
  id: string;
  players: Array<{
    id: string;
    clientId?: string;
    name: string;
    gems: Record<string, number>;
    cards: any[];
    reservedCards: any[];
    nobles: any[];
    points: number;
  }>;
  hostId: string;
  status: 'waiting' | 'playing' | 'finished';
  gameState: GameState | null;
  isLocalMode?: boolean;
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
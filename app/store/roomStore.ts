import { create } from 'zustand';
import { RoomState } from '../types/room';

interface RoomStore {
  roomId: string | null;
  roomState: RoomState | null;
  setRoomId: (id: string) => void;
  setRoomState: (state: RoomState) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  roomId: null,
  roomState: null,
  setRoomId: (id) => set({ roomId: id }),
  setRoomState: (state) => set({ roomState: state })
})); 
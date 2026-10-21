/** 从 URL ?room= 解析合法房间号：恰好 4 位才采纳，否则静默回落为空。 */
export function parseRoomQueryParam(room: string | null | undefined): string {
  if (room == null || room === '') return '';
  if (room.length !== 4) return '';
  return room;
}

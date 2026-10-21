import { parseRoomQueryParam } from '../parseRoomQueryParam';

describe('parseRoomQueryParam', () => {
  it('prefills ABCD from ?room=ABCD', () => {
    expect(parseRoomQueryParam('ABCD')).toBe('ABCD');
  });

  it('prefills empty when room is missing', () => {
    expect(parseRoomQueryParam(undefined)).toBe('');
    expect(parseRoomQueryParam(null)).toBe('');
    expect(parseRoomQueryParam('')).toBe('');
  });

  it('treats short or long room values as invalid', () => {
    expect(parseRoomQueryParam('xx')).toBe('');
    expect(parseRoomQueryParam('ABCDE')).toBe('');
  });
});

import { useUserStore } from '../userStore';

const PLAYER_ID_KEY = 'splendor_playerId';
const PLAYER_NAME_KEY = 'splendor_playerName';

function resetStore() {
  localStorage.clear();
  useUserStore.setState({ playerId: null, playerName: null });
}

describe('useUserStore', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    resetStore();
  });

  it('removes the stored identity when clearPlayer follows setPlayer', () => {
    useUserStore.getState().setPlayer('player-1', 'Ada');

    useUserStore.getState().clearPlayer();

    const state = useUserStore.getState();
    expect(state.playerId).toBeNull();
    expect(state.playerName).toBeNull();
    expect(localStorage.getItem(PLAYER_ID_KEY)).toBeNull();
    expect(localStorage.getItem(PLAYER_NAME_KEY)).toBeNull();
  });

  it('clears memory when removeItem throws SecurityError', () => {
    useUserStore.getState().setPlayer('player-1', 'Ada');
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('storage is blocked', 'SecurityError');
    });

    expect(() => useUserStore.getState().clearPlayer()).not.toThrow();

    const state = useUserStore.getState();
    expect(state.playerId).toBeNull();
    expect(state.playerName).toBeNull();
  });

  it('clears memory when removeItem throws Error', () => {
    useUserStore.getState().setPlayer('player-1', 'Ada');
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('storage is blocked');
    });

    expect(() => useUserStore.getState().clearPlayer()).not.toThrow();

    const state = useUserStore.getState();
    expect(state.playerId).toBeNull();
    expect(state.playerName).toBeNull();
  });
});

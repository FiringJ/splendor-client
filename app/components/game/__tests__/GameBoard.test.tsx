import { fireEvent, render, screen, within } from '@testing-library/react';
import { GameBoard } from '../GameBoard';
import { useGameStore } from '../../../store/gameStore';
import { useSocketStore } from '../../../store/socketStore';
import { useUserStore } from '../../../store/userStore';
import type { Card, GameState, Player } from '../../../types/game';

jest.mock('../../../hooks/useSocket', () => ({
  useSocket: () => ({
    performGameAction: jest.fn(),
  }),
}));

jest.mock('../../../hooks/useSound', () => ({
  useSound: () => jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

const faceUp: Card = {
  id: 7,
  level: 1,
  points: 0,
  gem: 'ruby',
  cost: {},
  spritePosition: { x: 0, y: 0 },
};

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1',
    name: 'Ada',
    gems: { diamond: 0, sapphire: 0, emerald: 0, ruby: 0, onyx: 0, gold: 0 },
    cards: [],
    reservedCards: [],
    nobles: [],
    points: 0,
    ...overrides,
  };
}

function makeState(player: Player): GameState {
  return {
    players: [player],
    currentTurn: player.id,
    gems: { diamond: 4, sapphire: 4, emerald: 4, ruby: 4, onyx: 4, gold: 5 },
    cards: {
      level1: [faceUp],
      level2: [],
      level3: [],
      deck1: [{ ...faceUp, id: 99 }],
      deck2: [],
      deck3: [],
    },
    nobles: [{ id: 1, points: 3, name: 'Mary', requirements: { ruby: 4 } }],
    status: 'playing',
    lastRound: false,
    lastRoundStartPlayer: null,
    winner: null,
    actions: [],
  };
}

describe('GameBoard layout', () => {
  beforeAll(() => {
    class FakeAudio {
      loop = false;
      volume = 1;
      play() {
        return Promise.resolve();
      }
      pause() {}
      addEventListener() {}
      removeEventListener() {}
    }
    global.Audio = FakeAudio as unknown as typeof Audio;
  });

  beforeEach(() => {
    useGameStore.getState().resetGameState();
    useUserStore.setState({ playerId: 'p1', playerName: 'Ada' });
    useSocketStore.setState({ isConnected: true, isInitialized: true });
  });

  it('shares a status bar and keeps history in a collapsed sheet without a blocking overlay', () => {
    useGameStore.setState({ gameState: makeState(makePlayer()), loading: true });

    render(<GameBoard />);

    expect(screen.getByTestId('game-status-bar')).toBeInTheDocument();
    expect(screen.getByTestId('turn-indicator')).toHaveTextContent('你的回合');
    expect(screen.getByTestId('connection-state')).toHaveTextContent('已连接');
    expect(screen.getByTestId('gem-bank-summary')).toHaveTextContent('4');
    expect(screen.getByTestId('sync-hint')).toHaveTextContent('同步中');
    expect(screen.queryByTestId('board-loading-overlay')).not.toBeInTheDocument();
    expect(screen.getByText('发展卡')).toBeInTheDocument();

    const sheet = screen.getByTestId('insight-sheet');
    const toggle = within(sheet).getByTestId('insight-sheet-toggle');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByTestId('insight-sheet-panel')).not.toBeVisible();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('insight-sheet-panel')).toBeVisible();
    expect(within(screen.getByTestId('insight-sheet-panel')).getByText('暂无操作记录')).toBeInTheDocument();
  });

  it('collapses the desktop sidebar without removing the board', () => {
    useGameStore.setState({ gameState: makeState(makePlayer()) });
    render(<GameBoard />);

    const sidebar = screen.getByTestId('game-sidebar');
    expect(within(sidebar).getByText('宝石银行')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-toggle')).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByTestId('sidebar-toggle'));

    expect(screen.getByTestId('sidebar-toggle')).toHaveAttribute('aria-expanded', 'false');
    expect(within(sidebar).queryByText('宝石银行')).not.toBeInTheDocument();
    expect(screen.getByText('发展卡')).toBeInTheDocument();
  });

  it('shows an AI thinking hint with the previous latency instead of covering the board', () => {
    useGameStore.setState({
      gameState: makeState(makePlayer({ id: 'ai', name: 'Jev', isAI: true })),
      latestDecision: {
        source: 'jev',
        latencyMs: 420,
        actionType: 'TAKE_GEMS',
        actionIndex: 0,
      },
    });
    useUserStore.setState({ playerId: 'human', playerName: 'Ada' });

    render(<GameBoard />);

    const hint = screen.getByTestId('ai-thinking');
    expect(hint).toHaveTextContent('AI thinking…');
    expect(hint).toHaveTextContent('上次 420 ms');
    expect(screen.getByTestId('turn-indicator')).toHaveTextContent('Jev 的回合');
    expect(screen.getByText('发展卡')).toBeInTheDocument();
    expect(screen.queryByTestId('sync-hint')).not.toBeInTheDocument();
  });
});

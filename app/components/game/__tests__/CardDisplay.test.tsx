import { render, screen } from '@testing-library/react';
import { CardDisplay } from '../CardDisplay';
import { useGameStore } from '../../../store/gameStore';
import type { Card, GameState, Player } from '../../../types/game';

jest.mock('../../../hooks/useSound', () => ({
  useSound: () => jest.fn(),
}));

const card: Card = {
  id: 3,
  level: 1,
  points: 1,
  gem: 'emerald',
  cost: { diamond: 1 },
  spritePosition: { x: 1, y: 0 },
};

const player: Player = {
  id: 'p1',
  name: 'Ada',
  gems: { diamond: 1, sapphire: 0, emerald: 0, ruby: 0, onyx: 0, gold: 0 },
  cards: [],
  reservedCards: [],
  nobles: [],
  points: 0,
};

const gameState: GameState = {
  players: [player],
  currentTurn: 'p1',
  gems: { diamond: 4, sapphire: 4, emerald: 4, ruby: 4, onyx: 4, gold: 5 },
  cards: {
    level1: [card],
    level2: [],
    level3: [],
    deck1: [{ ...card, id: 30 }],
    deck2: [],
    deck3: [],
  },
  nobles: [],
  status: 'playing',
  lastRound: false,
  lastRoundStartPlayer: null,
  winner: null,
  actions: [],
};

describe('CardDisplay touch actions', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState();
    useGameStore.setState({ gameState });
  });

  it('renders buy and reserve controls without requiring hover', () => {
    render(
      <CardDisplay
        cards={gameState.cards}
        disabled={false}
        onPurchase={jest.fn()}
        onReserve={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: '购买' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '预留' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '预留1级牌堆' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '购买卡牌' })).not.toBeInTheDocument();
  });

  it('hides critical actions when the board is disabled', () => {
    render(
      <CardDisplay
        cards={gameState.cards}
        disabled
        onPurchase={jest.fn()}
        onReserve={jest.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: '购买' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '预留' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '预留1级牌堆' })).not.toBeInTheDocument();
  });
});

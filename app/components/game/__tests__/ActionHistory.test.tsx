import { act, render, screen } from '@testing-library/react';
import { ActionHistory } from '../ActionHistory';
import { useGameStore } from '../../../store/gameStore';
import type { DecisionMeta, GameAction } from '../../../types/game';

const takeGems: GameAction = {
  type: 'TAKE_GEMS',
  playerId: 'ai-1',
  payload: { gems: { diamond: 1, sapphire: 1, emerald: 1 } },
};

const jevMeta: DecisionMeta = {
  source: 'jev',
  modelId: 'typesafe/jev-1.13',
  latencyMs: 420,
  actionType: 'TAKE_GEMS',
  chosenOptionId: 'take-dse',
  chosenOptionLabel: '拿取钻、蓝、绿',
  actionIndex: 0,
  options: [
    { id: 'take-dse', label: '拿取钻、蓝、绿', probability: 0.62 },
    { id: 'buy-12', label: '购买中级红宝石卡', probability: 0.25 },
    { id: 'reserve-7', label: '预留高级黑卡', probability: 0.08 },
    { id: 'fourth', label: '不该出现的第四项', probability: 0.05 },
  ],
};

describe('ActionHistory decision meta', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState();
  });

  it('does not render the decision panel when meta is absent', () => {
    render(<ActionHistory actions={[takeGems]} />);

    expect(screen.queryByTestId('ai-decision-panel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('decision-source-0')).not.toBeInTheDocument();
    expect(screen.getByText(/获取宝石/)).toBeInTheDocument();
  });

  it('shows source, choice, top 3, model, and latency for an AI turn', () => {
    act(() => {
      useGameStore.setState({
        latestDecision: jevMeta,
        decisionsByActionIndex: { 0: jevMeta },
      });
    });

    render(<ActionHistory actions={[takeGems]} />);

    expect(screen.getByTestId('ai-decision-panel')).toBeInTheDocument();
    expect(screen.getAllByText('jev').length).toBeGreaterThan(0);
    expect(screen.getByTestId('ai-decision-action')).toHaveTextContent('TAKE_GEMS');
    expect(screen.getByTestId('ai-decision-choice')).toHaveTextContent('拿取钻、蓝、绿');
    expect(screen.getByTestId('ai-decision-model')).toHaveTextContent('typesafe/jev-1.13');
    expect(screen.getByTestId('ai-decision-latency')).toHaveTextContent('420 ms');
    expect(screen.getByTestId('ai-decision-top')).toHaveTextContent('62%');
    expect(screen.getByTestId('ai-decision-top')).toHaveTextContent('25%');
    expect(screen.getByTestId('ai-decision-top')).toHaveTextContent('8%');
    expect(screen.getByTestId('ai-decision-top')).not.toHaveTextContent('不该出现的第四项');
    expect(screen.getByTestId('decision-source-0')).toHaveTextContent('jev');
  });

  it('shows heuristic and forced badges without crashing when options are missing', () => {
    const heuristic: DecisionMeta = {
      source: 'heuristic',
      actionType: 'PURCHASE_CARD',
      latencyMs: 12,
      fallbackReason: 'timeout',
      actionIndex: 0,
    };
    act(() => {
      useGameStore.setState({
        latestDecision: heuristic,
        decisionsByActionIndex: { 0: heuristic },
      });
    });

    const { rerender } = render(<ActionHistory actions={[takeGems]} />);
    expect(screen.getByTestId('ai-decision-source')).toHaveTextContent('heuristic');
    expect(screen.getByTestId('ai-decision-fallback')).toHaveTextContent('timeout');
    expect(screen.queryByTestId('ai-decision-top')).not.toBeInTheDocument();

    const forced: DecisionMeta = {
      source: 'forced',
      actionType: 'DISCARD_GEMS',
      chosenOptionLabel: '丢弃 2 颗红宝石',
      actionIndex: 0,
    };
    act(() => {
      useGameStore.setState({
        latestDecision: forced,
        decisionsByActionIndex: { 0: forced },
      });
    });
    rerender(<ActionHistory actions={[takeGems]} />);

    expect(screen.getByTestId('ai-decision-source')).toHaveTextContent('forced');
    expect(screen.getByText('唯一合法动作')).toBeInTheDocument();
    expect(screen.queryByTestId('ai-decision-model')).not.toBeInTheDocument();
  });
});

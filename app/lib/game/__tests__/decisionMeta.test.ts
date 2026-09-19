import {
  applyDecisionUpdate,
  emptyDecisionLog,
  normalizeDecisionMeta,
  pickDecisionMeta,
} from '../decisionMeta';

describe('normalizeDecisionMeta', () => {
  it('returns null when meta is missing or not an object', () => {
    expect(normalizeDecisionMeta(undefined)).toBeNull();
    expect(normalizeDecisionMeta(null)).toBeNull();
    expect(normalizeDecisionMeta('jev')).toBeNull();
    expect(normalizeDecisionMeta([])).toBeNull();
    expect(normalizeDecisionMeta({})).toBeNull();
  });

  it('parses the canonical payload', () => {
    expect(normalizeDecisionMeta({
      source: 'jev',
      modelId: 'typesafe/jev-1.13',
      latencyMs: 420.4,
      actionType: 'TAKE_GEMS',
      chosenOptionId: 'take-dse',
      chosenOptionLabel: '拿取钻、蓝、绿',
      options: [
        { id: 'buy-12', label: '购买中级红宝石卡', probability: 0.25 },
        { id: 'take-dse', label: '拿取钻、蓝、绿', probability: 0.62 },
        { id: 'reserve-7', label: '预留高级黑卡', probability: 0.08 },
        { id: 'noise', label: '第四项', probability: 0.05 },
      ],
    })).toEqual({
      source: 'jev',
      modelId: 'typesafe/jev-1.13',
      latencyMs: 420,
      actionType: 'TAKE_GEMS',
      chosenOptionId: 'take-dse',
      chosenOptionLabel: '拿取钻、蓝、绿',
      options: [
        { id: 'take-dse', label: '拿取钻、蓝、绿', probability: 0.62 },
        { id: 'buy-12', label: '购买中级红宝石卡', probability: 0.25 },
        { id: 'reserve-7', label: '预留高级黑卡', probability: 0.08 },
        { id: 'noise', label: '第四项', probability: 0.05 },
      ],
    });
  });

  it('accepts snake_case aliases, percent probs, and fallback sources', () => {
    const meta = normalizeDecisionMeta({
      engine: 'heuristic-fallback',
      model: 'local-heuristic',
      latency_ms: '15',
      action_type: 'PURCHASE_CARD',
      choice: 'buy-3',
      probabilities: { 'buy-3': 70, 'take-gems': 30 },
      fallback_reason: 'timeout',
      action_index: 4,
    });

    expect(meta?.source).toBe('heuristic');
    expect(meta?.modelId).toBe('local-heuristic');
    expect(meta?.latencyMs).toBe(15);
    expect(meta?.actionType).toBe('PURCHASE_CARD');
    expect(meta?.chosenOptionId).toBe('buy-3');
    expect(meta?.chosenOptionLabel).toBe('buy-3');
    expect(meta?.options?.[0]).toEqual({ id: 'buy-3', label: 'buy-3', probability: 0.7 });
    expect(meta?.fallbackReason).toBe('timeout');
    expect(meta?.actionIndex).toBe(4);
  });

  it('maps a sole legal move to forced and ignores unknown action types', () => {
    const meta = normalizeDecisionMeta({
      source: 'sole',
      actionType: 'NOT_A_MOVE',
      chosenOptionLabel: '丢弃 2 颗红宝石',
    });
    expect(meta).toEqual({
      source: 'forced',
      chosenOptionLabel: '丢弃 2 颗红宝石',
    });
  });

  it('infers jev from the model id when source is omitted', () => {
    const meta = normalizeDecisionMeta({
      modelId: 'typesafe/jev-1.13',
      probs: [
        ['take-dse', 0.8, '拿取三色'],
        ['bad', 'nope'],
      ],
    });
    expect(meta?.source).toBe('jev');
    expect(meta?.options).toEqual([
      { id: 'take-dse', label: '拿取三色', probability: 0.8 },
    ]);
  });

  it('drops secret-looking strings instead of rendering them', () => {
    const meta = normalizeDecisionMeta({
      source: 'jev',
      modelId: 'sk-or-v1-secret-token-value',
      fallbackReason: 'bearer sk-live-secret',
      chosenOptionLabel: '拿取宝石',
    });
    expect(meta?.modelId).toBeUndefined();
    expect(meta?.fallbackReason).toBeUndefined();
    expect(meta?.chosenOptionLabel).toBe('拿取宝石');
  });

  it('treats a spaceless choice string as a label when it is not an option id', () => {
    const meta = normalizeDecisionMeta({
      source: 'jev',
      choice: '拿取钻、蓝、绿',
      options: [{ id: 'take-dse', label: '其他', probability: 1 }],
    });
    expect(meta?.chosenOptionLabel).toBe('拿取钻、蓝、绿');
    expect(meta?.chosenOptionId).toBeUndefined();
  });

  it('returns null for an unrecognized source', () => {
    expect(normalizeDecisionMeta({ source: 'human', chosenOptionLabel: '拿宝石' })).toBeNull();
  });
});

describe('pickDecisionMeta', () => {
  const meta = { source: 'jev', chosenOptionLabel: '拿取' };

  it('reads top-level, gameState, and action slots', () => {
    expect(pickDecisionMeta({ decisionMeta: meta })).toBe(meta);
    expect(pickDecisionMeta({ decision_meta: meta })).toBe(meta);
    expect(pickDecisionMeta({ gameState: { decisionMeta: meta } })).toBe(meta);
    expect(pickDecisionMeta({ action: { jev: meta } })).toBe(meta);
    expect(pickDecisionMeta({ action: { type: 'TAKE_GEMS' } })).toBeUndefined();
    expect(pickDecisionMeta(null)).toBeUndefined();
  });
});

describe('applyDecisionUpdate', () => {
  it('attaches meta to the latest action and keeps it across a human turn', () => {
    const first = applyDecisionUpdate(emptyDecisionLog(), 1, {
      source: 'jev',
      modelId: 'typesafe/jev-1.13',
      chosenOptionLabel: '拿取钻、蓝、绿',
    });
    expect(first.latestDecision?.actionIndex).toBe(0);
    expect(first.decisionsByActionIndex[0]?.source).toBe('jev');

    const second = applyDecisionUpdate(first, 2, undefined);
    expect(second.latestDecision?.chosenOptionLabel).toBe('拿取钻、蓝、绿');
    expect(second.decisionsByActionIndex[1]).toBeUndefined();
  });

  it('clears stale meta when the action history shrinks', () => {
    const logged = applyDecisionUpdate(emptyDecisionLog(), 3, { source: 'forced', chosenOptionLabel: '唯一' });
    const restarted = applyDecisionUpdate(logged, 0, { not: 'meta' }, true);
    expect(restarted.latestDecision).toBeNull();
    expect(restarted.decisionsByActionIndex).toEqual({});
  });

  it('does not throw on garbage and honors an explicit action index', () => {
    const next = applyDecisionUpdate(emptyDecisionLog(), 4, {
      source: 'heuristic',
      actionIndex: 1,
      fallbackReason: 'http',
    });
    expect(next.decisionsByActionIndex[1]?.source).toBe('heuristic');
    expect(next.latestDecision?.actionIndex).toBe(1);
    expect(() => applyDecisionUpdate(next, 4, { source: 12, options: 'nope' })).not.toThrow();
  });
});

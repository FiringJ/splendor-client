import type { DecisionMeta, DecisionOption, DecisionSource, GameActionType } from '../../types/game';

/**
 * 把服务端可选的决策元数据收成稳定结构。
 * 只做展示归一化，不发网络请求。字段缺失或无法识别时返回 null，界面据此隐藏面板。
 */

const ACTION_TYPES = new Set<GameActionType>([
  'TAKE_GEMS',
  'PURCHASE_CARD',
  'RESERVE_CARD',
  'CLAIM_NOBLE',
  'DISCARD_GEMS',
  'RESTART_GAME',
]);

const SOURCE_ALIASES: Record<string, DecisionSource> = {
  jev: 'jev',
  typesafe: 'jev',
  openrouter: 'jev',
  heuristic: 'heuristic',
  fallback: 'heuristic',
  heuristic_fallback: 'heuristic',
  'heuristic-fallback': 'heuristic',
  shadow: 'heuristic',
  forced: 'forced',
  sole: 'forced',
  only: 'forced',
  only_legal: 'forced',
  'only-legal': 'forced',
  single: 'forced',
};

const MAX_LABEL = 160;
const MAX_OPTIONS = 12;

export interface DecisionLogState {
  decisionsByActionIndex: Record<number, DecisionMeta>;
  latestDecision: DecisionMeta | null;
  trackedActionCount: number;
}

export const emptyDecisionLog = (): DecisionLogState => ({
  decisionsByActionIndex: {},
  latestDecision: null,
  trackedActionCount: 0,
});

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function looksLikeSecret(value: string): boolean {
  return /sk-or-|sk-[a-z0-9]{8,}|bearer\s+[a-z0-9._-]{8,}|api[_-]?key\s*[:=]/i.test(value);
}

function clip(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || looksLikeSecret(trimmed)) return '';
  return trimmed.length > MAX_LABEL ? `${trimmed.slice(0, MAX_LABEL)}…` : trimmed;
}

function readString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string') {
      const text = clip(value);
      if (text) return text;
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }
  return undefined;
}

function readNumber(record: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return undefined;
}

function parseSource(record: Record<string, unknown>): DecisionSource | null {
  const raw = readString(record, ['source', 'engine', 'decisionSource', 'origin']);
  if (raw) {
    const key = raw.toLowerCase().replace(/\s+/g, '_');
    return SOURCE_ALIASES[key] ?? null;
  }
  if (record.forced === true || record.isForced === true) return 'forced';
  const model = readString(record, ['modelId', 'model', 'model_id']);
  if (model && /jev|typesafe/i.test(model)) return 'jev';
  if (
    record.fallback === true
    || typeof record.fallbackReason === 'string'
    || typeof record.fallback_reason === 'string'
  ) {
    return 'heuristic';
  }
  return null;
}

function coerceProbabilities(values: number[]): number[] {
  if (values.length === 0) return values;
  const max = Math.max(...values);
  const sum = values.reduce((total, value) => total + value, 0);
  if (max <= 1) return values;
  if (max <= 100 && sum >= 90 && sum <= 110) return values.map(value => value / 100);
  if (sum > 0) return values.map(value => value / sum);
  return values.map(() => 0);
}

function optionFromUnknown(entry: unknown, index: number): { id: string; label: string; probability: number } | null {
  if (Array.isArray(entry) && entry.length >= 2) {
    const id = clip(String(entry[0] ?? '')) || `option-${index}`;
    const probability = typeof entry[1] === 'number' || typeof entry[1] === 'string' ? Number(entry[1]) : NaN;
    if (!Number.isFinite(probability)) return null;
    const label = entry.length >= 3 && typeof entry[2] === 'string' ? clip(entry[2]) || id : id;
    return { id, label, probability };
  }

  const record = asRecord(entry);
  if (!record) return null;
  const probability = readNumber(record, ['probability', 'prob', 'p', 'score']);
  if (probability == null) return null;
  const id = readString(record, ['id', 'key', 'optionId', 'option_id']) ?? `option-${index}`;
  const label = readString(record, ['label', 'name', 'text', 'description']) ?? id;
  return { id, label, probability };
}

function parseOptions(raw: unknown): DecisionOption[] {
  const draft: { id: string; label: string; probability: number }[] = [];

  if (Array.isArray(raw)) {
    raw.forEach((entry, index) => {
      const option = optionFromUnknown(entry, index);
      if (option) draft.push(option);
    });
  } else {
    const record = asRecord(raw);
    if (record) {
      Object.entries(record).forEach(([key, value], index) => {
        if (typeof value === 'number' || typeof value === 'string') {
          const probability = Number(value);
          if (!Number.isFinite(probability)) return;
          const id = clip(key) || `option-${index}`;
          draft.push({ id, label: id, probability });
          return;
        }
        const nested = asRecord(value);
        if (!nested) return;
        const option = optionFromUnknown({ ...nested, id: nested.id ?? key }, index);
        if (option) draft.push(option);
      });
    }
  }

  const probabilities = coerceProbabilities(draft.map(option => option.probability));
  return draft
    .map((option, index) => ({ ...option, probability: probabilities[index] }))
    .filter(option => option.probability >= 0 && option.probability <= 1)
    .sort((a, b) => b.probability - a.probability)
    .slice(0, MAX_OPTIONS);
}

export function normalizeDecisionMeta(raw: unknown): DecisionMeta | null {
  const record = asRecord(raw);
  if (!record) return null;

  const source = parseSource(record);
  if (!source) return null;

  const modelId = readString(record, ['modelId', 'model', 'model_id']);
  const latencyRaw = readNumber(record, ['latencyMs', 'latency_ms', 'durationMs', 'duration_ms', 'latency']);
  const latencyMs = latencyRaw != null && latencyRaw >= 0 ? Math.round(latencyRaw) : undefined;
  const actionTypeRaw = readString(record, ['actionType', 'action_type', 'chosenActionType', 'chosen_action_type']);
  const actionType = actionTypeRaw && ACTION_TYPES.has(actionTypeRaw as GameActionType)
    ? actionTypeRaw as GameActionType
    : undefined;

  const choice = readString(record, ['choice']);
  let chosenOptionId = readString(record, ['chosenOptionId', 'chosen_option_id', 'chosenId', 'choiceId', 'optionId']);
  let chosenOptionLabel = readString(record, [
    'chosenOptionLabel',
    'chosen_option_label',
    'chosenLabel',
    'choiceLabel',
    'label',
  ]);

  const optionSources = [
    record.options,
    record.topOptions,
    record.top_options,
    record.probabilities,
    record.probs,
  ];
  let options: DecisionOption[] = [];
  for (const source of optionSources) {
    if (source == null) continue;
    const parsed = parseOptions(source);
    if (parsed.length > 0) {
      options = parsed;
      break;
    }
  }

  if (choice) {
    const matched = options.find(option => option.id === choice || option.label === choice);
    if (matched) {
      if (!chosenOptionId) chosenOptionId = matched.id;
      if (!chosenOptionLabel) chosenOptionLabel = matched.label;
    } else if (!chosenOptionId && /^[a-z0-9_.:/-]+$/i.test(choice)) {
      chosenOptionId = choice;
    } else if (!chosenOptionLabel) {
      chosenOptionLabel = choice;
    }
  }

  if (!chosenOptionLabel && chosenOptionId) {
    chosenOptionLabel = options.find(option => option.id === chosenOptionId)?.label;
  }

  const fallbackReason = readString(record, ['fallbackReason', 'fallback_reason', 'reason']);
  const actionIndexRaw = readNumber(record, ['actionIndex', 'action_index']);
  const actionIndex = actionIndexRaw != null && actionIndexRaw >= 0 ? Math.floor(actionIndexRaw) : undefined;

  return {
    source,
    ...(modelId ? { modelId } : {}),
    ...(latencyMs != null ? { latencyMs } : {}),
    ...(actionType ? { actionType } : {}),
    ...(chosenOptionId ? { chosenOptionId } : {}),
    ...(chosenOptionLabel ? { chosenOptionLabel } : {}),
    ...(options.length > 0 ? { options } : {}),
    ...(fallbackReason ? { fallbackReason } : {}),
    ...(actionIndex != null ? { actionIndex } : {}),
  };
}

/** 从 `gameStateUpdate` 载荷里取出可选元数据。多种字段名都接受，缺失时返回 undefined。 */
export function pickDecisionMeta(payload: unknown): unknown {
  const record = asRecord(payload);
  if (!record) return undefined;

  if (record.decisionMeta != null) return record.decisionMeta;
  if (record.decision_meta != null) return record.decision_meta;

  const gameState = asRecord(record.gameState);
  if (gameState?.decisionMeta != null) return gameState.decisionMeta;
  if (gameState?.decision_meta != null) return gameState.decision_meta;

  const action = asRecord(record.action);
  if (action?.decisionMeta != null) return action.decisionMeta;
  if (action?.decision_meta != null) return action.decision_meta;
  if (action?.jev != null && typeof action.jev === 'object') return action.jev;

  if (record.jev != null && typeof record.jev === 'object') return record.jev;
  return undefined;
}

function latestFrom(map: Record<number, DecisionMeta>): DecisionMeta | null {
  let best: DecisionMeta | null = null;
  for (const meta of Object.values(map)) {
    if (!best || (meta.actionIndex ?? -1) >= (best.actionIndex ?? -1)) best = meta;
  }
  return best;
}

/**
 * 把一次 `gameStateUpdate` 合并进决策日志。
 * 历史变短或重新开局时丢弃旧记录，避免标错动作。没有元数据时保留上一次 AI 决策，方便人类在自己的回合查看。
 */
export function applyDecisionUpdate(
  prev: DecisionLogState,
  actionCount: number,
  rawMeta: unknown,
  restarted = false,
): DecisionLogState {
  const safeCount = Number.isFinite(actionCount) && actionCount > 0 ? Math.floor(actionCount) : 0;
  const shrunk = safeCount < prev.trackedActionCount;
  const decisions: Record<number, DecisionMeta> = restarted || shrunk
    ? {}
    : { ...prev.decisionsByActionIndex };

  for (const key of Object.keys(decisions)) {
    if (Number(key) >= safeCount) delete decisions[Number(key)];
  }

  const normalized = normalizeDecisionMeta(rawMeta);
  if (!normalized) {
    return {
      decisionsByActionIndex: decisions,
      latestDecision: latestFrom(decisions),
      trackedActionCount: safeCount,
    };
  }

  if (safeCount === 0) {
    return {
      decisionsByActionIndex: decisions,
      latestDecision: normalized,
      trackedActionCount: 0,
    };
  }

  const requested = normalized.actionIndex;
  const index = requested != null && requested < safeCount ? requested : safeCount - 1;
  const stored: DecisionMeta = { ...normalized, actionIndex: index };
  decisions[index] = stored;

  return {
    decisionsByActionIndex: decisions,
    latestDecision: stored,
    trackedActionCount: safeCount,
  };
}

'use client';

import type { DecisionMeta, DecisionSource, GameActionType } from '../../types/game';

const ACTION_LABEL: Record<GameActionType, string> = {
  TAKE_GEMS: '获取宝石',
  PURCHASE_CARD: '购买卡牌',
  RESERVE_CARD: '预留卡牌',
  CLAIM_NOBLE: '领取贵族',
  DISCARD_GEMS: '丢弃宝石',
  RESTART_GAME: '重新开始',
};

const BADGE_CLASS: Record<DecisionSource, string> = {
  jev: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  heuristic: 'bg-amber-100 text-amber-800 border-amber-200',
  forced: 'bg-gray-100 text-gray-600 border-gray-200',
};

export function decisionBadgeClass(source: DecisionSource): string {
  return `inline-flex items-center rounded border px-1 py-0 text-[10px] font-semibold leading-4 ${BADGE_CLASS[source]}`;
}

export function formatProbability(probability: number): string {
  const pct = Math.round(probability * 1000) / 10;
  return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`;
}

export function DecisionPanel({ meta }: { meta: DecisionMeta }) {
  const topOptions = (meta.options ?? []).slice(0, 3);
  const actionLabel = meta.actionType ? ACTION_LABEL[meta.actionType] : undefined;

  return (
    <section
      data-testid="ai-decision-panel"
      aria-label="AI 决策"
      aria-live="polite"
      className="mb-1.5 rounded-xl border border-indigo-100 bg-indigo-50/90 px-2.5 py-2 shadow-sm"
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <h4 className="text-[11px] font-semibold text-indigo-900">AI 决策</h4>
        <span data-testid="ai-decision-source" className={decisionBadgeClass(meta.source)}>
          {meta.source}
        </span>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px] text-gray-700">
        {actionLabel && meta.actionType && (
          <>
            <dt className="text-gray-500">动作</dt>
            <dd data-testid="ai-decision-action">
              {actionLabel}
              <span className="ml-1 text-gray-400">{meta.actionType}</span>
            </dd>
          </>
        )}
        {meta.chosenOptionLabel && (
          <>
            <dt className="text-gray-500">选项</dt>
            <dd data-testid="ai-decision-choice" className="font-medium text-gray-800">
              {meta.chosenOptionLabel}
            </dd>
          </>
        )}
        {meta.modelId && (
          <>
            <dt className="text-gray-500">模型</dt>
            <dd data-testid="ai-decision-model" className="truncate" title={meta.modelId}>
              {meta.modelId}
            </dd>
          </>
        )}
        {meta.latencyMs != null && (
          <>
            <dt className="text-gray-500">耗时</dt>
            <dd data-testid="ai-decision-latency">{meta.latencyMs} ms</dd>
          </>
        )}
      </dl>

      {meta.source === 'forced' && topOptions.length === 0 && (
        <p className="mt-1 text-[10px] text-gray-500">唯一合法动作</p>
      )}

      {meta.fallbackReason && (
        <p data-testid="ai-decision-fallback" className="mt-1 text-[10px] text-amber-800">
          回退：{meta.fallbackReason}
        </p>
      )}

      {topOptions.length > 0 && (
        <ol data-testid="ai-decision-top" className="mt-1.5 space-y-1">
          {topOptions.map((option, index) => {
            const chosen = option.id === meta.chosenOptionId || option.label === meta.chosenOptionLabel;
            const width = Math.max(0, Math.min(100, option.probability * 100));
            return (
              <li key={`${option.id}-${index}`} className="text-[10px]">
                <div className="mb-0.5 flex items-center justify-between gap-2">
                  <span className={`truncate ${chosen ? 'font-semibold text-indigo-800' : 'text-gray-600'}`}>
                    {option.label}
                  </span>
                  <span className="shrink-0 tabular-nums text-gray-500">{formatProbability(option.probability)}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white">
                  <div
                    className={chosen ? 'h-full bg-indigo-500' : 'h-full bg-indigo-300'}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

'use client';

import type { GameAction } from '../../types/game';
import { useGameStore } from '../../store/gameStore';
import { ActionHistory } from './ActionHistory';

interface InsightSheetProps {
  actions: GameAction[];
  open: boolean;
  onToggle: () => void;
}

export function InsightSheet({ actions, open, onToggle }: InsightSheetProps) {
  const latestDecision = useGameStore(state => state.latestDecision);
  const gameState = useGameStore(state => state.gameState);
  const players = gameState ? Array.from(gameState.players.values()) : [];
  const current = players.find(player => player.id === gameState?.currentTurn);
  const aiThinking = Boolean(current?.isAI && !gameState?.winner);

  return (
    <div
      data-testid="insight-sheet"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 md:hidden"
    >
      <div className="pointer-events-auto mx-auto flex max-w-[1600px] flex-col">
        <button
          type="button"
          data-testid="insight-sheet-toggle"
          aria-expanded={open}
          aria-controls="insight-sheet-panel"
          onClick={onToggle}
          className={`mx-3 flex min-h-11 items-center justify-between gap-2 rounded-t-xl border border-b-0 border-indigo-100 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm ${
            aiThinking ? 'ring-2 ring-indigo-200' : ''
          }`}
        >
          <span className="inline-flex min-w-0 items-center gap-2">
            <span className="truncate">{open ? '收起记录' : '记录与 AI 决策'}</span>
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] tabular-nums text-slate-600">
              {actions.length}
            </span>
            {latestDecision && (
              <span className="truncate rounded-full bg-indigo-50 px-1.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                {latestDecision.source}
              </span>
            )}
          </span>
          <span aria-hidden className="text-xs text-slate-400">{open ? '▾' : '▴'}</span>
        </button>

        <div
          id="insight-sheet-panel"
          data-testid="insight-sheet-panel"
          hidden={!open}
          className="max-h-[min(70dvh,32rem)] overflow-y-auto border-t border-indigo-100 bg-white px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.35)]"
        >
          <ActionHistory actions={actions} framed={false} testId="action-history-sheet" />
        </div>
      </div>
    </div>
  );
}

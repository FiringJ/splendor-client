'use client';

import { useEffect, useState } from 'react';
import type { GemType, Player } from '../../types/game';
import { useGameStore } from '../../store/gameStore';
import { useSocketStore } from '../../store/socketStore';
import { useUserStore } from '../../store/userStore';

const GEM_ORDER: GemType[] = ['diamond', 'sapphire', 'emerald', 'ruby', 'onyx', 'gold'];

const GEM_LABEL: Record<GemType, string> = {
  diamond: '钻石',
  sapphire: '蓝宝石',
  emerald: '祖母绿',
  ruby: '红宝石',
  onyx: '黑曜石',
  gold: '黄金',
};

const GEM_CHIP: Record<GemType, string> = {
  diamond: 'border-slate-300 bg-white text-slate-700',
  sapphire: 'border-blue-300 bg-blue-500 text-white',
  emerald: 'border-emerald-300 bg-emerald-500 text-white',
  ruby: 'border-rose-300 bg-rose-500 text-white',
  onyx: 'border-slate-600 bg-slate-800 text-white',
  gold: 'border-amber-300 bg-amber-400 text-amber-950',
};

function listPlayers(players: Player[] | Map<string, Player>): Player[] {
  if (Array.isArray(players)) return players;
  return Array.from(players.values());
}

export function StatusBar() {
  const gameState = useGameStore(state => state.gameState);
  const loading = useGameStore(state => state.loading);
  const latestDecision = useGameStore(state => state.latestDecision);
  const isConnected = useSocketStore(state => state.isConnected);
  const isInitialized = useSocketStore(state => state.isInitialized);
  const playerId = useUserStore(state => state.playerId);

  const players = gameState ? listPlayers(gameState.players) : [];
  const currentPlayer = players.find(player => player.id === gameState?.currentTurn) ?? null;
  const aiThinking = Boolean(currentPlayer?.isAI && !gameState?.winner);
  const turnKey = aiThinking ? currentPlayer?.id ?? 'ai' : null;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!turnKey) {
      setElapsed(0);
      return;
    }
    const started = Date.now();
    setElapsed(0);
    const timer = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - started) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [turnKey]);

  if (!gameState) return null;

  const isYourTurn = Boolean(playerId && playerId === gameState.currentTurn);
  const connectionLabel = isConnected ? '已连接' : isInitialized ? '已断开' : '连接中';
  const latencyMs = latestDecision?.latencyMs;

  return (
    <header
      data-testid="game-status-bar"
      className="sticky top-0 z-20 shrink-0 border-b border-indigo-100 bg-white/90 px-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 shadow-sm backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <h1 className="truncate text-lg font-semibold tracking-tight text-indigo-950 md:text-xl">
            璀璨宝石
          </h1>
          <span
            data-testid="connection-state"
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
              isConnected
                ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100'
                : 'bg-amber-50 text-amber-800 ring-1 ring-amber-100'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {connectionLabel}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <p
            data-testid="turn-indicator"
            className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              isYourTurn
                ? 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200'
                : 'bg-slate-50 text-slate-700 ring-1 ring-slate-200'
            }`}
          >
            {isYourTurn && (
              <span className="h-1.5 w-1.5 shrink-0 animate-ping rounded-full bg-emerald-500" />
            )}
            <span className="truncate">
              {isYourTurn
                ? '你的回合'
                : currentPlayer
                  ? `${currentPlayer.name} 的回合`
                  : '等待回合'}
            </span>
          </p>

          {aiThinking && (
            <p
              data-testid="ai-thinking"
              role="status"
              aria-live="polite"
              aria-label="AI thinking"
              className="inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-900 ring-1 ring-indigo-100"
            >
              <span className="h-1.5 w-1.5 shrink-0 animate-ping rounded-full bg-indigo-500" />
              <span>AI thinking…</span>
              <span className="tabular-nums text-indigo-700">{elapsed}s</span>
              {latencyMs != null && (
                <span data-testid="ai-thinking-latency" className="text-indigo-600">
                  上次 {latencyMs} ms
                </span>
              )}
            </p>
          )}

          {loading && !aiThinking && (
            <p
              data-testid="sync-hint"
              role="status"
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
            >
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
              同步中
            </p>
          )}
        </div>

        <div
          data-testid="gem-bank-summary"
          className="flex max-w-full gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {GEM_ORDER.map(gem => (
            <span
              key={gem}
              title={GEM_LABEL[gem]}
              className={`inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full border px-1.5 text-[11px] font-semibold tabular-nums ${GEM_CHIP[gem]}`}
            >
              <span className="sr-only">{GEM_LABEL[gem]}</span>
              {gameState.gems[gem] ?? 0}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}

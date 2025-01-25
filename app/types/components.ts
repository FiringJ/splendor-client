import type { GameAction, Noble, Card, GemType, Player } from './game';

export interface NobleDisplayProps {
  nobles: Noble[];
  onSelect: (action: GameAction) => Promise<void>;
}

export interface CardDisplayProps {
  cards: {
    level1: Card[];
    level2: Card[];
    level3: Card[];
    deck1: Card[];
    deck2: Card[];
    deck3: Card[];
  };
  onPurchase: (action: GameAction) => Promise<void>;
  onReserve: (action: GameAction) => Promise<void>;
  disabled: boolean;
}

export interface GemTokenProps {
  gems: Record<GemType, number>;
  onSelect: (action: GameAction) => Promise<void>;
  disabled: boolean;
}

export interface PlayerPanelProps {
  player: Player;
  isActive: boolean;
}

export interface ActionHistoryProps {
  actions: GameAction[];
}

export interface AIControlProps {
  onToggle: (action: GameAction) => Promise<void>;
}

export interface GameOverDialogProps {
  onPlayAgain: (action: GameAction) => Promise<void>;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
} 
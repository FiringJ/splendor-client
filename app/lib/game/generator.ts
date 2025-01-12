import { Noble } from '../../types/game';
import { level1Cards } from '../../data/cards/level1';
import { level2Cards } from '../../data/cards/level2';
import { level3Cards } from '../../data/cards/level3';
import { nobles } from '../../data/nobles';

export function generateInitialCards() {
  const shuffleArray = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  return {
    level1: shuffleArray(level1Cards).slice(0, 4),
    level2: shuffleArray(level2Cards).slice(0, 4),
    level3: shuffleArray(level3Cards).slice(0, 4),
    deck1: shuffleArray(level1Cards.slice(4)),
    deck2: shuffleArray(level2Cards.slice(4)),
    deck3: shuffleArray(level3Cards.slice(4))
  };
}

export function generateInitialNobles(count: number): Noble[] {
  return shuffleArray(nobles).slice(0, count);
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
} 
import { level1Cards } from './cards/level1';
import { level2Cards } from './cards/level2';
import { level3Cards } from './cards/level3';
import { nobles } from './nobles';

export const gameData = {
  cards: {
    level1: level1Cards,
    level2: level2Cards,
    level3: level3Cards
  },
  nobles: nobles
};

// 获取随机卡牌
export function getRandomCards(level: 1 | 2 | 3, count: number) {
  const cards = level === 1 ? level1Cards :
    level === 2 ? level2Cards : level3Cards;
  return shuffle(cards).slice(0, count);
}

// 获取随机贵族
export function getRandomNobles(count: number) {
  return shuffle(nobles).slice(0, count);
}

// Fisher-Yates 洗牌算法
function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
} 
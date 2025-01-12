'use client';

import { Player, GemType } from '../../types/game';
import { Card } from './Card';
import { Noble } from './Noble';

interface PlayerPanelProps {
  player: Player;
  isActive: boolean;
}

const gemColors: Record<GemType, string> = {
  diamond: 'text-gray-700 bg-white border-2 border-gray-300',
  sapphire: 'text-white bg-blue-500',
  emerald: 'text-white bg-green-500',
  ruby: 'text-white bg-red-500',
  onyx: 'text-white bg-gray-800',
  gold: 'text-black bg-yellow-400'
};

export const PlayerPanel = ({ player, isActive }: PlayerPanelProps) => {
  return (
    <div className={`
      p-4 rounded-lg shadow-md
      ${isActive ? 'bg-yellow-50 ring-2 ring-yellow-400' : 'bg-white'}
    `}>
      {/* 玩家信息头部 */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="font-bold">{player.name}</span>
          {isActive && <span className="text-sm text-yellow-600">(当前回合)</span>}
        </div>
        <div className="text-xl font-bold text-purple-800">
          {player.points} 分
        </div>
      </div>

      {/* 宝石区域 */}
      <div className="mb-4">
        <h3 className="text-sm font-bold mb-2">宝石:</h3>
        <div className="flex gap-2">
          {Object.entries(player.gems).map(([gem, count]) => count > 0 && (
            <div key={gem} className="flex items-center gap-1">
              <div className={`w-6 h-6 rounded-full ${gemColors[gem as GemType]} 
                            flex items-center justify-center text-sm`}>
                {count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 发展卡区域 */}
      <div className="mb-4">
        <h3 className="text-sm font-bold mb-2">发展卡:</h3>
        <div className="flex gap-2 overflow-x-auto">
          {player.cards.map((card) => (
            <div key={card.id} className="transform scale-75 origin-left">
              <Card card={card} disabled />
            </div>
          ))}
        </div>
      </div>

      {/* 预留卡区域 */}
      {player.reservedCards.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-bold mb-2">预留卡:</h3>
          <div className="flex gap-2 overflow-x-auto">
            {player.reservedCards.map((card) => (
              <div key={card.id} className="transform scale-75 origin-left">
                <Card card={card} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 贵族区域 */}
      {player.nobles.length > 0 && (
        <div>
          <h3 className="text-sm font-bold mb-2">贵族:</h3>
          <div className="flex gap-2 overflow-x-auto">
            {player.nobles.map((noble) => (
              <div key={noble.id} className="transform scale-75 origin-left">
                <Noble noble={noble} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 
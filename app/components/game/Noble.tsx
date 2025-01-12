'use client';

import { Noble as NobleType, GemType } from '../../types/game';

interface NobleProps {
  noble: NobleType;
}

const gemColors: Record<GemType, string> = {
  diamond: 'text-gray-700 bg-white',
  sapphire: 'text-white bg-blue-500',
  emerald: 'text-white bg-green-500',
  ruby: 'text-white bg-red-500',
  onyx: 'text-white bg-gray-800',
  gold: 'text-black bg-yellow-400'
};

export const Noble = ({ noble }: NobleProps) => {
  return (
    <div className="w-24 h-24 rounded-lg bg-purple-100 shadow-md p-2 
                    flex flex-col items-center justify-between">
      {/* 点数 */}
      <div className="text-xl font-bold text-purple-800">
        {noble.points}
      </div>

      {/* 要求 */}
      <div className="grid grid-cols-2 gap-1">
        {Object.entries(noble.requirements).map(([gem, count]) => (
          <div key={gem} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${gemColors[gem as GemType]}`} />
            <span className="text-xs">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}; 
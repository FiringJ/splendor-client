'use client';

import { Noble as NobleType, GemType } from '../../types/game';

interface NobleProps {
  noble: NobleType;
}

const gemColors: Record<GemType, string> = {
  diamond: 'text-gray-700 bg-white border border-gray-300',
  sapphire: 'text-white bg-blue-500',
  emerald: 'text-white bg-green-500',
  ruby: 'text-white bg-red-500',
  onyx: 'text-white bg-gray-800',
  gold: 'text-black bg-yellow-400'
};

export const Noble = ({ noble }: NobleProps) => {
  return (
    <div className="w-24 h-32 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 
                    shadow-lg hover:shadow-xl transition-all duration-300 
                    border-2 border-purple-300 p-2 
                    flex flex-col items-center justify-between
                    relative overflow-hidden">
      {/* 装饰背景 */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="w-full h-full bg-[url('/images/noble-pattern.png')] bg-repeat" />
      </div>

      {/* 头像区域 */}
      <div className="w-12 h-12 rounded-full bg-purple-300 border-2 border-purple-400
                    flex items-center justify-center overflow-hidden">
        <div className="text-xl">👑</div>
      </div>

      {/* 点数 */}
      <div className="absolute top-1 right-1 w-6 h-6 rounded-full 
                    bg-purple-600 text-white
                    flex items-center justify-center
                    text-sm font-bold shadow-md">
        {noble.points}
      </div>

      {/* 要求 */}
      <div className="w-full bg-white bg-opacity-50 rounded-lg p-1">
        <div className="grid grid-cols-2 gap-1">
          {Object.entries(noble.requirements).map(([gem, count]) => (
            <div key={gem}
              className="flex items-center gap-1 bg-white bg-opacity-60 
                          rounded-sm px-1">
              <div className={`w-3 h-3 rounded-full ${gemColors[gem as GemType]} 
                            shadow-sm transform hover:scale-110 transition-transform`} />
              <span className="text-xs font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 
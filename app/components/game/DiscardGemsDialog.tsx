'use client';

import { useGameStore } from '../../store/gameStore';
import { useRoomStore } from '../../store/roomStore';
import { useSocket } from '../../hooks/useSocket';
import { GemType } from '../../types/game';
import { useState, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';

const gemColorMap: Record<GemType, string> = {
  diamond: 'bg-white border-2',
  sapphire: 'bg-blue-500',
  emerald: 'bg-green-500',
  ruby: 'bg-red-500',
  onyx: 'bg-gray-800',
  gold: 'bg-yellow-400',
};

const gemNameMap: Record<GemType, string> = {
  diamond: '钻石',
  sapphire: '蓝宝石',
  emerald: '祖母绿',
  ruby: '红宝石',
  onyx: '玛瑙',
  gold: '黄金',
};

export function DiscardGemsDialog() {
  const gameState = useGameStore(state => state.gameState);
  const setLoading = useGameStore(state => state.setLoading);
  const roomId = useRoomStore(state => state.roomId);
  const { performGameAction } = useSocket();
  const [selectedGems, setSelectedGems] = useState<Partial<Record<GemType, number>>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingDiscard = gameState?.pendingDiscard;
  
  // 如果成功丢弃，添加自动关闭的效果
  useEffect(() => {
    if (isSuccess) {
      // 短暂显示成功消息后关闭对话框
      const timer = setTimeout(() => {
        // 重置状态
        setSelectedGems({});
        setIsSuccess(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);
  
  // 当前登录用户ID
  const currentUserId = useUserStore(state => state.playerId);
  
  // 如果没有待丢弃的宝石，或不是当前用户需要丢弃，隐藏对话框
  if (!pendingDiscard || !gameState || !roomId || pendingDiscard.playerId !== currentUserId) return null;

  const currentPlayer = gameState.players.find(p => p.id === pendingDiscard.playerId);
  if (!currentPlayer) return null;

  const currentTotal = Object.values(currentPlayer.gems).reduce((sum, count) => sum + (count || 0), 0);
  const selectedTotal = Object.values(selectedGems).reduce((sum, count) => sum + (count || 0), 0);
  const remainingToDiscard = pendingDiscard.gemsCount - selectedTotal;

  const handleGemClick = (gemType: GemType) => {
    if (isProcessing) return;

    const currentGemCount = currentPlayer.gems[gemType] || 0;
    const selectedCount = selectedGems[gemType] || 0;

    if (selectedCount < currentGemCount && remainingToDiscard > 0) {
      setSelectedGems(prev => ({
        ...prev,
        [gemType]: (prev[gemType] || 0) + 1
      }));
    }
  };

  const handleRemoveGem = (gemType: GemType) => {
    if (isProcessing) return;

    const selectedCount = selectedGems[gemType] || 0;
    if (selectedCount > 0) {
      setSelectedGems(prev => ({
        ...prev,
        [gemType]: prev[gemType] ? prev[gemType]! - 1 : 0
      }));
    }
  };

  const handleConfirm = async () => {
    if (remainingToDiscard <= 0 && !isProcessing) {
      try {
        setIsProcessing(true);
        setLoading(true);
        await performGameAction(roomId, {
          type: 'DISCARD_GEMS',
          playerId: pendingDiscard.playerId,
          payload: {
            gems: selectedGems
          }
        });
        // 标记成功
        setIsSuccess(true);
      } catch (error) {
        console.error('Failed to discard gems:', error);
        setIsProcessing(false);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        {isSuccess ? (
          <div className="text-center py-6">
            <svg className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-xl font-bold text-green-600 mb-2">宝石已丢弃</h2>
            <p className="text-gray-500">游戏继续进行中...</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">需要丢弃宝石</h2>
            <p className="mb-4">
              你的宝石总数为 {currentTotal}，超过了上限 10 个。
              请丢弃 <span className="font-bold text-red-500">{remainingToDiscard}</span> 个宝石。
            </p>

            <div className="mb-6">
              <h3 className="font-bold mb-2">当前宝石:</h3>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(gemNameMap) as GemType[]).map(gemType => {
                  const count = currentPlayer.gems[gemType] || 0;
                  if (count === 0) return null;
                  
                  return (
                    <div key={gemType} className="flex flex-col items-center">
                      <button
                        onClick={() => handleGemClick(gemType)}
                        disabled={remainingToDiscard <= 0 || isProcessing}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold relative disabled:opacity-50"
                      >
                        <div className={`w-8 h-8 rounded-full ${gemColorMap[gemType]}`}></div>
                        <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                          {count}
                        </span>
                      </button>
                      <span className="text-xs mt-1">{gemNameMap[gemType]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {Object.keys(selectedGems).length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold mb-2">将丢弃:</h3>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(selectedGems) as GemType[]).map(gemType => {
                    const count = selectedGems[gemType] || 0;
                    if (count === 0) return null;
                    
                    return (
                      <div key={gemType} className="flex flex-col items-center">
                        <button
                          onClick={() => handleRemoveGem(gemType)}
                          disabled={isProcessing}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold relative disabled:opacity-50"
                        >
                          <div className={`w-8 h-8 rounded-full ${gemColorMap[gemType]}`}></div>
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            {count}
                          </span>
                        </button>
                        <span className="text-xs mt-1">{gemNameMap[gemType]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleConfirm}
                disabled={remainingToDiscard > 0 || isProcessing}
                className={`px-4 py-2 ${isProcessing ? 'bg-gray-300' : 'bg-blue-500'} text-white rounded disabled:bg-gray-300`}
              >
                {isProcessing ? '处理中...' : '确认'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 
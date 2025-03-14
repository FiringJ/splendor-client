"use client";

import { useSocket } from '../hooks/useSocket';
import { GameBoard } from './game/GameBoard';
import { GameSetup } from './game/GameSetup';
import { useGameStore } from '../store/gameStore';

export default function GameLayout() {
  // 初始化socket连接，当前玩家连接到服务端
  useSocket();
  const gameState = useGameStore(state => state.gameState);
  const error = useGameStore(state => state.error);
  const setError = useGameStore(state => state.setError);
  
  // 关闭错误提示
  const handleCloseError = () => {
    setError(null);
  };
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80')] bg-cover bg-fixed opacity-5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(255,255,255,0.8)_50%,rgba(255,255,255,1)_100%)]"></div>
      
      {/* 内容区域 */}
      <div className="relative z-10">
        {error && (
          <div className="fixed top-4 right-4 left-4 md:left-auto md:max-w-md bg-white border-l-4 border-red-500 rounded-lg shadow-xl p-4 animate-fade-in z-50" role="alert">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button"
                    onClick={handleCloseError}
                    className="inline-flex rounded-md p-1.5 text-gray-500 hover:bg-red-100 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">关闭</span>
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div>
          {gameState ? <GameBoard /> : <GameSetup />}
        </div>
      </div>
    </main>
  );
} 
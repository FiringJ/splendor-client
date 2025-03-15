'use client';

import { useState, useEffect, useRef } from 'react';

export const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showVolume, setShowVolume] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioLoaded, setAudioLoaded] = useState(false);

  useEffect(() => {
    // 创建音频元素
    const audio = new Audio('/audio/background-music.mp3');
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    // 监听加载事件
    audio.addEventListener('canplaythrough', () => {
      setAudioLoaded(true);
    });

    // 在组件卸载时停止音乐
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 当音量变化时更新
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // 开始/暂停播放
  const togglePlay = () => {
    if (!audioRef.current || !audioLoaded) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // 尝试播放可能会因为浏览器策略而被拒绝
      // 如果被拒绝，将播放状态重置
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // 播放成功
          })
          .catch(error => {
            setIsPlaying(false);
            console.error('背景音乐播放失败:', error);
          });
      }
    }
    setIsPlaying(!isPlaying);
  };

  // 处理音量变化
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  // 显示/隐藏音量控制器
  const toggleVolumeControl = () => {
    setShowVolume(!showVolume);
  };

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className="relative">
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          title={isPlaying ? '暂停背景音乐' : '播放背景音乐'}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>

        {isPlaying && (
          <button
            onClick={toggleVolumeControl}
            className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
            title="音量控制"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
        )}

        {showVolume && (
          <div className="absolute top-0 -right-40 bg-white rounded-lg shadow-lg p-3 w-36">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-purple-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>{Math.round(volume * 100)}%</span>
              <span>100%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 
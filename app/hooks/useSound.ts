'use client';

import { useCallback, useRef } from 'react';

// 定义可能的音效类型及其文件名
export type SoundType =
  | 'select_gem'
  | 'deselect_gem'
  | 'purchase_card'
  | 'reserve_card'
  | 'claim_noble'
  | 'your_turn'
  | 'game_start'
  | 'game_over'
  | 'error'
  | 'message_received';

const soundFiles: Record<SoundType, string> = {
  select_gem: 'select.mp3',      // 选择宝石
  deselect_gem: 'deselect.mp3',  // 取消选择宝石
  purchase_card: 'purchase.mp3',   // 购买卡牌
  reserve_card: 'reserve.mp3',    // 预留卡牌
  claim_noble: 'noble.mp3',       // 获得贵族
  your_turn: 'turn.mp3',          // 轮到你的回合
  game_start: 'start.mp3',       // 游戏开始
  game_over: 'gameover.mp3',      // 游戏结束
  error: 'error.mp3',           // 错误提示
  message_received: 'message.mp3', // 收到消息 (可选)
};

export const useSound = () => {
  // 使用 ref 存储 Audio 对象，避免重复创建
  const audioRef = useRef<Record<string, HTMLAudioElement>>({});

  const playSound = useCallback((type: SoundType, volume: number = 0.7) => {
    const soundFile = soundFiles[type];
    if (!soundFile) {
      console.warn(`Sound type "${type}" not found.`);
      return;
    }

    try {
      let audio = audioRef.current[soundFile];
      if (!audio) {
        audio = new Audio(`/sounds/${soundFile}`);
        audioRef.current[soundFile] = audio;
      }

      // 停止可能正在播放的同一音效，然后重新播放
      audio.pause();
      audio.currentTime = 0;
      audio.volume = Math.max(0, Math.min(1, volume)); // 限制音量在 0-1 之间

      audio.play().catch(error => {
        // 忽略用户未交互导致的播放错误，但在开发中提示
        if (error.name === 'NotAllowedError') {
          console.warn(`Audio play prevented for ${soundFile}. User interaction might be required.`);
        } else {
          console.error(`Error playing sound ${soundFile}:`, error);
        }
      });
    } catch (error) {
      console.error(`Failed to load or play sound ${soundFile}:`, error);
    }
  }, []);

  return playSound;
}; 
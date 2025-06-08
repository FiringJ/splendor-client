'use client';

import { useEffect, useRef } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useUserStore } from '../store/userStore';

/**
 * @description 一个模拟的 useUser hook，它从 Zustand 存储中派生用户信息。
 * 如果您的项目中有真实的 useUser hook，可以替换此实现，只要它返回用户对象或 null 即可。
 */
const useUser = () => {
  const { playerId, playerName } = useUserStore();
  if (playerId && playerName) {
    // 您可以根据需要扩展此对象，例如添加 email
    return { id: playerId, username: playerName, email: `${playerName}@splendor.game` };
  }
  return null;
};

/**
 * SentryUserTracker 是一个客户端组件，它在整个应用生命周期中
 * 自动追踪用户登录状态，并相应地设置 Sentry 的用户上下文。
 */
export const SentryUserTracker = () => {
  const user = useUser();
  const userRef = useRef(user);

  useEffect(() => {
    // 确保此逻辑仅在浏览器环境中运行
    if (typeof window === 'undefined') {
      return;
    }

    // 场景 1: 用户已登录，或用户信息发生更新
    if (user) {
      Sentry.setUser({
        id: user.id,
        username: user.username,
        email: user.email,
      });
    } 
    // 场景 2: 用户刚刚登出 (从一个登录状态过渡到非登录状态)
    else if (userRef.current && !user) {
      Sentry.setUser(null); // 按要求，在登出时清除 Sentry 用户上下文
    } 
    // 场景 3: 用户未登录 (初始加载时，或登出后)
    else {
      Sentry.setUser({ id: 'anonymous' });
    }

    // 更新 ref，以便在下一次渲染时它能反映当前的用户状态
    userRef.current = user;
  }, [user]);

  // 这是一个纯逻辑组件，不渲染任何 DOM 元素
  return null;
}; 
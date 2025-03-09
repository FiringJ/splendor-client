"use client";

import { createContext, useContext } from 'react';

// 简化为只有浅色模式
interface ThemeContextType {
  theme: 'light';
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'light' });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 固定为浅色模式
  const value = { theme: 'light' as const };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
} 
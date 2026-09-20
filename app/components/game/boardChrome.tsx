'use client';

import { createContext, useContext } from 'react';

interface BoardChromeState {
  /** Mobile history sheet is open. Floating controls hide so they don't cover it. */
  sheetOpen: boolean;
}

const BoardChromeContext = createContext<BoardChromeState>({ sheetOpen: false });

export const BoardChromeProvider = BoardChromeContext.Provider;

export function useBoardChrome(): BoardChromeState {
  return useContext(BoardChromeContext);
}

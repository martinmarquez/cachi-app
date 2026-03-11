import React, { createContext, useContext, useState, useCallback } from 'react';
import { themes, Theme, ThemeMode } from '@/lib/theme';

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  isCalmMode: boolean;
  toggleCalmMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: themes.normal,
  mode: 'normal',
  isCalmMode: false,
  toggleCalmMode: () => {},
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('normal');

  const toggleCalmMode = useCallback(() => {
    setMode((prev) => (prev === 'normal' ? 'calma' : 'normal'));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: themes[mode],
        mode,
        isCalmMode: mode === 'calma',
        toggleCalmMode,
        setMode,
      }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

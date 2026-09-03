import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.dataset.appearance = theme;
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      isDark: theme === 'dark',
      isLight: theme === 'light',
      isWhite: theme === 'white',
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

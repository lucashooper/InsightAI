import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'dark' | 'vibrant' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Get theme from localStorage or default to dark
    const savedTheme = localStorage.getItem('insightai-theme') as Theme;
    return savedTheme || 'dark';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('insightai-theme', newTheme);
    
    // Apply theme class to body
    document.body.className = `theme-${newTheme}`;
  };

  useEffect(() => {
    // Apply initial theme
    document.body.className = `theme-${theme}`;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 
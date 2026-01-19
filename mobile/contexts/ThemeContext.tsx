import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeName = 'dark' | 'vibrant' | 'ocean' | 'forest' | 'sunset';

export interface Theme {
  name: ThemeName;
  colors: {
    // Background colors
    background: string;
    backgroundGradient: string[];
    cardBackground: string;
    
    // Text colors
    primaryText: string;
    secondaryText: string;
    tertiaryText: string;
    
    // Accent colors
    primary: string;
    primaryGradient: string[];
    secondary: string;
    accent: string;
    
    // Orb colors
    orbPrimary: string[];
    orbSecondary: string[];
    orbAccent: string[];
    
    // Status colors
    success: string;
    warning: string;
    error: string;
    
    // UI elements
    border: string;
    divider: string;
    shadow: string;
    
    // Surface tokens for cards/containers
    surface: string;
    surfaceElevated: string;
    surfaceHover: string;
  };
}

const themes: Record<ThemeName, Theme> = {
  dark: {
    name: 'dark',
    colors: {
      background: '#000000',
      backgroundGradient: ['#0a0a0a', '#050505', '#000000'],
      cardBackground: 'rgba(10, 10, 10, 0.95)',
      
      primaryText: '#ffffff',
      secondaryText: '#e5e7eb',
      tertiaryText: '#9ca3af',
      
      primary: '#8b5cf6',
      primaryGradient: ['#8b5cf6', '#7c3aed'],
      secondary: '#6366f1',
      accent: '#a855f7',
      
      orbPrimary: ['rgba(139, 92, 246, 0.9)', 'rgba(168, 85, 247, 0.7)'],
      orbSecondary: ['rgba(99, 102, 241, 0.8)', 'rgba(79, 70, 229, 0.7)'],
      orbAccent: ['rgba(168, 85, 247, 0.7)', 'rgba(192, 132, 252, 0.6)'],
      
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      
      border: '#1a1a1a',
      divider: 'rgba(255, 255, 255, 0.1)',
      shadow: '#000000',
      
      surface: 'rgba(139, 92, 246, 0.08)',
      surfaceElevated: 'rgba(139, 92, 246, 0.12)',
      surfaceHover: 'rgba(139, 92, 246, 0.15)',
    },
  },
  
  vibrant: {
    name: 'vibrant',
    colors: {
      background: '#0f0a1f',
      backgroundGradient: ['#1a0f2e', '#0f0a1f', '#0a0515'],
      cardBackground: 'rgba(26, 15, 46, 0.95)',
      
      primaryText: '#ffffff',
      secondaryText: '#e0d5ff',
      tertiaryText: '#a78bfa',
      
      primary: '#a855f7',
      primaryGradient: ['#a855f7', '#8b5cf6', '#7c3aed'],
      secondary: '#3b82f6',
      accent: '#ec4899',
      
      orbPrimary: ['rgba(168, 85, 247, 0.95)', 'rgba(139, 92, 246, 0.85)'],
      orbSecondary: ['rgba(59, 130, 246, 0.95)', 'rgba(29, 78, 216, 0.85)'],
      orbAccent: ['rgba(236, 72, 153, 0.9)', 'rgba(219, 39, 119, 0.8)'],
      
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      
      border: 'rgba(168, 85, 247, 0.2)',
      divider: 'rgba(168, 85, 247, 0.15)',
      shadow: '#8b5cf6',
      
      surface: 'rgba(168, 85, 247, 0.08)',
      surfaceElevated: 'rgba(168, 85, 247, 0.12)',
      surfaceHover: 'rgba(168, 85, 247, 0.15)',
    },
  },
  
  ocean: {
    name: 'ocean',
    colors: {
      background: '#0a1628',
      backgroundGradient: ['#0f1f3a', '#0a1628', '#051018'],
      cardBackground: 'rgba(15, 31, 58, 0.95)',
      
      primaryText: '#ffffff',
      secondaryText: '#dbeafe',
      tertiaryText: '#93c5fd',
      
      primary: '#3b82f6',
      primaryGradient: ['#3b82f6', '#2563eb'],
      secondary: '#06b6d4',
      accent: '#0ea5e9',
      
      orbPrimary: ['rgba(59, 130, 246, 0.95)', 'rgba(37, 99, 235, 0.85)'],
      orbSecondary: ['rgba(6, 182, 212, 0.9)', 'rgba(8, 145, 178, 0.8)'],
      orbAccent: ['rgba(14, 165, 233, 0.85)', 'rgba(2, 132, 199, 0.75)'],
      
      success: '#14b8a6',
      warning: '#f59e0b',
      error: '#ef4444',
      
      border: 'rgba(59, 130, 246, 0.2)',
      divider: 'rgba(59, 130, 246, 0.15)',
      shadow: '#1e40af',
      
      surface: 'rgba(59, 130, 246, 0.08)',
      surfaceElevated: 'rgba(59, 130, 246, 0.12)',
      surfaceHover: 'rgba(59, 130, 246, 0.15)',
    },
  },
  
  forest: {
    name: 'forest',
    colors: {
      background: '#0a1f0f',
      backgroundGradient: ['#0f2e1a', '#0a1f0f', '#051008'],
      cardBackground: 'rgba(15, 46, 26, 0.95)',
      
      primaryText: '#ffffff',
      secondaryText: '#d1fae5',
      tertiaryText: '#6ee7b7',
      
      primary: '#10b981',
      primaryGradient: ['#10b981', '#059669'],
      secondary: '#14b8a6',
      accent: '#34d399',
      
      orbPrimary: ['rgba(16, 185, 129, 0.95)', 'rgba(5, 150, 105, 0.85)'],
      orbSecondary: ['rgba(20, 184, 166, 0.9)', 'rgba(13, 148, 136, 0.8)'],
      orbAccent: ['rgba(52, 211, 153, 0.85)', 'rgba(16, 185, 129, 0.75)'],
      
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      
      border: 'rgba(16, 185, 129, 0.2)',
      divider: 'rgba(16, 185, 129, 0.15)',
      shadow: '#065f46',
      
      surface: 'rgba(16, 185, 129, 0.08)',
      surfaceElevated: 'rgba(16, 185, 129, 0.12)',
      surfaceHover: 'rgba(16, 185, 129, 0.15)',
    },
  },
  
  sunset: {
    name: 'sunset',
    colors: {
      background: '#1f0a0f',
      backgroundGradient: ['#2e0f1a', '#1f0a0f', '#100508'],
      cardBackground: 'rgba(46, 15, 26, 0.95)',
      
      primaryText: '#ffffff',
      secondaryText: '#fed7aa',
      tertiaryText: '#fdba74',
      
      primary: '#f97316',
      primaryGradient: ['#f97316', '#ea580c'],
      secondary: '#ec4899',
      accent: '#fb923c',
      
      orbPrimary: ['rgba(249, 115, 22, 0.95)', 'rgba(234, 88, 12, 0.85)'],
      orbSecondary: ['rgba(236, 72, 153, 0.9)', 'rgba(219, 39, 119, 0.8)'],
      orbAccent: ['rgba(251, 146, 60, 0.85)', 'rgba(249, 115, 22, 0.75)'],
      
      success: '#10b981',
      warning: '#fbbf24',
      error: '#dc2626',
      
      border: 'rgba(249, 115, 22, 0.2)',
      divider: 'rgba(249, 115, 22, 0.15)',
      shadow: '#9a3412',
      
      surface: 'rgba(249, 115, 22, 0.08)',
      surfaceElevated: 'rgba(249, 115, 22, 0.12)',
      surfaceHover: 'rgba(249, 115, 22, 0.15)',
    },
  },
};

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@insightai_theme';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>('vibrant');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored && themes[stored as ThemeName]) {
        setThemeName(stored as ThemeName);
        console.log('[THEME] Active theme:', stored);
      } else {
        console.log('[THEME] Active theme:', 'vibrant (default)');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (name: ThemeName) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, name);
      setThemeName(name);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[themeName], themeName, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

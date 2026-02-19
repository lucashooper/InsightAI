import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeName = 'dark' | 'light' | 'vibrant' | 'ocean' | 'forest' | 'sunset' | 'midnight';

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
      background: '#faf5ff',
      backgroundGradient: ['#faf5ff', '#f3e8ff', '#e9d5ff'],
      cardBackground: 'rgba(255, 255, 255, 0.95)',
      
      primaryText: '#2C2C2C',
      secondaryText: '#4A4A4A',
      tertiaryText: '#6B6B6B',
      
      primary: '#a855f7',
      primaryGradient: ['#a855f7', '#8b5cf6'],
      secondary: '#c084fc',
      accent: '#d8b4fe',
      
      orbPrimary: ['rgba(168, 85, 247, 0.95)', 'rgba(139, 92, 246, 0.85)', 'rgba(124, 58, 237, 0.75)'],
      orbSecondary: ['rgba(192, 132, 252, 0.9)', 'rgba(167, 139, 250, 0.8)'],
      orbAccent: ['rgba(216, 180, 254, 0.85)', 'rgba(233, 213, 255, 0.75)'],
      
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
      background: '#eff6ff',
      backgroundGradient: ['#eff6ff', '#dbeafe', '#bfdbfe'],
      cardBackground: 'rgba(255, 255, 255, 0.95)',
      
      primaryText: '#2C2C2C',
      secondaryText: '#4A4A4A',
      tertiaryText: '#6B6B6B',
      
      primary: '#3b82f6',
      primaryGradient: ['#3b82f6', '#2563eb'],
      secondary: '#60a5fa',
      accent: '#93c5fd',
      
      orbPrimary: ['rgba(59, 130, 246, 0.95)', 'rgba(37, 99, 235, 0.85)', 'rgba(29, 78, 216, 0.75)'],
      orbSecondary: ['rgba(96, 165, 250, 0.9)', 'rgba(147, 197, 253, 0.8)'],
      orbAccent: ['rgba(147, 197, 253, 0.85)', 'rgba(191, 219, 254, 0.75)'],
      
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
      background: '#fff5ed',
      backgroundGradient: ['#fff5ed', '#ffedd5', '#fed7aa'],
      cardBackground: 'rgba(255, 255, 255, 0.95)',
      
      primaryText: '#2C2C2C',
      secondaryText: '#4A4A4A',
      tertiaryText: '#6B6B6B',
      
      primary: '#f97316',
      primaryGradient: ['#f97316', '#ea580c'],
      secondary: '#fb923c',
      accent: '#fdba74',
      
      orbPrimary: ['rgba(249, 115, 22, 0.95)', 'rgba(234, 88, 12, 0.85)', 'rgba(194, 65, 12, 0.75)'],
      orbSecondary: ['rgba(251, 146, 60, 0.9)', 'rgba(253, 186, 116, 0.8)'],
      orbAccent: ['rgba(253, 186, 116, 0.85)', 'rgba(254, 215, 170, 0.75)'],
      
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
  
  midnight: {
    name: 'midnight',
    colors: {
      background: '#0f0f23',
      backgroundGradient: ['#0f0f23', '#1a1a3e', '#252550'],
      cardBackground: 'rgba(10, 10, 10, 0.95)',
      
      primaryText: '#ffffff',
      secondaryText: '#e5e7eb',
      tertiaryText: '#9ca3af',
      
      primary: '#6366f1',
      primaryGradient: ['#6366f1', '#4f46e5'],
      secondary: '#818cf8',
      accent: '#a5b4fc',
      
      orbPrimary: ['rgba(99, 102, 241, 0.95)', 'rgba(79, 70, 229, 0.85)', 'rgba(67, 56, 202, 0.75)'],
      orbSecondary: ['rgba(129, 140, 248, 0.9)', 'rgba(165, 180, 252, 0.8)'],
      orbAccent: ['rgba(165, 180, 252, 0.85)', 'rgba(199, 210, 254, 0.75)'],
      
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      
      border: '#1a1a1a',
      divider: 'rgba(255, 255, 255, 0.1)',
      shadow: '#000000',
      
      surface: 'rgba(99, 102, 241, 0.08)',
      surfaceElevated: 'rgba(99, 102, 241, 0.12)',
      surfaceHover: 'rgba(99, 102, 241, 0.15)',
    },
  },
  
  light: {
    name: 'light',
    colors: {
      background: '#fef7f2',
      backgroundGradient: ['#fef5f8', '#fef0f5', '#fef7f2'],
      cardBackground: 'rgba(255, 255, 255, 0.8)',
      
      primaryText: '#2C2C2C',
      secondaryText: '#4A4A4A',
      tertiaryText: '#6B6B6B',
      
      primary: '#FFA726',
      primaryGradient: ['#FFA726', '#FF9800'],
      secondary: '#4DD0E1',
      accent: '#FFD700',
      
      orbPrimary: ['rgba(255, 167, 38, 0.9)', 'rgba(255, 152, 0, 0.8)'],
      orbSecondary: ['rgba(77, 208, 225, 0.85)', 'rgba(38, 198, 218, 0.75)'],
      orbAccent: ['rgba(255, 215, 0, 0.8)', 'rgba(255, 193, 7, 0.7)'],
      
      success: '#66BB6A',
      warning: '#FFA726',
      error: '#EF5350',
      
      border: '#E8E5DC',
      divider: 'rgba(74, 74, 74, 0.1)',
      shadow: 'rgba(139, 92, 70, 0.15)',
      
      surface: 'rgba(255, 167, 38, 0.05)',
      surfaceElevated: 'rgba(255, 167, 38, 0.08)',
      surfaceHover: 'rgba(255, 167, 38, 0.12)',
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
  const [themeName, setThemeName] = useState<ThemeName>('dark');

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
        console.log('[THEME] Active theme:', 'dark (default)');
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

// Helper function to check if a theme uses dark styling (dark backgrounds, white text)
export const isDarkTheme = (themeName: ThemeName): boolean => {
  return themeName === 'dark' || themeName === 'midnight' || themeName === 'forest';
};

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
      background: '#08080d',
      backgroundGradient: ['#101019', '#09090f', '#050508'],
      cardBackground: 'rgba(4, 4, 7, 0.86)',
      
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
      
      border: 'rgba(255, 255, 255, 0.055)',
      divider: 'rgba(255, 255, 255, 0.05)',
      shadow: '#000000',
      
      surface: 'rgba(255, 255, 255, 0.04)',
      surfaceElevated: 'rgba(255, 255, 255, 0.065)',
      surfaceHover: 'rgba(255, 255, 255, 0.085)',
    },
  },
  
  vibrant: {
    name: 'vibrant',
    colors: {
      background: '#faf5ff',
      backgroundGradient: ['#faf5ff', '#f3e8ff', '#e9d5ff'],
      cardBackground: 'rgba(248, 248, 250, 0.85)',
      
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
      cardBackground: 'rgba(248, 248, 250, 0.85)',
      
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
      cardBackground: 'rgba(25, 30, 28, 0.9)',
      
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
      background: '#fff8f0', // CHANGED: More yellow/orange
      backgroundGradient: ['#fff8f0', '#ffe9d6', '#ffd9b8'], // CHANGED: Warmer tones
      cardBackground: 'rgba(248, 248, 250, 0.85)',
      
      primaryText: '#2C2C2C',
      secondaryText: '#4A4A4A',
      tertiaryText: '#6B6B6B',
      
      primary: '#ff8c42',
      primaryGradient: ['#ff8c42', '#ff6b35'],
      secondary: '#ffa85c',
      accent: '#ffc078',
      
      orbPrimary: ['rgba(255, 140, 66, 0.95)', 'rgba(255, 107, 53, 0.85)', 'rgba(255, 165, 0, 0.75)'],
      orbSecondary: ['rgba(255, 168, 92, 0.9)', 'rgba(255, 192, 120, 0.8)'],
      orbAccent: ['rgba(255, 192, 120, 0.85)', 'rgba(255, 220, 180, 0.75)'],
      
      success: '#10b981',
      warning: '#fbbf24',
      error: '#dc2626',
      
      border: 'rgba(255, 140, 66, 0.2)',
      divider: 'rgba(255, 140, 66, 0.15)',
      shadow: '#d97035',
      
      surface: 'rgba(255, 140, 66, 0.08)',
      surfaceElevated: 'rgba(255, 140, 66, 0.12)',
      surfaceHover: 'rgba(255, 140, 66, 0.15)',
    },
  },
  
  midnight: {
    name: 'midnight',
    colors: {
      background: '#0f0f23',
      backgroundGradient: ['#0f0f23', '#1a1a3e', '#252550'],
      cardBackground: 'rgba(28, 28, 38, 0.9)',
      
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
      
      border: 'rgba(255, 255, 255, 0.08)',
      divider: 'rgba(255, 255, 255, 0.06)',
      shadow: '#000000',
      
      surface: 'rgba(99, 102, 241, 0.08)',
      surfaceElevated: 'rgba(99, 102, 241, 0.12)',
      surfaceHover: 'rgba(99, 102, 241, 0.15)',
    },
  },
  
  light: {
    name: 'light',
    colors: {
      background: '#fbf6ff',
      backgroundGradient: ['#fff0f8', '#f0eaff', '#fff0e8'],
      cardBackground: 'rgba(255, 255, 255, 0.72)',
      
      primaryText: '#2C2C2C',
      secondaryText: '#4A4A4A',
      tertiaryText: '#6B6B6B',
      
      primary: '#8b5cf6',
      primaryGradient: ['#a78bfa', '#8b5cf6'],
      secondary: '#e87974',
      accent: '#35b9ad',
      
      orbPrimary: ['rgba(168, 85, 247, 0.92)', 'rgba(139, 92, 246, 0.82)'],
      orbSecondary: ['rgba(244, 122, 104, 0.82)', 'rgba(251, 146, 130, 0.70)'],
      orbAccent: ['rgba(255, 193, 112, 0.75)', 'rgba(53, 185, 173, 0.55)'],
      
      success: '#66BB6A',
      warning: '#FFA726',
      error: '#EF5350',
      
      border: 'rgba(118, 82, 151, 0.14)',
      divider: 'rgba(83, 55, 105, 0.10)',
      shadow: 'rgba(107, 73, 135, 0.18)',
      
      surface: 'rgba(139, 92, 246, 0.055)',
      surfaceElevated: 'rgba(139, 92, 246, 0.09)',
      surfaceHover: 'rgba(139, 92, 246, 0.13)',
    },
  },
};

export type ContainerStyle = 'modern-gray' | 'responsive';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  containerStyle: ContainerStyle;
  setContainerStyle: (style: ContainerStyle) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@insightai_theme';
const CONTAINER_STYLE_KEY = '@insightai_container_style';

const DARK_THEMES: ThemeName[] = ['dark', 'midnight', 'forest'];
const LIGHT_THEMES: ThemeName[] = ['light', 'vibrant', 'ocean', 'sunset'];

/** Collapse legacy palette themes into light or dark. */
export const normalizeThemeName = (stored: string | null): ThemeName => {
  if (!stored) return 'dark';
  if (stored === 'light' || stored === 'dark') return stored;
  if (DARK_THEMES.includes(stored as ThemeName)) return 'dark';
  if (LIGHT_THEMES.includes(stored as ThemeName)) return 'light';
  return 'dark';
};

/** Themes shown in Appearance settings. */
export const selectableThemes: ThemeName[] = ['light', 'dark'];

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>('dark');
  const [containerStyle, setContainerStyleState] = useState<ContainerStyle>('modern-gray');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      const normalized = normalizeThemeName(stored);
      setThemeName(normalized);
      if (stored && stored !== normalized) {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, normalized);
      }
      console.log('[THEME] Active theme:', normalized);
      const storedContainer = await AsyncStorage.getItem(CONTAINER_STYLE_KEY);
      if (storedContainer === 'modern-gray' || storedContainer === 'responsive') {
        setContainerStyleState(storedContainer);
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

  const setContainerStyle = async (style: ContainerStyle) => {
    try {
      await AsyncStorage.setItem(CONTAINER_STYLE_KEY, style);
      setContainerStyleState(style);
    } catch (error) {
      console.error('Error saving container style:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[themeName], themeName, setTheme, containerStyle, setContainerStyle }}>
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
  return normalizeThemeName(themeName) === 'dark';
};

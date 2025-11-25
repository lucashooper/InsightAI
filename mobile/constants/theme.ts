// mobile/constants/theme.ts

export const THEME = {
    colors: {
        // Gradients with direction for expo-linear-gradient
        gradients: {
            briefingCard: {
                colors: ['#0f172a', '#1e293b'],
                start: { x: 0, y: 0 },
                end: { x: 1, y: 1 }, // 135deg diagonal
            },
            actionableCard: {
                colors: ['#312e81', '#4338ca'],
                start: { x: 0, y: 0 },
                end: { x: 1, y: 1 },
            },
            viewFullAnalysis: {
                colors: ['#a855f7', '#7c3aed'],
                start: { x: 0, y: 0 },
                end: { x: 1, y: 1 },
            },
            backButton: {
                // Simulating glass with semi-transparent solid/gradient
                colors: ['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.2)'],
                start: { x: 0, y: 0 },
                end: { x: 1, y: 1 },
            },
            summaryCard: {
                colors: ['rgba(30, 41, 59, 0.6)', 'rgba(15, 23, 42, 0.8)'],
                start: { x: 0, y: 0 },
                end: { x: 0, y: 1 }, // Subtle top-to-bottom
            },

            // Badges
            badges: {
                strength: {
                    colors: ['rgba(34, 197, 94, 0.15)', 'rgba(22, 163, 74, 0.2)'],
                    start: { x: 0, y: 0 },
                    end: { x: 1, y: 1 },
                },
                win: {
                    colors: ['rgba(59, 130, 246, 0.15)', 'rgba(37, 99, 235, 0.2)'],
                    start: { x: 0, y: 0 },
                    end: { x: 1, y: 1 },
                },
                challenge: {
                    colors: ['rgba(245, 158, 11, 0.15)', 'rgba(217, 119, 6, 0.2)'],
                    start: { x: 0, y: 0 },
                    end: { x: 1, y: 1 },
                },
                growth: {
                    colors: ['rgba(168, 85, 247, 0.15)', 'rgba(147, 51, 234, 0.2)'],
                    start: { x: 0, y: 0 },
                    end: { x: 1, y: 1 },
                },
                frustrated: {
                    // ✨ Primary emotion gets enhanced visibility
                    colors: ['rgba(168, 85, 247, 0.2)', 'rgba(147, 51, 234, 0.25)'],
                    start: { x: 0, y: 0 },
                    end: { x: 1, y: 1 },
                },
            }
        },
        borders: {
            glass: 'rgba(255, 255, 255, 0.08)',
            glassStrong: 'rgba(139, 92, 246, 0.3)',
            badges: {
                strength: 'rgba(34, 197, 94, 0.25)',
                win: 'rgba(59, 130, 246, 0.25)',
                challenge: 'rgba(245, 158, 11, 0.25)',
                growth: 'rgba(168, 85, 247, 0.25)',
                frustrated: 'rgba(168, 85, 247, 0.4)',
            }
        },
        text: {
            primary: '#ffffff',
            secondary: '#9ca3af',
            badges: {
                strength: '#4ade80',
                win: '#60a5fa',
                challenge: '#fbbf24',
                growth: '#c084fc',
                frustrated: '#e879f9',
            }
        },
        states: {
            active: 'rgba(168, 85, 247, 0.8)',
            hover: 'rgba(168, 85, 247, 0.3)',
        }
    },

    shadows: {
        // React Native shadows
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 2,
            elevation: 2,
        },
        md: {
            // Multi-layer simulation (best effort in RN single shadow prop)
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 4,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.18,
            shadowRadius: 24,
            elevation: 8,
        },
        // Colored glows for badges
        glows: {
            strength: {
                shadowColor: '#22c55e',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 4,
            },
            win: {
                shadowColor: '#3b82f6',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 4,
            },
            challenge: {
                shadowColor: '#f59e0b',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 4,
            },
            growth: {
                shadowColor: '#a855f7',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 4,
            }
        }
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        xxl: 32,
        xxxl: 48,
    },

    borderRadius: {
        sm: 12, // Badges
        md: 16, // Buttons
        lg: 20, // Insight Cards
        xl: 24, // Briefing Card
    },

    typography: {
        weights: {
            regular: '400',
            medium: '500',
            bold: '700',
        },
        sizes: {
            xs: 12,
            sm: 14,
            md: 16,
            lg: 18,
            xl: 20,
            xxl: 28,
        },
        lineHeights: {
            tight: 1.2,
            normal: 1.5,
            relaxed: 1.75,
        },
        letterSpacing: {
            tight: -0.5,
            normal: 0,
            wide: 0.5,
        }
    },

    animations: {
        durations: {
            fast: 200,
            normal: 300,
            slow: 400,
        },
        stagger: 80,
        easing: {
            default: 'ease-out',
        },
        scales: {
            press: 0.98,
            hover: 1.02,
        }
    },

    opacity: {
        glass: 0.2,
        overlay: 0.6,
        disabled: 0.4,
    },

    // Placeholder for blur values if we add a native blur library later
    blur: {
        light: 10,
        medium: 20,
        heavy: 40,
    }
};

export type Theme = typeof THEME;

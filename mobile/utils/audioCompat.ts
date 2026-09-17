// Unified Audio Compatibility Layer for Expo SDK 57
// Expo Go SDK 57 removed the legacy 'expo-av' native module (ExponentAV)
// and replaced it with 'expo-audio'. This adapter ensures:
// 1. Module evaluation NEVER crashes on startup if a native module is missing.
// 2. Audio plays via 'expo-audio' where supported (like Expo Go SDK 57).
// 3. Graceful fallback occurs if no native audio module is available.

export type AVPlaybackStatus = {
  isLoaded: boolean;
  isPlaying?: boolean;
  durationMillis?: number;
  positionMillis?: number;
  didJustFinish?: boolean;
  error?: string;
  [key: string]: any;
};

export interface SoundInstance {
  playAsync: () => Promise<any>;
  pauseAsync: () => Promise<any>;
  stopAsync: () => Promise<any>;
  unloadAsync: () => Promise<any>;
  getStatusAsync: () => Promise<AVPlaybackStatus>;
  setOnPlaybackStatusUpdate: (listener: (status: AVPlaybackStatus) => void) => void;
  setIsLoopingAsync?: (isLooping: boolean) => Promise<any>;
  setVolumeAsync?: (volume: number) => Promise<any>;
}

let nativeExpoAudio: any = null;
let nativeExpoAV: any = null;

// Safe dynamic detection - never throws at import time
try {
  nativeExpoAudio = require('expo-audio');
} catch (e) {
  // expo-audio not available
}

if (!nativeExpoAudio) {
  try {
    nativeExpoAV = require('expo-av');
  } catch (e) {
    // expo-av not available
  }
}

export const Audio = {
  setAudioModeAsync: async (options: Record<string, any>): Promise<void> => {
    try {
      if (nativeExpoAudio?.AudioModule?.setAudioModeAsync) {
        await nativeExpoAudio.AudioModule.setAudioModeAsync(options);
        return;
      }
      if (nativeExpoAV?.Audio?.setAudioModeAsync) {
        await nativeExpoAV.Audio.setAudioModeAsync(options);
        return;
      }
    } catch (err) {
      console.warn('[AudioCompat] setAudioModeAsync warning:', err);
    }
  },

  Sound: {
    createAsync: async (
      source: any,
      initialStatus: {
        isLooping?: boolean;
        volume?: number;
        shouldPlay?: boolean;
        [key: string]: any;
      } = {},
      onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void
    ): Promise<{ sound: SoundInstance }> => {
      // 1. Try expo-audio (modern SDK 57 standard in Expo Go)
      if (nativeExpoAudio?.createAudioPlayer) {
        try {
          const rawSource = typeof source === 'object' && source?.uri ? source.uri : source;
          const player = nativeExpoAudio.createAudioPlayer(rawSource);

          if (initialStatus.isLooping !== undefined) {
            player.loop = !!initialStatus.isLooping;
          }
          if (initialStatus.volume !== undefined) {
            player.volume = initialStatus.volume;
          }

          let updateListener: ((status: any) => void) | null = null;
          if (onPlaybackStatusUpdate) {
            updateListener = (status: any) => {
              onPlaybackStatusUpdate({
                isLoaded: player.isLoaded,
                isPlaying: player.playing,
                durationMillis: (player.duration || 0) * 1000,
                positionMillis: (player.currentTime || 0) * 1000,
                didJustFinish: status?.playbackFinished || false,
              });
            };
            player.addListener('playbackStatusUpdate', updateListener);
          }

          if (initialStatus.shouldPlay) {
            player.play();
          }

          const sound: SoundInstance = {
            playAsync: async () => player.play(),
            pauseAsync: async () => player.pause(),
            stopAsync: async () => {
              player.pause();
              player.seekTo(0);
            },
            unloadAsync: async () => {
              try {
                player.remove();
              } catch (_) {}
            },
            getStatusAsync: async () => ({
              isLoaded: player.isLoaded ?? true,
              isPlaying: player.playing ?? false,
              durationMillis: (player.duration || 0) * 1000,
              positionMillis: (player.currentTime || 0) * 1000,
            }),
            setOnPlaybackStatusUpdate: (cb) => {
              player.addListener('playbackStatusUpdate', (status: any) => {
                cb({
                  isLoaded: player.isLoaded,
                  isPlaying: player.playing,
                  durationMillis: (player.duration || 0) * 1000,
                  positionMillis: (player.currentTime || 0) * 1000,
                  didJustFinish: status?.playbackFinished || false,
                });
              });
            },
            setIsLoopingAsync: async (looping: boolean) => {
              player.loop = looping;
            },
            setVolumeAsync: async (vol: number) => {
              player.volume = vol;
            },
          };

          return { sound };
        } catch (audioErr) {
          console.warn('[AudioCompat] expo-audio failed, falling back:', audioErr);
        }
      }

      // 2. Try legacy expo-av (if available in native builds)
      if (nativeExpoAV?.Audio?.Sound?.createAsync) {
        try {
          return await nativeExpoAV.Audio.Sound.createAsync(
            source,
            initialStatus,
            onPlaybackStatusUpdate
          );
        } catch (avErr) {
          console.warn('[AudioCompat] expo-av createAsync failed:', avErr);
        }
      }

      // 3. Fallback mock if no native audio module exists in current environment
      console.log('[AudioCompat] No native audio module available (simulated playback)');
      const mockSound: SoundInstance = {
        playAsync: async () => {},
        pauseAsync: async () => {},
        stopAsync: async () => {},
        unloadAsync: async () => {},
        getStatusAsync: async () => ({
          isLoaded: true,
          isPlaying: false,
          durationMillis: 3000,
          positionMillis: 0,
        }),
        setOnPlaybackStatusUpdate: () => {},
        setIsLoopingAsync: async () => {},
        setVolumeAsync: async () => {},
      };

      return { sound: mockSound };
    },
  },
};

export namespace Audio {
  export type Sound = SoundInstance;
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { AiPersonality } from '../../utils/aiPersonalities';
import {
  buildShaderOrbHtml,
  getShaderOrbConfigForPersonality,
} from '../../utils/shaderOrbHtml';
import { markOrbWarmed } from '../../utils/orbWarmupRegistry';

type Props = {
  size: number;
  personality?: AiPersonality;
  isRoast?: boolean;
  /** Keep mounted off-screen for pre-warming; never fades in. */
  warmup?: boolean;
  /** Persistent pool instance — visible immediately once WebGL init completes. */
  poolMode?: boolean;
};

type OrbDiag = {
  supported?: boolean;
  webgl?: boolean;
  fallback?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
};

function logOrbMessage(raw: string, tag: string) {
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const type = String(data.type ?? 'unknown');

    if (type === 'console') {
      const level = String(data.level ?? 'log');
      const msg = String(data.msg ?? '');
      if (level === 'error') console.error(`[ORB:webview] ${msg}`);
      else if (level === 'warn') console.warn(`[ORB:webview] ${msg}`);
      else console.log(`[ORB:webview] ${msg}`);
      return data;
    }

    if (type === 'error' || type === 'catch') {
      console.error(`[ORB:${type}]`, data.msg ?? data, data.stack ?? '');
      return data;
    }

    console.log(`[ORB:${type}]`, JSON.stringify(data));
    return data;
  } catch {
    console.log(`[ORB:${tag}]`, raw);
    return null;
  }
}

export default function OrbView({
  size,
  personality = 'default',
  isRoast = false,
  warmup = false,
  poolMode = false,
}: Props) {
  const personalityKey = isRoast ? 'roast' : personality;

  const [diag, setDiag] = useState<OrbDiag | null>(null);
  const loadStarted = useRef(false);
  const readyRef = useRef(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const html = useMemo(() => {
    const config = getShaderOrbConfigForPersonality(personalityKey);
    return buildShaderOrbHtml(config, size);
  }, [size, personalityKey]);

  const markReady = useCallback(() => {
    if (warmup || poolMode) {
      markOrbWarmed(size, personalityKey, isRoast);
      if (poolMode) {
        readyRef.current = true;
        fadeAnim.setValue(1);
      }
      return;
    }
    if (readyRef.current) return;

    readyRef.current = true;
    markOrbWarmed(size, personalityKey, isRoast);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, isRoast, personalityKey, poolMode, size, warmup]);

  useEffect(() => {
    readyRef.current = false;
    loadStarted.current = false;
    fadeAnim.setValue(0);
  }, [html, fadeAnim]);

  useEffect(() => {
    if (!warmup && !poolMode) {
      console.log('[ORB] mount', {
        size,
        personality: personalityKey,
        htmlLength: html.length,
      });
    }
    if (!html.length) {
      console.error('[ORB] HTML template is empty — orb will not render');
    }
  }, [html, size, personalityKey, isRoast, warmup, poolMode]);

  useEffect(() => {
    if (diag?.fallback) {
      console.warn('[ORB] WebGL unavailable — showing CSS gradient fallback', diag);
    } else if (diag?.supported) {
      console.log('[ORB] WebGL2 orb running', {
        canvas: `${diag.canvasWidth}x${diag.canvasHeight}`,
      });
    }
  }, [diag]);

  const onMessage = useCallback(
    (e: { nativeEvent: { data: string } }) => {
      const raw = e.nativeEvent.data;
      let parsed: Record<string, unknown> | null = null;
      try {
        parsed = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        if (!poolMode && !warmup) {
          console.log('[ORB:message]', raw);
        }
        return;
      }

      if (poolMode || warmup) {
        if (parsed.type === 'init') {
          setDiag({
            supported: Boolean(parsed.supported),
            webgl: Boolean(parsed.webgl),
            fallback: Boolean(parsed.fallback),
            canvasWidth: Number(parsed.canvasWidth) || 0,
            canvasHeight: Number(parsed.canvasHeight) || 0,
          });
          markReady();
        }
        return;
      }

      logOrbMessage(raw, 'message');
      if (parsed.type === 'init') {
        setDiag({
          supported: Boolean(parsed.supported),
          webgl: Boolean(parsed.webgl),
          fallback: Boolean(parsed.fallback),
          canvasWidth: Number(parsed.canvasWidth) || 0,
          canvasHeight: Number(parsed.canvasHeight) || 0,
        });
        markReady();
      }
    },
    [markReady, poolMode, warmup],
  );

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.fadeWrap,
          { width: size, height: size, opacity: warmup ? 0 : fadeAnim },
        ]}
      >
        <WebView
          key={`${size}-${personalityKey}`}
          source={{ html }}
          style={[styles.webview, { width: size, height: size }]}
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
          backgroundColor="transparent"
          opaque={false}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          pointerEvents="none"
          cacheEnabled
          incognito={false}
          onLoadStart={() => {
            loadStarted.current = true;
            if (!warmup) console.log('[ORB] WebView load started');
          }}
          onLoadEnd={() => {
            if (!loadStarted.current || warmup || readyRef.current) return;
            setTimeout(() => {
              if (!readyRef.current) {
                console.warn('[ORB] No init message received within 2s — check WebView JS bridge');
                markReady();
              }
            }, 2000);
          }}
          onError={(e) => console.error('[ORB] WebView error:', e.nativeEvent)}
          onHttpError={(e) => console.error('[ORB] HTTP error:', e.nativeEvent)}
          onMessage={onMessage}
          onConsoleMessage={(e) => {
            if (warmup || poolMode) return;
            const msg = `[ORB:console:${e.nativeEvent.messageLevel}] ${e.nativeEvent.message}`;
            if (e.nativeEvent.messageLevel === 'error') console.error(msg);
            else if (e.nativeEvent.messageLevel === 'warn') console.warn(msg);
          }}
          {...(Platform.OS === 'android' ? { androidHardwareAccelerationDisabled: false } : {})}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  fadeWrap: {
    backgroundColor: 'transparent',
  },
  webview: {
    backgroundColor: 'transparent',
  },
});

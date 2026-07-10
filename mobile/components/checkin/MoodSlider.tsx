import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { MOOD_STOPS } from './types';

const THUMB_WIDTH = 28;
const STOPS = MOOD_STOPS.length;

type Props = {
  score: number;
  accent: string;
  onScoreChange: (score: number) => void;
};

function scoreToPosition(score: number, trackWidth: number): number {
  if (trackWidth <= 0) return 0;
  const usable = trackWidth - THUMB_WIDTH;
  const index = Math.max(0, Math.min(STOPS - 1, score - 1));
  return (index / (STOPS - 1)) * usable;
}

function positionToScore(x: number, trackWidth: number): number {
  if (trackWidth <= 0) return 3;
  const usable = trackWidth - THUMB_WIDTH;
  const ratio = Math.max(0, Math.min(1, x / usable));
  return Math.max(1, Math.min(5, Math.round(ratio * (STOPS - 1) + 1)));
}

export default function MoodSlider({ score, accent, onScoreChange }: Props) {
  const trackWidth = useRef(0);
  const thumbX = useRef(new Animated.Value(0)).current;
  const dragStartX = useRef(0);
  const lastHapticScore = useRef(score);
  const [fillWidth, setFillWidth] = React.useState(0);

  const syncThumb = (nextScore: number, animate = true) => {
    const x = scoreToPosition(nextScore, trackWidth.current);
    setFillWidth(x + THUMB_WIDTH / 2);
    if (animate) {
      Animated.spring(thumbX, {
        toValue: x,
        friction: 7,
        tension: 140,
        useNativeDriver: false,
      }).start();
    } else {
      thumbX.setValue(x);
    }
  };

  const onTrackLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
    syncThumb(score, false);
  };

  const updateFromX = (x: number) => {
    const nextScore = positionToScore(x, trackWidth.current);
    if (nextScore !== lastHapticScore.current) {
      lastHapticScore.current = nextScore;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onScoreChange(nextScore);
    setFillWidth(scoreToPosition(nextScore, trackWidth.current) + THUMB_WIDTH / 2);
  };

  const onGestureEvent = (e: any) => {
    const x = Math.max(
      0,
      Math.min(trackWidth.current - THUMB_WIDTH, dragStartX.current + e.nativeEvent.translationX),
    );
    thumbX.setValue(x);
    updateFromX(x);
  };

  const onHandlerStateChange = (e: any) => {
    if (e.nativeEvent.state === State.BEGAN) {
      dragStartX.current = scoreToPosition(score, trackWidth.current);
    }
    if (
      e.nativeEvent.state === State.END ||
      e.nativeEvent.state === State.CANCELLED ||
      e.nativeEvent.state === State.FAILED
    ) {
      const x = Math.max(
        0,
        Math.min(
          trackWidth.current - THUMB_WIDTH,
          dragStartX.current + e.nativeEvent.translationX,
        ),
      );
      const snapped = positionToScore(x, trackWidth.current);
      lastHapticScore.current = snapped;
      onScoreChange(snapped);
      syncThumb(snapped, true);
    }
  };

  React.useEffect(() => {
    if (trackWidth.current > 0) {
      syncThumb(score, true);
      lastHapticScore.current = score;
    }
  }, [score]);

  return (
    <View style={styles.block}>
      <View style={styles.labels}>
        <Text style={styles.edgeLabel}>Terrible</Text>
        <Text style={styles.edgeLabel}>Amazing</Text>
      </View>
      <View style={styles.trackWrap} onLayout={onTrackLayout}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: fillWidth, backgroundColor: accent }]} />
        </View>
        <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
          <Animated.View style={[styles.thumb, { transform: [{ translateX: thumbX }] }]} />
        </PanGestureHandler>
      </View>
      <View style={styles.stops}>
        {MOOD_STOPS.map((stop) => (
          <View
            key={stop.score}
            style={[
              styles.stopDot,
              { backgroundColor: stop.score === score ? accent : 'rgba(255,255,255,0.18)' },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    width: '100%',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  edgeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.45)',
  },
  trackWrap: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    top: 6,
    width: THUMB_WIDTH,
    height: THUMB_WIDTH,
    borderRadius: THUMB_WIDTH / 2,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  stops: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: THUMB_WIDTH / 2 - 3,
    marginTop: 10,
  },
  stopDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

import { useRef, useCallback } from 'react';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';

const NEAR_BOTTOM_THRESHOLD = 120;
const SCROLL_THROTTLE_MS = 120;
const ANCHOR_TOP_OFFSET = 96;

type Options = {
  /** Updated via onAnchorLayout — Y offset within scroll content */
  anchorYRef?: React.MutableRefObject<number>;
};

/** Auto-scroll only while the user is already near the bottom (chat-style follow). */
export function useFollowBottomScroll(
  scrollRef: React.RefObject<ScrollView | null>,
  options: Options = {},
) {
  const { anchorYRef } = options;
  const isNearBottomRef = useRef(true);
  const followBottomRef = useRef(true);
  const lastScrollTsRef = useRef(0);

  const updateNearBottom = useCallback((event: NativeScrollEvent) => {
    const { contentOffset, layoutMeasurement, contentSize } = event;
    const distanceFromBottom =
      contentSize.height - layoutMeasurement.height - contentOffset.y;
    isNearBottomRef.current = distanceFromBottom <= NEAR_BOTTOM_THRESHOLD;
    if (isNearBottomRef.current) {
      followBottomRef.current = true;
    }
  }, []);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      updateNearBottom(event.nativeEvent);
    },
    [updateNearBottom],
  );

  const onScrollBeginDrag = useCallback(() => {
    followBottomRef.current = false;
  }, []);

  const onAnchorLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (anchorYRef) {
        anchorYRef.current = event.nativeEvent.layout.y;
      }
    },
    [anchorYRef],
  );

  const scrollToTarget = useCallback(
    (animated = true) => {
      const scroll = scrollRef.current;
      if (!scroll) return;

      const anchorY = anchorYRef?.current ?? 0;
      if (anchorY > 0) {
        scroll.scrollTo({ y: Math.max(0, anchorY - ANCHOR_TOP_OFFSET), animated });
        return;
      }

      scroll.scrollToEnd({ animated });
    },
    [scrollRef, anchorYRef],
  );

  const onContentSizeChange = useCallback(
    (_width: number, _height: number) => {
      if (!followBottomRef.current) return;
      const now = Date.now();
      if (now - lastScrollTsRef.current < SCROLL_THROTTLE_MS) return;
      lastScrollTsRef.current = now;
      scrollToTarget(false);
    },
    [scrollToTarget],
  );

  const scrollToTargetIfFollowing = useCallback(
    (animated = true) => {
      if (!followBottomRef.current) return;
      const now = Date.now();
      if (now - lastScrollTsRef.current < SCROLL_THROTTLE_MS) return;
      lastScrollTsRef.current = now;
      scrollToTarget(animated);
    },
    [scrollToTarget],
  );

  /** One-time scroll to the thread anchor when Go Deeper reply arrives. */
  const revealThread = useCallback(
    (animated = true) => {
      lastScrollTsRef.current = 0;
      scrollToTarget(animated);
    },
    [scrollToTarget],
  );

  return {
    onScroll,
    onScrollBeginDrag,
    onContentSizeChange,
    onAnchorLayout,
    scrollToEndIfFollowing: scrollToTargetIfFollowing,
    revealThread,
  };
}

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  AccessibilityInfo,
  Animated,
} from 'react-native';
import { MiraRevealPayload } from '../../constants/miraReveal';
import PremiumRevealCard from './PremiumRevealCard';
import PremiumButton from '../shared/PremiumButton';
import { PREMIUM } from '../../constants/premiumUI';

type Props = {
  reveal: MiraRevealPayload;
  isDark: boolean;
  isRoast?: boolean;
  explanationExpanded: boolean;
  sharePrefix: string;
  labels: {
    confidence: string;
    evidence: string;
    recommendation: string;
    exploreWhy: string;
    askFollowUp: string;
    share: string;
    fromJournals: string;
  };
  onExploreWhy: () => void;
  onAskFollowUp: () => void;
};

/**
 * Mira chat reveal — shared PremiumRevealCard visual standard.
 */
export default React.memo(function MiraRevealCard({
  reveal,
  explanationExpanded,
  labels,
  onExploreWhy,
  onAskFollowUp,
}: Props) {
  const announced = useRef(false);
  const enter = useRef(new Animated.Value(0)).current;
  const didAnimate = useRef(false);

  useEffect(() => {
    if (announced.current) return;
    announced.current = true;
    const conf = reveal.confidence != null ? `, ${reveal.confidence}% confidence` : '';
    AccessibilityInfo.announceForAccessibility?.(`${reveal.headline}. ${reveal.answer}${conf}`);
  }, [reveal]);

  useEffect(() => {
    if (didAnimate.current) {
      enter.setValue(1);
      return;
    }
    didAnimate.current = true;
    enter.setValue(0);
    Animated.timing(enter, {
      toValue: 1,
      duration: 480,
      useNativeDriver: true,
    }).start();
  }, [enter]);

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          opacity: enter,
          transform: [
            { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
            { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) },
          ],
        },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${reveal.headline}: ${reveal.answer}`}
    >
      <PremiumRevealCard
        reveal={{
          headline: reveal.headline,
          answer: reveal.answer,
          confidence: reveal.confidence,
          evidence: reveal.evidence,
          fromLabel: labels.fromJournals,
          recommendation: reveal.recommendation,
        }}
        explanationExpanded={explanationExpanded}
        evidenceLabel={labels.evidence}
        confidenceLabel={labels.confidence}
        recommendationLabel={labels.recommendation}
        actions={
          <>
            <PremiumButton
              variant="primary"
              label={labels.exploreWhy}
              icon={explanationExpanded ? 'chevron-up' : 'search-outline'}
              onPress={onExploreWhy}
              style={styles.actionBtn}
            />
            <PremiumButton
              variant="secondary"
              label={labels.askFollowUp}
              icon="chatbubble-ellipses-outline"
              onPress={onAskFollowUp}
              style={styles.actionBtn}
            />
          </>
        }
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginBottom: PREMIUM.space[2],
  },
  actionBtn: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

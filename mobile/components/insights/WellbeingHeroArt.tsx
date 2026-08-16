import React from 'react';
import { View, StyleSheet, ImageStyle } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { WELLBEING_HERO_ART } from '../../constants/wellbeingAssets';
import type { WellbeingTier } from './WellbeingIllustrations';

const ART_SIZE = 110;

type Props = {
  tier: WellbeingTier;
  cardBg: string;
  isDark?: boolean;
};

/** Bottom-right illustration with diagonal fade on left + top edges. */
export default function WellbeingHeroArt({ tier, cardBg, isDark = false }: Props) {
  const source = WELLBEING_HERO_ART[tier];
  const fadeSoft = isDark ? 'rgba(16,16,22,0.92)' : cardBg;
  const fadeMid = isDark ? 'rgba(16,16,22,0.55)' : 'rgba(255,255,255,0.72)';
  const fadeClear = isDark ? 'rgba(16,16,22,0)' : 'rgba(255,255,255,0)';
  const edgeFade = isDark ? 'rgba(16,16,22,1)' : 'rgba(255,255,255,1)';
  const edgeFadeClear = isDark ? 'rgba(16,16,22,0)' : 'rgba(255,255,255,0)';
  const topFade = isDark ? 'rgba(16,16,22,0.9)' : 'rgba(255,255,255,0.9)';

  return (
    <View style={styles.wrap} pointerEvents="none">
      <MaskedView
        style={styles.maskHost}
        maskElement={
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.35)', 'black']}
            locations={[0.22, 0.55, 0.82]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        }
      >
        <Image
          source={source}
          style={styles.art as ImageStyle}
          contentFit="cover"
          contentPosition="bottom right"
          transition={200}
        />
      </MaskedView>

      <LinearGradient
        colors={[fadeSoft, fadeMid, fadeClear]}
        locations={[0, 0.38, 0.78]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <LinearGradient
        colors={[edgeFade, edgeFadeClear]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 1, y: 0.7 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <LinearGradient
        colors={[topFade, edgeFadeClear]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.topFade}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: ART_SIZE,
    height: ART_SIZE,
    zIndex: 0,
    overflow: 'hidden',
  },
  maskHost: {
    flex: 1,
  },
  art: {
    width: ART_SIZE,
    height: ART_SIZE,
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
  },
});

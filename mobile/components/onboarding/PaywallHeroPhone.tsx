import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import CachedImage from '../shared/CachedImage';
import { ZENO_MAIN_PHONE_FULL } from '../../constants/phoneMockups';
import { isTablet } from '../../utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHONE_ASPECT = 1350 / 2922;
const PHONE_WIDTH = isTablet ? SCREEN_WIDTH * 0.56 : SCREEN_WIDTH * 0.78;
const PHONE_FULL_HEIGHT = PHONE_WIDTH / PHONE_ASPECT;
const PHONE_VISIBLE_HEIGHT = PHONE_FULL_HEIGHT * 0.58;

/** Single static paywall hero — full Insight phone, no white backing box. */
export default function PaywallHeroPhone() {
  return (
    <View style={styles.wrap}>
      <CachedImage
        source={ZENO_MAIN_PHONE_FULL}
        style={styles.image}
        contentFit="contain"
        recyclingKey="paywall-hero-phone"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginTop: isTablet ? 0 : -4,
    marginBottom: isTablet ? 4 : 0,
    height: PHONE_VISIBLE_HEIGHT,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  image: {
    width: PHONE_WIDTH,
    height: PHONE_FULL_HEIGHT,
    backgroundColor: 'transparent',
  },
});

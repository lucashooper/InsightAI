import React from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { INSIGHT_LOGO } from '../../constants/appAssets';

type Props = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/** The 3D cloud mark — used as the in-app companion peek and intro hero. */
export default function BrandCloud({ size = 120, style }: Props) {
  return (
    <View style={[{ width: size, height: size }, style]} pointerEvents="none">
      <Image source={INSIGHT_LOGO} style={styles.image} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});

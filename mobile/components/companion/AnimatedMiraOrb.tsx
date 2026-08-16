import React, { useEffect } from 'react';

import { View, StyleSheet } from 'react-native';

import Animated, {

  useSharedValue,

  useAnimatedStyle,

  withRepeat,

  withTiming,

  Easing,

  cancelAnimation,

} from 'react-native-reanimated';

import CachedImage from '../shared/CachedImage';

import OrbView from './OrbView';

import { MIRA_ORB } from '../../constants/appAssets';

import type { AiPersonality } from '../../utils/aiPersonalities';



type Props = {

  size?: number;

  source?: number;

  showGlow?: boolean;

  glowIntensity?: number;

  personality?: AiPersonality;

  isRoast?: boolean;

};



const orbMotion = {

  rotationDeg: Math.random() * 360,

};



export default function AnimatedMiraOrb({

  size = 118,

  source = MIRA_ORB,

  personality,

  isRoast = false,

}: Props) {

  const scale = useSharedValue(1);

  const useShaderOrb = Boolean(personality) || isRoast;



  useEffect(() => {

    scale.value = withRepeat(

      withTiming(1.04, {

        duration: 3500,

        easing: Easing.inOut(Easing.ease),

      }),

      -1,

      true,

    );



    return () => {

      cancelAnimation(scale);

    };

  }, [scale]);



  const animatedStyle = useAnimatedStyle(() => ({

    transform: [{ scale: scale.value }],

  }));



  if (useShaderOrb) {

    const orbPersonality = isRoast ? 'roast' : personality!;

    return (

      <View style={[styles.container, { width: size, height: size }]}>

        <Animated.View style={[styles.orbWrap, animatedStyle]}>

          <OrbView size={size} personality={orbPersonality} isRoast={isRoast} />

        </Animated.View>

      </View>

    );

  }



  return (

    <View style={[styles.container, { width: size, height: size }]}>

      <Animated.View style={[styles.orbWrap, animatedStyle]}>

        <CachedImage

          source={source}

          style={[styles.orbImage, { width: size, height: size }]}

          contentFit="contain"

          recyclingKey="mira-orb"

        />

      </Animated.View>

    </View>

  );

}



const styles = StyleSheet.create({

  container: {

    justifyContent: 'center',

    alignItems: 'center',

    overflow: 'visible',

    backgroundColor: 'transparent',

  },

  orbWrap: {

    justifyContent: 'center',

    alignItems: 'center',

    backgroundColor: 'transparent',

  },

  orbImage: {

    width: '100%',

    height: '100%',

  },

});



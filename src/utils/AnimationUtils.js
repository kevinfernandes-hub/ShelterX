import { Animated, Easing } from 'react-native';

/**
 * Animation Utilities for smooth, premium UI experiences
 */

/**
 * Create a smooth scale animation
 */
export const createScaleAnimation = (toValue = 1, duration = 300) => {
  const scaleAnim = new Animated.Value(toValue === 1 ? 0.95 : 1);
  return {
    anim: scaleAnim,
    animate: () => {
      Animated.timing(scaleAnim, {
        toValue,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
    reset: () => {
      scaleAnim.setValue(toValue === 1 ? 0.95 : 1);
    },
  };
};

/**
 * Create a smooth fade animation
 */
export const createFadeAnimation = (fromValue = 0, toValue = 1, duration = 300) => {
  const fadeAnim = new Animated.Value(fromValue);
  return {
    anim: fadeAnim,
    animate: () => {
      Animated.timing(fadeAnim, {
        toValue,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    },
    reset: () => {
      fadeAnim.setValue(fromValue);
    },
  };
};

/**
 * Create a slide-in animation from top
 */
export const createSlideAnimation = (fromOffsetY = -50, toOffsetY = 0, duration = 400) => {
  const slideAnim = new Animated.Value(fromOffsetY);
  return {
    anim: slideAnim,
    animate: () => {
      Animated.timing(slideAnim, {
        toValue: toOffsetY,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
    reset: () => {
      slideAnim.setValue(fromOffsetY);
    },
  };
};

/**
 * Create a glow pulse animation (scale loop)
 */
export const createGlowAnimation = (minScale = 1, maxScale = 1.05, duration = 2000) => {
  const glowAnim = new Animated.Value(minScale);
  
  const pulse = () => {
    Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: maxScale,
        duration: duration / 2,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: minScale,
        duration: duration / 2,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => pulse());
  };

  return {
    anim: glowAnim,
    start: pulse,
    stop: () => {
      glowAnim.stopAnimation();
      glowAnim.setValue(minScale);
    },
  };
};

/**
 * Create rotation animation
 */
export const createRotationAnimation = (duration = 2000) => {
  const rotateAnim = new Animated.Value(0);
  
  const startRotation = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  return {
    anim: rotateAnim,
    start: startRotation,
    interpolation: rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    }),
  };
};

/**
 * Create elastic bounce animation
 */
export const createBounceAnimation = (duration = 500) => {
  const bounceAnim = new Animated.Value(0);
  
  const bounce = () => {
    Animated.timing(bounceAnim, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.elastic(1)),
      useNativeDriver: true,
    }).start();
  };

  return {
    anim: bounceAnim,
    bounce,
    reset: () => bounceAnim.setValue(0),
  };
};

/**
 * Create color transition animation
 */
export const createColorAnimation = (color1, color2, duration = 1000) => {
  const colorAnim = new Animated.Value(0);
  
  const animate = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnim, {
          toValue: 1,
          duration,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnim, {
          toValue: 0,
          duration,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  return {
    anim: colorAnim,
    animate,
    color: colorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [color1, color2],
    }),
  };
};

export default {
  createScaleAnimation,
  createFadeAnimation,
  createSlideAnimation,
  createGlowAnimation,
  createRotationAnimation,
  createBounceAnimation,
  createColorAnimation,
};

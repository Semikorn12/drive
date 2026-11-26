import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

/** Small status light; pulses softly while active. */
export function StatusDot({ color, pulse }: { color: string; pulse?: boolean }) {
  const reduced = useReducedMotion();
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = pulse && !reduced ? withRepeat(withTiming(1, { duration: 1400 }), -1, false) : 0;
  }, [pulse, reduced, v]);
  const ring = useAnimatedStyle(() => ({ opacity: 0.5 * (1 - v.value), transform: [{ scale: 1 + v.value * 1.6 }] }));
  return (
    <View style={styles.wrap}>
      {pulse ? <Animated.View style={[styles.ring, { backgroundColor: color }, ring]} /> : null}
      <View style={[styles.dot, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 10, height: 10, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 10, height: 10, borderRadius: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});

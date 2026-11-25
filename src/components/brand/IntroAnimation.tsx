import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import { brand } from '../../theme/tokens';
import { HEADER_LOGO_TOP, HEADER_LOGO_WIDTH, INTRO_TIMING as T } from './brandLayout';
import {
  iGlyph,
  LETTER_TRANSFORM,
  LOGO_ASPECT,
  LOGO_VIEWBOX,
  letterPaths,
  STROKE,
  SWOOSH_LENGTH,
  SWOOSH_STROKE,
  swooshPath,
} from './logoGeometry';

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const easeOut = Easing.out(Easing.cubic);
const easeInOut = Easing.inOut(Easing.cubic);

interface Props {
  /** Called once the overlay is fully gone. Unmount the component then. */
  onFinish: () => void;
  /** Called on first layout – hide the native splash screen here for a seamless hand-over. */
  onReady?: () => void;
}

/**
 * Cold-start logo animation: "Drive" → "Dr!ve", swoosh, then the logo shrinks into the header.
 * Runs entirely on the UI thread (Reanimated), so JS can load data in parallel.
 */
export function IntroAnimation({ onFinish, onReady }: Props) {
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();

  const logoW = Math.min(screenW * 0.72, 300);
  const logoH = logoW * LOGO_ASPECT;
  const targetScale = HEADER_LOGO_WIDTH / logoW;
  const targetDy = insets.top + HEADER_LOGO_TOP + (HEADER_LOGO_WIDTH * LOGO_ASPECT) / 2 - screenH / 2;

  const start = reducedMotion ? 1 : 0;
  const letters = [
    useSharedValue(start),
    useSharedValue(start),
    useSharedValue(start),
    useSharedValue(start),
    useSharedValue(start),
  ];
  const morph = useSharedValue(start); // 0 = "i", 1 = "!"
  const dotY = useSharedValue<number>(reducedMotion ? iGlyph.dotYBang : iGlyph.dotYI);
  const swooshDraw = useSharedValue(0);
  const swooshOpacity = useSharedValue(1);
  const exit = useSharedValue(0); // 0 = centered, 1 = in header
  const logoOpacity = useSharedValue(reducedMotion ? 0 : 1);
  const overlayOpacity = useSharedValue(1);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const started = useRef(false);
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onFinish();
  }, [onFinish]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const after = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));

  const play = () => {
    if (started.current) return;
    started.current = true;

    if (reducedMotion) {
      // No movement: final logo just fades in, then the overlay fades out.
      logoOpacity.value = withTiming(1, { duration: T.reducedFadeIn });
      overlayOpacity.value = withDelay(
        T.reducedFadeIn + T.reducedHold,
        withTiming(0, { duration: T.reducedFadeOut }),
      );
      after(T.reducedFadeIn + T.reducedHold + T.reducedFadeOut + 20, finish);
      return;
    }

    letters.forEach((v, i) => {
      v.value = withDelay(i * T.letterStagger, withTiming(1, { duration: T.letterDuration, easing: easeOut }));
    });
    morph.value = withDelay(T.morphStart, withTiming(1, { duration: T.morphDuration, easing: easeInOut }));
    // Spring "duration" is perceptual; actual ≈ 1.5×.
    dotY.value = withDelay(T.morphStart, withSpring(iGlyph.dotYBang, { duration: 260, dampingRatio: 0.55 }));
    swooshDraw.value = withDelay(T.snap, withTiming(1, { duration: T.swooshDuration, easing: easeOut }));
    swooshOpacity.value = withDelay(T.snap + T.swooshDuration, withTiming(0, { duration: T.swooshFade }));
    exit.value = withDelay(T.exitStart, withTiming(1, { duration: T.exitDuration, easing: easeInOut }));
    overlayOpacity.value = withDelay(T.overlayFadeStart, withTiming(0, { duration: T.overlayFadeDuration }));

    after(T.snap, () => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}));
    after(T.total, finish);
  };

  const skip = () => {
    if (finished.current) return;
    clearTimers();
    const all = [...letters, morph, dotY, swooshDraw, swooshOpacity, exit, overlayOpacity, logoOpacity];
    all.forEach(cancelAnimation);
    letters.forEach((v) => (v.value = 1));
    morph.value = 1;
    dotY.value = iGlyph.dotYBang;
    swooshOpacity.value = 0;
    logoOpacity.value = 1;
    if (!reducedMotion) exit.value = withTiming(1, { duration: T.skipDuration, easing: easeInOut });
    overlayOpacity.value = withTiming(0, { duration: T.skipDuration });
    after(T.skipDuration + 20, finish);
  };

  useEffect(() => clearTimers, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { translateY: interpolate(exit.value, [0, 1], [0, targetDy]) },
      { scale: interpolate(exit.value, [0, 1], [1, targetScale]) },
    ],
  }));
  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const swooshStyle = useAnimatedStyle(() => ({ opacity: swooshOpacity.value }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, overlayStyle]} pointerEvents="box-only">
      <Pressable
        style={styles.center}
        onPress={skip}
        accessibilityRole="button"
        accessibilityLabel="Dr!ve"
        accessibilityHint="Skip"
        onLayout={() => {
          onReady?.();
          play();
        }}
      >
        <Animated.View style={[{ width: logoW, height: logoH }, containerStyle]}>
          {(['D', 'r'] as const).map((k, i) => (
            <LetterLayer key={k} progress={letters[i]} d={letterPaths[k]} w={logoW} h={logoH} />
          ))}
          <IGlyphLayer progress={letters[2]} morph={morph} dotY={dotY} w={logoW} h={logoH} />
          {(['v', 'e'] as const).map((k, i) => (
            <LetterLayer key={k} progress={letters[i + 3]} d={letterPaths[k]} w={logoW} h={logoH} />
          ))}
          <Animated.View style={[StyleSheet.absoluteFill, swooshStyle]}>
            <Swoosh draw={swooshDraw} w={logoW} h={logoH} />
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

/** Fade + slide-up wrapper shared by all letters. */
function useLetterStyle(progress: SharedValue<number>) {
  return useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [10, 0]) }],
  }));
}

function LetterLayer({ progress, d, w, h }: { progress: SharedValue<number>; d: string; w: number; h: number }) {
  const style = useLetterStyle(progress);
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <Svg width={w} height={h} viewBox={LOGO_VIEWBOX}>
        <G transform={LETTER_TRANSFORM}>
          <Path d={d} stroke={brand.wordmark} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </G>
      </Svg>
    </Animated.View>
  );
}

function IGlyphLayer({
  progress,
  morph,
  dotY,
  w,
  h,
}: {
  progress: SharedValue<number>;
  morph: SharedValue<number>;
  dotY: SharedValue<number>;
  w: number;
  h: number;
}) {
  const style = useLetterStyle(progress);
  const stemProps = useAnimatedProps(() => ({
    y1: interpolate(morph.value, [0, 1], [iGlyph.stemTopI, iGlyph.stemTopBang]),
    y2: interpolate(morph.value, [0, 1], [iGlyph.stemBottomI, iGlyph.stemBottomBang]),
  }));
  // Colour change white → orange as a cross-fade of two dots (robust on all platforms).
  const whiteDot = useAnimatedProps(() => ({ cy: dotY.value, opacity: 1 - morph.value }));
  const orangeDot = useAnimatedProps(() => ({ cy: dotY.value, opacity: morph.value }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <Svg width={w} height={h} viewBox={LOGO_VIEWBOX}>
        <G transform={LETTER_TRANSFORM}>
          <AnimatedLine
            x1={iGlyph.x}
            x2={iGlyph.x}
            stroke={brand.wordmark}
            strokeWidth={STROKE}
            strokeLinecap="round"
            animatedProps={stemProps}
          />
          <AnimatedCircle cx={iGlyph.x} r={iGlyph.dotRadius} fill={brand.wordmark} animatedProps={whiteDot} />
          <AnimatedCircle cx={iGlyph.x} r={iGlyph.dotRadius} fill={brand.exclamation} animatedProps={orangeDot} />
        </G>
      </Svg>
    </Animated.View>
  );
}

function Swoosh({ draw, w, h }: { draw: SharedValue<number>; w: number; h: number }) {
  const props = useAnimatedProps(() => ({ strokeDashoffset: SWOOSH_LENGTH * (1 - draw.value) }));
  return (
    <Svg width={w} height={h} viewBox={LOGO_VIEWBOX}>
      <Defs>
        <LinearGradient id="introSwoosh" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={brand.curveFrom} />
          <Stop offset="1" stopColor={brand.curveTo} />
        </LinearGradient>
      </Defs>
      <AnimatedPath
        d={swooshPath}
        stroke="url(#introSwoosh)"
        strokeWidth={SWOOSH_STROKE}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${SWOOSH_LENGTH} ${SWOOSH_LENGTH}`}
        animatedProps={props}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  overlay: { backgroundColor: brand.splashBackground, zIndex: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});


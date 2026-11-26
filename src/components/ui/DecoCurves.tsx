import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { useTheme } from '../../theme';

interface Props {
  /** Unique id per instance (SVG gradient ids must not collide). */
  id: string;
  variant?: 'header' | 'card';
}

/** Subtle sweeping purple lines in the background of headers and cards. */
export function DecoCurves({ id, variant = 'card' }: Props) {
  const { colors } = useTheme();
  const paths =
    variant === 'header'
      ? ['M-20 90 C80 20 200 140 420 30', 'M-20 120 C120 60 220 160 420 70']
      : ['M-20 40 C90 10 200 60 420 14', 'M-20 56 C140 30 240 66 420 40'];
  const box = variant === 'header' ? StyleSheet.absoluteFill : styles.cardBand;
  return (
    <View style={box} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox={variant === 'header' ? '0 0 400 160' : '0 0 400 64'} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={`deco-${id}`} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors.decoFrom} />
            <Stop offset="1" stopColor={colors.decoTo} />
          </LinearGradient>
        </Defs>
        {paths.map((d, i) => (
          <Path
            key={d}
            d={d}
            stroke={`url(#deco-${id})`}
            strokeWidth={i === 0 ? 2.5 : 1.5}
            strokeOpacity={colors.decoOpacity * (i === 0 ? 1 : 0.6)}
            fill="none"
          />
        ))}
      </Svg>
    </View>
  );
}

/** Cards: curves stay in a low band at the bottom edge so they never run through text. */
const styles = StyleSheet.create({ cardBand: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 44 } });

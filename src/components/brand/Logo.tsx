import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import { brand } from '../../theme/tokens';
import { iGlyph, LETTER_TRANSFORM, LOGO_ASPECT, LOGO_VIEWBOX, letterPaths, STROKE } from './logoGeometry';

interface Props {
  width: number;
  /** Colour of the letters (white on dark, navy on light backgrounds). */
  color?: string;
}

/** Static, final "Dr!ve" wordmark. */
export function Logo({ width, color = brand.wordmark }: Props) {
  return (
    <Svg
      width={width}
      height={width * LOGO_ASPECT}
      viewBox={LOGO_VIEWBOX}
      accessibilityRole="image"
      accessibilityLabel="Dr!ve"
    >
      <G transform={LETTER_TRANSFORM} stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {Object.values(letterPaths).map((d) => (
          <Path key={d} d={d} />
        ))}
        <Line x1={iGlyph.x} x2={iGlyph.x} y1={iGlyph.stemTopBang} y2={iGlyph.stemBottomBang} />
        <Circle cx={iGlyph.x} cy={iGlyph.dotYBang} r={iGlyph.dotRadius} fill={brand.exclamation} stroke="none" />
      </G>
    </Svg>
  );
}

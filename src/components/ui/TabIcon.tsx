import type { ColorValue } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

export type TabIconName = 'week' | 'trips' | 'compare' | 'achievements' | 'settings';

/** Simple stroke icons (own SVGs, no icon-font dependency). */
export function TabIcon({ name, color, size = 24 }: { name: TabIconName; color: ColorValue; size?: number }) {
  const common = { stroke: color, strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'week' && (
        <>
          {/* mini gauge */}
          <Path d="M4 16 A8 8 0 1 1 20 16" {...common} />
          <Path d="M12 15 L16 9" {...common} />
          <Circle cx={12} cy={15} r={1.5} fill={color} />
        </>
      )}
      {name === 'trips' && (
        <>
          <Path d="M6 20 C6 14 18 14 18 8" {...common} />
          <Circle cx={6} cy={20} r={2} {...common} />
          <Circle cx={18} cy={6} r={2} {...common} />
        </>
      )}
      {name === 'compare' && (
        <>
          <Path d="M5 20 V13 M12 20 V6 M19 20 V10" {...common} />
        </>
      )}
      {name === 'achievements' && (
        <>
          <Circle cx={12} cy={9} r={5} {...common} />
          <Path d="M9 13.5 L7.5 21 L12 18.5 L16.5 21 L15 13.5" {...common} />
        </>
      )}
      {name === 'settings' && (
        <>
          <Path d="M4 7 H20 M4 12 H20 M4 17 H20" {...common} />
          <Circle cx={9} cy={7} r={2} fill={color} />
          <Circle cx={15} cy={12} r={2} fill={color} />
          <Circle cx={7} cy={17} r={2} fill={color} />
        </>
      )}
    </Svg>
  );
}

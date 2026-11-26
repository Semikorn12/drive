import type { ColorValue } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName = 'lock' | 'info' | 'check' | 'chevron' | 'route' | 'trophy' | 'users' | 'pin' | 'play' | 'stop';

/** Minimal stroke icon set (24×24 grid, 1.8 stroke) – one consistent style across the app. */
export function Icon({ name, size = 20, color }: { name: IconName; size?: number; color: ColorValue }) {
  const s = { stroke: color, strokeWidth: 1.8, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'lock' && (
        <>
          <Rect x={5} y={10.5} width={14} height={10} rx={2.5} {...s} />
          <Path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" {...s} />
        </>
      )}
      {name === 'info' && (
        <>
          <Circle cx={12} cy={12} r={9} {...s} />
          <Path d="M12 11v5.5M12 7.6v.2" {...s} />
        </>
      )}
      {name === 'check' && <Path d="M5 12.5l4.5 4.5L19 7.5" {...s} strokeWidth={2.2} />}
      {name === 'chevron' && <Path d="M9.5 6l6 6-6 6" {...s} />}
      {name === 'route' && (
        <>
          <Circle cx={6} cy={18} r={2.2} {...s} />
          <Circle cx={18} cy={6} r={2.2} {...s} />
          <Path d="M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8" {...s} />
        </>
      )}
      {name === 'trophy' && (
        <>
          <Path d="M8 4h8v5a4 4 0 0 1-8 0V4zM12 13v4M8.5 20h7M8 6H5a3 3 0 0 0 3 3.5M16 6h3a3 3 0 0 1-3 3.5" {...s} />
        </>
      )}
      {name === 'users' && (
        <>
          <Circle cx={9} cy={8.5} r={3.2} {...s} />
          <Path d="M3.5 19.5a5.5 5.5 0 0 1 11 0M15.5 5.6a3.2 3.2 0 0 1 0 5.8M17.5 14.5a5.5 5.5 0 0 1 3 5" {...s} />
        </>
      )}
      {name === 'pin' && (
        <>
          <Path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z" {...s} />
          <Circle cx={12} cy={10} r={2.3} {...s} />
        </>
      )}
      {name === 'play' && <Path d="M8 5.5v13l10.5-6.5L8 5.5z" {...s} fill={color} />}
      {name === 'stop' && <Rect x={6.5} y={6.5} width={11} height={11} rx={2} {...s} fill={color} />}
    </Svg>
  );
}

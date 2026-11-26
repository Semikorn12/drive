import { useMemo, useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import type { LocationSample } from '../../domain/detection/types';
import { projectRoute, toSvgPath } from '../../domain/route/route';
import { useTheme } from '../../theme';

const HEIGHT = 220;
const GRID = 6;

/**
 * Route sketch drawn from the trip's own GPS points (no map tiles → works offline,
 * in the browser and needs no API key; the route never leaves the device).
 * North is up. Green dot = start, orange dot = finish.
 */
export function RouteMap({ points }: { points: LocationSample[] }) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const route = useMemo(() => (width > 0 ? projectRoute(points, width, HEIGHT, 24) : null), [points, width]);
  const path = route ? toSvgPath(route.points) : '';

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ height: HEIGHT, borderRadius: theme.radius.md, overflow: 'hidden', backgroundColor: theme.colors.surfaceElevated }}
    >
      {route && width > 0 ? (
        <Svg width={width} height={HEIGHT}>
          <Defs>
            <LinearGradient id="route" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={theme.colors.decoFrom} />
              <Stop offset="1" stopColor={theme.colors.accent} />
            </LinearGradient>
          </Defs>
          {Array.from({ length: GRID - 1 }, (_, i) => (
            <Line
              key={`h${i}`}
              x1={0}
              x2={width}
              y1={((i + 1) * HEIGHT) / GRID}
              y2={((i + 1) * HEIGHT) / GRID}
              stroke={theme.colors.border}
              strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: Math.ceil(width / (HEIGHT / GRID)) }, (_, i) => (
            <Line
              key={`v${i}`}
              y1={0}
              y2={HEIGHT}
              x1={((i + 1) * HEIGHT) / GRID}
              x2={((i + 1) * HEIGHT) / GRID}
              stroke={theme.colors.border}
              strokeWidth={0.5}
            />
          ))}
          {/* Soft glow under the line */}
          <Path d={path} stroke={theme.colors.accent} strokeOpacity={0.25} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Path d={path} stroke="url(#route)" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {route.start ? (
            <Circle cx={route.start.x} cy={route.start.y} r={7} fill={theme.colors.positive} stroke={theme.colors.surface} strokeWidth={3} />
          ) : null}
          {route.end && route.points.length > 1 ? (
            <Circle cx={route.end.x} cy={route.end.y} r={7} fill={theme.colors.accent} stroke={theme.colors.surface} strokeWidth={3} />
          ) : null}
        </Svg>
      ) : null}
    </View>
  );
}

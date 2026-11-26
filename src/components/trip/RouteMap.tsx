import { useMemo, useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import type { LocationSample } from '../../domain/detection/types';
import { projectRoute, toSvgPath } from '../../domain/route/route';
import { useTheme } from '../../theme';

const HEIGHT = 240;
const GRID = 6;

/**
 * Route sketch drawn from the trip's own GPS points (no map tiles → works offline,
 * in the browser and needs no API key; the route never leaves the device).
 * North is up. Hollow dot = start, orange dot = finish.
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
          {Array.from({ length: GRID - 1 }, (_, i) => (
            <Line
              key={`h${i}`}
              x1={0}
              x2={width}
              y1={((i + 1) * HEIGHT) / GRID}
              y2={((i + 1) * HEIGHT) / GRID}
              stroke={theme.colors.border}
              strokeWidth={0.5}
              strokeOpacity={0.6}
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
              strokeOpacity={0.6}
            />
          ))}
          <Path d={path} stroke={theme.colors.accent} strokeOpacity={0.18} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Path d={path} stroke={theme.colors.accent} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {route.start ? (
            <Circle cx={route.start.x} cy={route.start.y} r={6} fill={theme.colors.surfaceElevated} stroke={theme.colors.text} strokeWidth={2.5} />
          ) : null}
          {route.end && route.points.length > 1 ? (
            <Circle cx={route.end.x} cy={route.end.y} r={6.5} fill={theme.colors.accent} stroke={theme.colors.surfaceElevated} strokeWidth={2.5} />
          ) : null}
        </Svg>
      ) : null}
    </View>
  );
}

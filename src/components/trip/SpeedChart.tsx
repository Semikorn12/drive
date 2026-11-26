import { useMemo, useState } from 'react';
import { Platform, View } from 'react-native';
import Svg, { Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

import { kmToMiles } from '../../domain/detection/geo';
import type { LocationSample } from '../../domain/detection/types';
import { cleanRoute, speedSeries } from '../../domain/route/route';
import type { SpeedUnit } from '../../state/settingsStore';
import { useTheme } from '../../theme';

/** SVG text uses a serif default in browsers. */
const SVG_FONT = Platform.OS === 'web' ? 'system-ui, -apple-system, Segoe UI, sans-serif' : undefined;
const HEIGHT = 160;
const PAD = { top: 12, right: 8, bottom: 22, left: 34 };

/** Round the axis maximum up to a friendly step (20, 40, 60 …). */
function niceMax(v: number): number {
  const step = v > 100 ? 40 : 20;
  return Math.max(step, Math.ceil(v / step) * step);
}

/** Area chart: speed over the course of the trip. */
export function SpeedChart({ points, unit }: { points: LocationSample[]; unit: SpeedUnit }) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const { series, total } = useMemo(() => {
    const clean = cleanRoute(points);
    const s = speedSeries(clean, 80);
    const totalS = clean.length > 1 ? (clean[clean.length - 1].t - clean[0].t) / 1000 : 0;
    return { series: unit === 'mph' ? s.map((p) => ({ ...p, kmh: kmToMiles(p.kmh) })) : s, total: totalS };
  }, [points, unit]);

  const yMax = niceMax(Math.max(0, ...series.map((p) => p.kmh)));
  const innerW = Math.max(width - PAD.left - PAD.right, 1);
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (t: number) => PAD.left + (total > 0 ? (t / total) * innerW : 0);
  const y = (v: number) => PAD.top + innerH - (v / yMax) * innerH;

  const line = series.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.t).toFixed(1)} ${y(p.kmh).toFixed(1)}`).join(' ');
  const area = series.length
    ? `${line} L${x(series[series.length - 1].t).toFixed(1)} ${y(0)} L${x(series[0].t).toFixed(1)} ${y(0)} Z`
    : '';
  const ticks = [0, yMax / 2, yMax];
  const minutes = Math.round(total / 60);
  const unitLabel = unit === 'mph' ? 'mph' : 'km/h';

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height: HEIGHT }}>
      {width > 0 && series.length > 1 ? (
        <Svg width={width} height={HEIGHT}>
          <Defs>
            <LinearGradient id="speedFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={theme.colors.accent} stopOpacity={0.28} />
              <Stop offset="1" stopColor={theme.colors.accent} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {ticks.map((v) => (
            <Line key={v} x1={PAD.left} x2={width - PAD.right} y1={y(v)} y2={y(v)} stroke={theme.colors.border} strokeWidth={0.75} />
          ))}
          {ticks.map((v) => (
            <SvgText key={`l${v}`} x={PAD.left - 6} y={y(v) + 4} fontSize={11} fontFamily={SVG_FONT} fill={theme.colors.textMuted} textAnchor="end">
              {Math.round(v)}
            </SvgText>
          ))}
          <Path d={area} fill="url(#speedFill)" />
          <Path d={line} stroke={theme.colors.accent} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          <SvgText x={PAD.left} y={HEIGHT - 6} fontSize={11} fontFamily={SVG_FONT} fill={theme.colors.textMuted}>
            0 min
          </SvgText>
          <SvgText x={width - PAD.right} y={HEIGHT - 6} fontSize={11} fontFamily={SVG_FONT} fill={theme.colors.textMuted} textAnchor="end">
            {minutes} min
          </SvgText>
          <SvgText x={PAD.left + innerW / 2} y={HEIGHT - 6} fontSize={11} fontFamily={SVG_FONT} fill={theme.colors.textMuted} textAnchor="middle">
            {unitLabel}
          </SvgText>
        </Svg>
      ) : null}
    </View>
  );
}

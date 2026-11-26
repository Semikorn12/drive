import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { kmToMiles } from '../../domain/detection/geo';
import { useLive } from '../../services/tracking/liveStore';
import { useSettings } from '../../state/settingsStore';
import { useTheme } from '../../theme';
import { formatDistance, formatStopwatch } from '../../utils/format';
import { Label } from '../ui/Typography';

/** SVG text uses a serif default in browsers. */
const SVG_FONT = Platform.OS === 'web' ? 'system-ui, -apple-system, Segoe UI, sans-serif' : undefined;
const SIZE = 240;
const STROKE = 14;
const R = (SIZE - STROKE) / 2 - 8;
const C = SIZE / 2;
/** The dial spans 240°, open at the bottom. Angles in degrees, 0° = 12 o'clock, clockwise. */
const START = -120;
const SWEEP = 240;

function polar(angleDeg: number, r: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) };
}

function arc(from: number, to: number, r: number): string {
  const a = polar(from, r);
  const b = polar(to, r);
  const large = to - from > 180 ? 1 : 0;
  return `M${a.x.toFixed(2)} ${a.y.toFixed(2)} A${r} ${r} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

/** Dial maximum: 160 km/h (100 mph), grows in steps if you go faster. */
export function dialMax(speed: number, unit: 'kmh' | 'mph'): number {
  const base = unit === 'mph' ? 100 : 160;
  const step = unit === 'mph' ? 20 : 40;
  return speed <= base ? base : Math.ceil(speed / step) * step;
}

/** Re-render once per second while a trip runs (stopwatch). */
function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

/** Live speedometer shown while a trip is being recorded. */
export function LiveGauge() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const unit = useSettings((s) => s.speedUnit);
  const speedKmh = useLive((s) => s.speedKmh);
  const startedAt = useLive((s) => s.tripStartedAt);
  const dist = useLive((s) => s.tripDistanceM);
  const now = useNow(startedAt != null);

  const speed = speedKmh == null ? null : Math.max(0, unit === 'mph' ? kmToMiles(speedKmh) : speedKmh);
  const max = dialMax(speed ?? 0, unit);
  const frac = Math.min(1, (speed ?? 0) / max);
  const needle = START + frac * SWEEP;
  const tickStep = 20;
  const ticks = Array.from({ length: Math.floor(max / tickStep) + 1 }, (_, i) => i * tickStep);
  // Short pointer across the ring, so it never covers the big number in the middle.
  const tipOuter = polar(needle, R + STROKE / 2 + 4);
  const tipInner = polar(needle, R - STROKE / 2 - 10);
  const elapsedS = startedAt != null ? (now - startedAt) / 1000 : 0;

  return (
    <View style={styles.wrap} accessibilityRole="summary" accessibilityLabel={`${Math.round(speed ?? 0)} ${unit === 'mph' ? 'mph' : 'km/h'}`}>
      <View style={{ width: SIZE, height: SIZE * 0.86 }}>
        <Svg width={SIZE} height={SIZE}>
          <Path d={arc(START, START + SWEEP, R)} stroke={theme.colors.surfaceElevated} strokeWidth={STROKE} fill="none" strokeLinecap="round" />
          {frac > 0.005 ? (
            <Path d={arc(START, needle, R)} stroke={theme.colors.accent} strokeWidth={STROKE} fill="none" strokeLinecap="round" />
          ) : null}
          {ticks.map((v) => {
            const a = START + (v / max) * SWEEP;
            const major = v % (tickStep * 2) === 0;
            const p1 = polar(a, R - STROKE / 2 - 4);
            const p2 = polar(a, R - STROKE / 2 - (major ? 12 : 8));
            return (
              <Line key={`t${v}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={theme.colors.textMuted} strokeWidth={major ? 2 : 1} />
            );
          })}
          {ticks
            .filter((v) => v % (tickStep * 2) === 0)
            .map((v) => {
              const lp = polar(START + (v / max) * SWEEP, R - STROKE / 2 - 26);
              return (
                <SvgText key={`l${v}`} x={lp.x} y={lp.y + 4} fontSize={11} fontFamily={SVG_FONT} fill={theme.colors.textMuted} textAnchor="middle">
                  {v}
                </SvgText>
              );
            })}
          <Line x1={tipInner.x} y1={tipInner.y} x2={tipOuter.x} y2={tipOuter.y} stroke={theme.colors.text} strokeWidth={4} strokeLinecap="round" />
          <Circle cx={tipOuter.x} cy={tipOuter.y} r={4} fill={theme.colors.accent} />
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
          <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.gauge, fontWeight: '700', fontVariant: ['tabular-nums'], letterSpacing: -2, marginTop: 56 }}>
            {speed == null ? '–' : Math.round(speed)}
          </Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.small, fontWeight: '600', marginTop: -6 }}>
            {speed == null ? t('live.noSignal') : unit === 'mph' ? 'mph' : 'km/h'}
          </Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.cell}>
          <Label>{t('live.duration')}</Label>
          <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.title, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{formatStopwatch(elapsedS)}</Text>
        </View>
        <View style={styles.cell}>
          <Label>{t('live.distance')}</Label>
          <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.title, fontWeight: '700', fontVariant: ['tabular-nums'] }}>
            {formatDistance(dist, unit, i18n.language)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'space-around', marginTop: 4 },
  cell: { alignItems: 'center', gap: 2 },
});

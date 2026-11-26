import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { OptionRow } from '../components/ui/OptionRow';
import { Screen } from '../components/ui/Screen';
import { Body, Label } from '../components/ui/Typography';
import { clearLog, formatLog, readLog, type LogEntry } from '../data/logRepository';
import { tripRepository } from '../data/tripRepository';
import type { LocationSample } from '../domain/detection/types';
import { parseGpx } from '../domain/gpx/parseGpx';
import { generateTrack, SAMPLE_TRACKS, type SampleTrackId } from '../domain/gpx/sampleTracks';
import { toGpx } from '../domain/gpx/toGpx';
import type { RecorderOutcome } from '../domain/recording/tripRecorder';
import { readPermissions, type PermissionsSnapshot } from '../services/permissions';
import { playTrack, stopSimulation } from '../services/simulation/player';
import { batteryPercent } from '../services/tracking/battery';
import { useLive } from '../services/tracking/liveStore';
import { isGeofenceActive, isPreciseTrackingActive } from '../services/tracking/locationModes';
import { useSettings } from '../state/settingsStore';
import { useTheme } from '../theme';
import { formatDistance, formatSpeed, formatTime } from '../utils/format';

const SPEEDS = [1, 10, 30, 0] as const; // 0 = instant

/** Hidden page (Settings → tap the version 7×): detection status, simulation, log. */
export default function DiagnosticsScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const live = useLive();
  const unit = useSettings((s) => s.speedUnit);

  const [perms, setPerms] = useState<PermissionsSnapshot | null>(null);
  const [precise, setPrecise] = useState<boolean | null>(null);
  const [fence, setFence] = useState<boolean | null>(null);
  const [battery, setBattery] = useState<number | null>(null);
  const [tripCount, setTripCount] = useState<number | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [track, setTrack] = useState<SampleTrackId>('cityDrive');
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(30);
  const [result, setResult] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [p, pr, f, b, n, l] = await Promise.all([
      readPermissions(),
      isPreciseTrackingActive(),
      isGeofenceActive(),
      batteryPercent(),
      tripRepository.countTrips().catch(() => null),
      readLog(300).catch(() => []),
    ]);
    setPerms(p);
    setPrecise(pr);
    setFence(f);
    setBattery(b);
    setTripCount(n);
    setLog(l);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const describe = (outcomes: RecorderOutcome[]) => {
    const saved = outcomes.find((o) => o.type === 'saved');
    if (saved?.type === 'saved') return `${t('diagnostics.resultSaved')}: ${formatDistance(saved.trip.distanceM, unit, i18n.language)}`;
    const disc = outcomes.find((o) => o.type === 'discarded');
    if (disc?.type === 'discarded') return `${t('diagnostics.resultDiscarded')} (${disc.reason}, ${Math.round(disc.distanceM)} m)`;
    return t('diagnostics.resultNone');
  };

  const run = async (points: LocationSample[], name: string, motion?: 'automotive' | 'walking' | 'cycling') => {
    setResult(null);
    try {
      const outcomes = await playTrack(points, { name, speed, motion });
      setResult(describe(outcomes));
    } catch (e) {
      setResult(String((e as Error).message));
    }
    void refresh();
  };

  const playSample = () => {
    const def = SAMPLE_TRACKS.find((s) => s.id === track)!;
    // Round-trip through GPX so the import path is exercised too.
    const points = parseGpx(toGpx(generateTrack(def)));
    void run(points, def.id, def.motion);
  };

  const pickGpx = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.[0]) return;
    try {
      const xml = await new File(res.assets[0].uri).text();
      await run(parseGpx(xml), res.assets[0].name);
    } catch {
      setResult(t('diagnostics.gpxError'));
    }
  };

  const yesNo = (v: boolean | null) => (v == null ? '…' : v ? t('diagnostics.yes') : t('diagnostics.no'));

  return (
    <Screen title={t('diagnostics.title')}>
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/settings'))} accessibilityRole="button">
        <Text style={{ color: theme.colors.accent, fontWeight: '700' }}>‹ {t('common.back')}</Text>
      </Pressable>
      <Label>{t('diagnostics.status')}</Label>
      <Card>
        <Row k={t('diagnostics.phase')} v={t(`diagnostics.phases.${live.phase}`)} />
        <Row k={t('diagnostics.preciseActive')} v={yesNo(precise)} />
        <Row k={t('diagnostics.geofenceActive')} v={yesNo(fence)} />
        <Row k={t('diagnostics.lastFix')} v={live.lastFixAt ? formatTime(live.lastFixAt, i18n.language) : t('diagnostics.never')} />
        <Row k={t('diagnostics.accuracy')} v={live.lastAccuracyM != null ? `${Math.round(live.lastAccuracyM)} m` : '–'} />
        <Row k={t('diagnostics.speed')} v={formatSpeed(live.speedKmh, unit)} />
        <Row k={t('diagnostics.battery')} v={battery != null ? `${battery} %` : '–'} />
        <Row k={t('diagnostics.trips')} v={tripCount != null ? String(tripCount) : '–'} />
      </Card>

      <Label>{t('diagnostics.permissions')}</Label>
      <Card>
        <Row k={t('diagnostics.permLocationFg')} v={perms?.locationForeground ?? '…'} />
        <Row k={t('diagnostics.permLocationBg')} v={perms?.locationBackground ?? '…'} />
        <Row k={t('diagnostics.permPrecise')} v={perms ? yesNo(perms.preciseLocation) : '…'} />
        <Row k={t('diagnostics.permMotion')} v={perms?.motion ?? '…'} />
        <Row k={t('diagnostics.permNotifications')} v={perms?.notifications ?? '…'} />
      </Card>

      <Label>{t('diagnostics.simulation')}</Label>
      <Body muted>{t('diagnostics.simulationHint')}</Body>
      {SAMPLE_TRACKS.map((s) => (
        <OptionRow key={s.id} label={t(`diagnostics.samples.${s.id}`)} selected={track === s.id} onPress={() => setTrack(s.id)} />
      ))}
      <View style={styles.chips}>
        {SPEEDS.map((sp) => (
          <Pressable
            key={sp}
            onPress={() => setSpeed(sp)}
            style={[
              styles.chip,
              { borderColor: speed === sp ? theme.colors.accent : theme.colors.border, backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{sp === 0 ? t('diagnostics.instant') : `${sp}×`}</Text>
          </Pressable>
        ))}
      </View>
      {live.simulation.running ? (
        <Card>
          <Body>
            {live.simulation.trackName} · {Math.round(live.simulation.progress * 100)} % · {formatSpeed(live.speedKmh, unit)} ·{' '}
            {t(`diagnostics.phases.${live.phase}`)}
          </Body>
          <View style={{ marginTop: theme.spacing.md }}>
            <Button label={t('diagnostics.stop')} variant="ghost" onPress={stopSimulation} />
          </View>
        </Card>
      ) : (
        <>
          <Button label={t('diagnostics.play')} onPress={playSample} />
          <Button label={t('diagnostics.pickGpx')} variant="ghost" onPress={() => void pickGpx()} />
        </>
      )}
      {result ? (
        <Card>
          <Label>{t('diagnostics.result')}</Label>
          <Body style={{ marginTop: 4 }}>{result}</Body>
        </Card>
      ) : null}

      <Label>{t('diagnostics.log')}</Label>
      <View style={styles.chips}>
        <Button label={t('diagnostics.refresh')} variant="ghost" onPress={() => void refresh()} />
        <Button label={t('diagnostics.share')} variant="ghost" onPress={() => void Share.share({ message: formatLog(log) })} />
        <Button label={t('diagnostics.clear')} variant="ghost" onPress={() => void clearLog().then(refresh)} />
      </View>
      <Card>
        {log.length === 0 ? <Body muted>{t('diagnostics.empty')}</Body> : null}
        {log.map((e) => (
          <Text
            key={e.id}
            style={{
              color: e.level === 'error' ? theme.colors.negative : e.level === 'warn' ? theme.colors.accent : theme.colors.textMuted,
              fontFamily: 'Menlo',
              fontSize: 11,
              marginBottom: 4,
            }}
          >
            {formatTime(e.t, i18n.language)} {e.event} {e.data ?? ''}
          </Text>
        ))}
      </Card>
    </Screen>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.kv}>
      <Body muted>{k}</Body>
      <Body>{v}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  kv: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 2, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
});

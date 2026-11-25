import { computeTripStats, judgeTrip } from '../detection/tripStats';
import { DEFAULT_DETECTOR_CONFIG, type DetectorConfig, type DetectorEvent } from '../detection/types';
import type { Trip, TripSource } from '../trip';
import { DEFAULT_VEHICLE_TYPE } from '../vehicle';
import type { DetectionLogger, TripStore } from './tripStore';

export type RecorderOutcome =
  | { type: 'started'; tripId: string }
  | { type: 'saved'; trip: Trip }
  | { type: 'discarded'; tripId: string; reason: 'tooShort' | 'noPoints'; distanceM: number };

export interface RecorderContext {
  store: TripStore;
  logger: DetectionLogger;
  newId: () => string;
  /** Force a source (simulation). Otherwise auto/manual from the event. */
  sourceOverride?: TripSource;
  config?: DetectorConfig;
}

/**
 * Turns detector events into stored trips. Stateless apart from the current trip id,
 * which the caller persists (so it survives the app being killed between wake-ups).
 */
export async function applyEvents(
  ctx: RecorderContext,
  currentTripId: string | null,
  events: DetectorEvent[],
): Promise<{ tripId: string | null; outcomes: RecorderOutcome[] }> {
  const config = ctx.config ?? DEFAULT_DETECTOR_CONFIG;
  const outcomes: RecorderOutcome[] = [];
  let tripId = currentTripId;

  for (const ev of events) {
    switch (ev.type) {
      case 'candidateStarted':
        ctx.logger.log('detector.candidate', { at: ev.t });
        break;
      case 'candidateTimeout':
        ctx.logger.log('detector.candidateTimeout', { at: ev.t });
        break;
      case 'sampleRejected':
        // too chatty for the log – counted by the caller instead
        break;
      case 'tripStarted': {
        tripId = ctx.newId();
        const source: TripSource = ctx.sourceOverride ?? (ev.manual ? 'manual' : 'auto');
        await ctx.store.createTrip({ id: tripId, startedAt: ev.t, source, vehicleType: DEFAULT_VEHICLE_TYPE });
        if (ev.points.length) await ctx.store.appendPoints(tripId, ev.points);
        ctx.logger.log('trip.start', { tripId, source, at: ev.t, bufferedPoints: ev.points.length });
        outcomes.push({ type: 'started', tripId });
        break;
      }
      case 'tripPoints':
        if (tripId) await ctx.store.appendPoints(tripId, ev.points);
        break;
      case 'tripEnded': {
        if (!tripId) break;
        await ctx.store.deletePointsAfter(tripId, ev.endedAt);
        const points = await ctx.store.getPoints(tripId);
        const stats = computeTripStats(points, ev.endedAt, config);
        if (!stats || points.length < 2) {
          await ctx.store.deleteTrip(tripId);
          ctx.logger.log('trip.discard', { tripId, reason: 'noPoints' }, 'warn');
          outcomes.push({ type: 'discarded', tripId, reason: 'noPoints', distanceM: 0 });
        } else {
          const verdict = judgeTrip(stats, config);
          if (!verdict.keep) {
            await ctx.store.deleteTrip(tripId);
            ctx.logger.log('trip.discard', { tripId, reason: verdict.reason, distanceM: Math.round(stats.distanceM) });
            outcomes.push({ type: 'discarded', tripId, reason: verdict.reason, distanceM: stats.distanceM });
          } else {
            await ctx.store.finishTrip(tripId, stats, points[0], points[points.length - 1]);
            const trip = await ctx.store.getTrip(tripId);
            ctx.logger.log('trip.end', {
              tripId,
              reason: ev.reason,
              km: +(stats.distanceM / 1000).toFixed(2),
              min: Math.round(stats.durationS / 60),
              points: points.length,
            });
            if (trip) outcomes.push({ type: 'saved', trip });
          }
        }
        tripId = null;
        break;
      }
    }
  }
  return { tripId, outcomes };
}

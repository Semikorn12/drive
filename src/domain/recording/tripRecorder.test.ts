import { generateTrack, SAMPLE_TRACKS } from '../gpx/sampleTracks';
import { simulate } from '../simulation/simulate';
import { applyEvents } from './tripRecorder';
import { MemoryTripStore } from './tripStore';

function ctx() {
  let n = 0;
  const logs: string[] = [];
  const store = new MemoryTripStore();
  return { store, logs, ctx: { store, newId: () => `t${++n}`, logger: { log: (e: string) => logs.push(e) } } };
}

describe('trip recorder', () => {
  it('saves a completed city drive with stats and start/end position', async () => {
    const { store, ctx: c, logs } = ctx();
    const { events } = simulate(generateTrack(SAMPLE_TRACKS[0]), { motion: 'automotive' });
    const r = await applyEvents(c, null, events);
    expect(r.tripId).toBeNull();
    const saved = r.outcomes.find((o) => o.type === 'saved');
    expect(saved?.type).toBe('saved');
    const trip = [...store.trips.values()][0];
    expect(trip.status).toBe('completed');
    expect(trip.source).toBe('auto');
    expect(trip.vehicleType).toBe('car');
    expect(trip.distanceM).toBeGreaterThan(8000);
    expect(trip.startLat).not.toBeNull();
    expect(trip.category).toBeNull(); // logbook fields prepared, unused
    expect(logs).toContain('trip.start');
    expect(logs).toContain('trip.end');
  });

  it('discards trips under 500 m and deletes their points', async () => {
    const { store, ctx: c } = ctx();
    const { events } = simulate(generateTrack(SAMPLE_TRACKS[1]));
    const r = await applyEvents(c, null, events);
    expect(r.outcomes.some((o) => o.type === 'discarded' && o.reason === 'tooShort')).toBe(true);
    expect(store.trips.size).toBe(0);
    expect(store.points.size).toBe(0);
  });

  it('works across several wake-ups (events split into batches)', async () => {
    const { store, ctx: c } = ctx();
    const { events } = simulate(generateTrack(SAMPLE_TRACKS[0]), { motion: 'automotive' });
    let tripId: string | null = null;
    for (let i = 0; i < events.length; i += 37) {
      tripId = (await applyEvents(c, tripId, events.slice(i, i + 37))).tripId;
    }
    expect(store.trips.size).toBe(1);
    expect([...store.trips.values()][0].status).toBe('completed');
  });

  it('marks simulated trips as simulation', async () => {
    const { store, ctx: c } = ctx();
    const { events } = simulate(generateTrack(SAMPLE_TRACKS[0]), { motion: 'automotive' });
    await applyEvents({ ...c, sourceOverride: 'simulation' }, null, events);
    expect([...store.trips.values()][0].source).toBe('simulation');
  });
});

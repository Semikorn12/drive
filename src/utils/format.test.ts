import { formatDistance, formatDuration, formatSpeed } from './format';

describe('format', () => {
  it('distance in km and miles', () => {
    expect(formatDistance(12_345, 'kmh', 'en')).toBe('12.3 km');
    expect(formatDistance(16_093, 'mph', 'en')).toBe('10.0 mi');
    expect(formatDistance(250_000, 'kmh', 'en')).toBe('250 km');
  });
  it('speed', () => {
    expect(formatSpeed(100, 'kmh')).toBe('100 km/h');
    expect(formatSpeed(100, 'mph')).toBe('62 mph');
    expect(formatSpeed(null, 'kmh')).toBe('–');
  });
  it('duration', () => {
    expect(formatDuration(300)).toBe('5 min');
    expect(formatDuration(4500)).toBe('1:15 h');
  });
});

import de from './locales/de.json';
import en from './locales/en.json';

function keys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

describe('translations', () => {
  it('German and English have exactly the same keys', () => {
    expect(keys(en).sort()).toEqual(keys(de).sort());
  });

  it('no translation is empty', () => {
    const values = (o: object): string[] =>
      Object.values(o).flatMap((v) => (typeof v === 'object' ? values(v) : [v]));
    for (const v of [...values(de), ...values(en)]) expect(v.trim().length).toBeGreaterThan(0);
  });
});

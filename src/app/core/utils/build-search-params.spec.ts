import { buildSearchParams } from './build-search-params';

describe('buildSearchParams', () => {
  it('returns an empty URLSearchParams for an empty object', () => {
    expect(buildSearchParams({}).toString()).toBe('');
  });

  it('serializes string values', () => {
    const params = buildSearchParams({ idToken: 'abc', user: 'andres' });
    expect(params.get('idToken')).toBe('abc');
    expect(params.get('user')).toBe('andres');
  });

  it('coerces numbers and booleans to strings', () => {
    const params = buildSearchParams({ page: 2, active: true, disabled: false });
    expect(params.get('page')).toBe('2');
    expect(params.get('active')).toBe('true');
    expect(params.get('disabled')).toBe('false');
  });

  it('keeps the numeric zero value', () => {
    const params = buildSearchParams({ count: 0 });
    expect(params.get('count')).toBe('0');
  });

  it('omits null, undefined and empty-string values', () => {
    const params = buildSearchParams({
      a: null,
      b: undefined,
      c: '',
      d: 'keep',
    });
    expect(params.has('a')).toBe(false);
    expect(params.has('b')).toBe(false);
    expect(params.has('c')).toBe(false);
    expect(params.get('d')).toBe('keep');
  });

  it('produces a valid query string', () => {
    const params = buildSearchParams({ idToken: 'x y', empty: '', n: 1 });
    expect(params.toString()).toBe('idToken=x+y&n=1');
  });
});

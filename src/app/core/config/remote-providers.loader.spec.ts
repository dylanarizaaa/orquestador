import { loadRemoteModule } from '@angular-architects/native-federation';

import { remoteProvidersConfig } from './remote-providers.config';
import { loadAllRemoteProviders } from './remote-providers.loader';

jest.mock('@angular-architects/native-federation', () => ({
  loadRemoteModule: jest.fn(),
}));

// El loader lee `remoteProvidersConfig` por referencia, así que mockeamos el
// módulo con un objeto mutable y ajustamos sus propiedades en cada prueba.
jest.mock('./remote-providers.config', () => ({
  remoteProvidersConfig: { remotes: [], autoDetect: false },
}));

const loadRemoteModuleMock = loadRemoteModule as jest.MockedFunction<typeof loadRemoteModule>;

function mockManifest(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  global.fetch = jest.fn().mockResolvedValue(response) as unknown as typeof fetch;
}

describe('loadAllRemoteProviders', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    loadRemoteModuleMock.mockReset();
    remoteProvidersConfig.remotes = [];
    remoteProvidersConfig.autoDetect = false;
    jest.restoreAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('returns an empty array when there are no remotes and auto-detect is off', async () => {
    const result = await loadAllRemoteProviders();

    expect(result).toEqual([]);
    expect(loadRemoteModuleMock).not.toHaveBeenCalled();
  });

  it('loads providers exposed as PROVIDERS array', async () => {
    remoteProvidersConfig.remotes = ['factura-pendiente'];
    loadRemoteModuleMock.mockResolvedValue({ PROVIDERS: ['p1', 'p2'] });

    const result = await loadAllRemoteProviders();

    expect(loadRemoteModuleMock).toHaveBeenCalledWith('factura-pendiente', './Providers');
    expect(result).toEqual(['p1', 'p2']);
  });

  it('supports providers exposed as a factory function', async () => {
    remoteProvidersConfig.remotes = ['factura-pendiente'];
    loadRemoteModuleMock.mockResolvedValue({ providers: () => ['fromFn'] });

    const result = await loadAllRemoteProviders();

    expect(result).toEqual(['fromFn']);
  });

  it('supports providers exposed under appConfig.providers', async () => {
    remoteProvidersConfig.remotes = ['factura-pendiente'];
    loadRemoteModuleMock.mockResolvedValue({ appConfig: { providers: ['fromAppConfig'] } });

    const result = await loadAllRemoteProviders();

    expect(result).toEqual(['fromAppConfig']);
  });

  it('supports providers exposed as the default export', async () => {
    remoteProvidersConfig.remotes = ['factura-pendiente'];
    loadRemoteModuleMock.mockResolvedValue({ default: ['fromDefault'] });

    const result = await loadAllRemoteProviders();

    expect(result).toEqual(['fromDefault']);
  });

  it('returns an empty array when the remote exposes no providers', async () => {
    remoteProvidersConfig.remotes = ['factura-pendiente'];
    loadRemoteModuleMock.mockResolvedValue({});

    const result = await loadAllRemoteProviders();

    expect(result).toEqual([]);
  });

  it('warns and returns [] when a registered remote fails to load', async () => {
    remoteProvidersConfig.remotes = ['factura-pendiente'];
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    loadRemoteModuleMock.mockRejectedValue(new Error('boom'));

    const result = await loadAllRemoteProviders();

    expect(result).toEqual([]);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('factura-pendiente'),
      expect.any(Error)
    );
  });

  it('debug-logs (not warns) when an auto-detected remote exposes no providers', async () => {
    remoteProvidersConfig.autoDetect = true;
    mockManifest({ ok: true, json: () => Promise.resolve({ notas: 'url' }) });
    const debug = jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    loadRemoteModuleMock.mockRejectedValue(new Error('no providers'));

    const result = await loadAllRemoteProviders();

    expect(result).toEqual([]);
    expect(loadRemoteModuleMock).toHaveBeenCalledWith('notas', './Providers');
    expect(debug).toHaveBeenCalledWith(expect.stringContaining('notas'));
    expect(warn).not.toHaveBeenCalled();
  });

  it('merges registered and manifest remotes without duplicates', async () => {
    remoteProvidersConfig.remotes = ['factura-pendiente'];
    remoteProvidersConfig.autoDetect = true;
    mockManifest({
      ok: true,
      json: () => Promise.resolve({ 'factura-pendiente': 'url1', notas: 'url2' }),
    });
    loadRemoteModuleMock.mockResolvedValue({ PROVIDERS: ['x'] });

    const result = await loadAllRemoteProviders();

    const calledRemotes = loadRemoteModuleMock.mock.calls.map((c) => c[0]);
    expect(calledRemotes).toEqual(['factura-pendiente', 'notas']);
    expect(result).toEqual(['x', 'x']);
  });

  it('logs an error and skips manifest remotes when the manifest response is not ok', async () => {
    remoteProvidersConfig.autoDetect = true;
    mockManifest({ ok: false, status: 500, json: () => Promise.resolve({}) });
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const result = await loadAllRemoteProviders();

    expect(result).toEqual([]);
    expect(error).toHaveBeenCalled();
    expect(loadRemoteModuleMock).not.toHaveBeenCalled();
  });

  it('logs an error when fetching the manifest rejects', async () => {
    remoteProvidersConfig.autoDetect = true;
    global.fetch = jest.fn().mockRejectedValue(new Error('network')) as unknown as typeof fetch;
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const result = await loadAllRemoteProviders();

    expect(result).toEqual([]);
    expect(error).toHaveBeenCalled();
  });
});

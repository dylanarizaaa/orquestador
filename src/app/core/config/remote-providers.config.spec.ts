import { remoteProvidersConfig } from './remote-providers.config';

describe('remoteProvidersConfig', () => {
  it('exposes an explicit list of remotes and disables auto-detection by default', () => {
    expect(Array.isArray(remoteProvidersConfig.remotes)).toBe(true);
    expect(remoteProvidersConfig.remotes).toContain('factura-pendiente');
    expect(remoteProvidersConfig.autoDetect).toBe(false);
  });
});

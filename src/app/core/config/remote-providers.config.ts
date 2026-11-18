export interface RemoteProvidersConfig {
  /**
   * Explicit list of microfrontends from which to load providers.
   * Use this to control which microfrontends register providers at bootstrap,
   * avoiding unnecessary requests to microfrontends that do not expose any providers.
   */
  remotes: string[];

  /**
   * If set to true, the loader will fetch the federation manifest and attempt to
   * load providers from all registered microfrontends dynamically.
   * Defaults to false.
   */
  autoDetect: boolean;
}

export const remoteProvidersConfig: RemoteProvidersConfig = {
  remotes: [
    'factura-pendiente',
    // Add new microfrontends here as they grow:
    // 'notas',
  ],
  autoDetect: false
};

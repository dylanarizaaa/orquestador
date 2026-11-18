import { loadRemoteModule } from '@angular-architects/native-federation';
import { remoteProvidersConfig } from './remote-providers.config';

/**
 * Safely loads providers from a single remote microfrontend.
 * Catching any errors to prevent application boot failure.
 */
async function loadProvidersFromRemote(remoteName: string): Promise<any[]> {
  try {
    const m = await loadRemoteModule(remoteName, './Providers');
    const rawProviders = m.PROVIDERS || m.providers || m.appConfig?.providers || m.default;
    return typeof rawProviders === 'function' ? rawProviders() : (rawProviders || []);
  } catch (error) {
    // If the remote was explicitly registered, log a warning since it was expected to work.
    // Otherwise (e.g. during auto-detect), print a debug message as it's normal for some remotes not to expose providers.
    if (remoteProvidersConfig.remotes.includes(remoteName)) {
      console.warn(`[RemoteProvidersLoader] Failed to load providers for registered remote "${remoteName}".`, error);
    } else {
      console.debug?.(`[RemoteProvidersLoader] Remote "${remoteName}" does not expose './Providers'.`);
    }
    return [];
  }
}

/**
 * Fetches the federation manifest to discover all configured remotes.
 */
async function getRemotesFromManifest(): Promise<string[]> {
  try {
    const response = await fetch('federation.manifest.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const manifest = await response.json();
    return Object.keys(manifest);
  } catch (error) {
    console.error('[RemoteProvidersLoader] Failed to fetch federation.manifest.json for auto-detection.', error);
    return [];
  }
}

/**
 * Loads all remote providers based on the configuration registry or manifest auto-detection.
 */
export async function loadAllRemoteProviders(): Promise<any[]> {
  let remotesToLoad = [...remoteProvidersConfig.remotes];

  if (remoteProvidersConfig.autoDetect) {
    const manifestRemotes = await getRemotesFromManifest();
    // Merge lists and remove duplicates
    remotesToLoad = Array.from(new Set([...remotesToLoad, ...manifestRemotes]));
  }

  if (remotesToLoad.length === 0) {
    return [];
  }

  // Load all remote providers in parallel
  const providersPromises = remotesToLoad.map(remoteName => loadProvidersFromRemote(remoteName));
  const results = await Promise.all(providersPromises);

  // Flatten the array of arrays into a single providers array
  return results.flat();
}

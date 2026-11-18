import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { appConfig } from './app.config';
import { RemoteLoaderService, ResourceConfig } from './core/services/remote-loader.service';

// app.config -> app.routes pulls in the ESM-only native-federation package,
// which Jest does not transform; stub it so the module graph loads.
jest.mock('@angular-architects/native-federation', () => ({
  loadRemoteModule: jest.fn(),
}));

describe('appConfig', () => {
  it('exposes a non-empty providers array', () => {
    expect(Array.isArray(appConfig.providers)).toBe(true);
    expect(appConfig.providers.length).toBeGreaterThan(0);
  });
});

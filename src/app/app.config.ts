import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { dateProviderConfig } from './core/providers/date.provider';
import { authRefreshInterceptor } from './core/interceptors/auth-refresh.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch(), withInterceptors([authRefreshInterceptor])),
    ...dateProviderConfig
  ]
};

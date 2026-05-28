import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
<<<<<<< HEAD
import { adminAuthInterceptor } from './core/interceptors/admin-auth.interceptor';
=======
import { authInterceptor } from './core/interceptors/auth.interceptor';
>>>>>>> origin/nghi

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
<<<<<<< HEAD
    provideHttpClient(
      withFetch(),
      withInterceptors([adminAuthInterceptor])
    ),
=======
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
>>>>>>> origin/nghi
  ]
};

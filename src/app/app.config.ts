import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {provideHttpClient} from '@angular/common/http';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {getAuth, provideAuth} from '@angular/fire/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBs3BNYuTfa9yjC1yLtJkJPMH3DKA-4yBM",
  authDomain: "frogin-think.firebaseapp.com",
  projectId: "frogin-think",
  storageBucket: "frogin-think.firebasestorage.app",
  messagingSenderId: "24212204930",
  appId: "1:24212204930:web:ceec8d527e3df6849c339b"
};


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
  ]
};

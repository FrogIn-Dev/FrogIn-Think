import fs from 'node:fs';
import dotenv from 'dotenv';

dotenv.config({ path: process.env.ENV_FILE || '.env.local' });

const need = (k) => {
  const v = process.env[k];
  if (!v) { console.error(`Missing env ${k}`); process.exit(1); }
  return v;
};

const firebase = {
  apiKey: need('FIREBASE_API_KEY'),
  authDomain: need('FIREBASE_AUTH_DOMAIN'),
  projectId: need('FIREBASE_PROJECT_ID'),
  storageBucket: need('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: need('FIREBASE_MESSAGING_SENDER_ID'),
  appId: need('FIREBASE_APP_ID')
};

const mk = (prod) => `export const environment = {
  production: ${prod},
  firebase: ${JSON.stringify(firebase, null, 2)}
};\n`;

fs.mkdirSync('src/environments', { recursive: true });
fs.writeFileSync('src/environments/environment.ts', mk(false));
fs.writeFileSync('src/environments/environment.prod.ts', mk(true));
console.log('✓ environments written');

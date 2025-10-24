import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "posturetracker-6c60d.firebaseapp.com",
  projectId: "posturetracker-6c60d",
  storageBucket: "posturetracker-6c60d.appspot.com",
  messagingSenderId: "935742398579",
  appId: "1:935742398579:web:96e270273f53835c242e88",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && !(auth as any)._emulator) {
    // connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
}

export { app, auth };

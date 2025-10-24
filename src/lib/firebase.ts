import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "posturetracker-6c60d.firebaseapp.com",
  projectId: "posturetracker-6c60d",
  storageBucket: "posturetracker-6c60d.appspot.com",
  messagingSenderId: "367039542911",
  appId: "1:367039542911:web:53a69344234346e43f063a",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';

export const firebaseConfig = {
  apiKey: "AIzaSyDLi2owMRuwCS2o6mUQwCnfH-PKYbzPRZs",
  authDomain: "posturetracker-6c60d.firebaseapp.com",
  projectId: "posturetracker-6c60d",
  storageBucket: "posturetracker-6c60d.firebasestorage.app",
  messagingSenderId: "842774508787",
  appId: "1:842774508787:web:81045e9e69a04107b03386",
  measurementId: "G-6M2DSN6BS9"
};

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export function getClientApp(): FirebaseApp {
    if (getApps().length) {
        return getApp();
    }
    return initializeApp(firebaseConfig);
}

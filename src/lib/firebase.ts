import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';

export const firebaseConfig = {
  apiKey: "AIzaSyC50o0-xCwOdeR6pC8DUNKm9t_2xabcxXX",
  authDomain: "posturetracker-6c60d.firebaseapp.com",
  projectId: "posturetracker-6c60d",
  storageBucket: "posturetracker-6c60d.appspot.com",
  messagingSenderId: "367039542911",
  appId: "1:367039542911:web:53a69344234346e43f063a",
};

export function getClientApp(): FirebaseApp {
    if (getApps().length) {
        return getApp();
    }
    return initializeApp(firebaseConfig);
}

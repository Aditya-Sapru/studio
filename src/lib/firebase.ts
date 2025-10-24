import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyDLi2owMRuwCS2o6mUQwCnfH-PKYbzPRZs",
  authDomain: "posturetracker-6c60d.firebaseapp.com",
  projectId: "posturetracker-6c60d",
  storageBucket: "posturetracker-6c60d.firebasestorage.app",
  messagingSenderId: "842774508787",
  appId: "1:842774508787:web:81045e9e69a04107b03386",
  measurementId: "G-6M2DSN6BS9"
};

// Centralized Firebase app instance
let app: FirebaseApp;

function getClientApp(): FirebaseApp {
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
    return app;
}

// Export a function to get the app instance
export const getFirebaseApp = () => getClientApp();

// Export functions to get service instances
export const getFirebaseAuth = () => getAuth(getClientApp());
export const getFirebaseFirestore = () => getFirestore(getClientApp());

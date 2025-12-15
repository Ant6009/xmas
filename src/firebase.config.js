// Firebase Configuration
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBYxKJlIaCMRojXe5BNPcyy8rYfSGcF_38",
  authDomain: "xmaswarmup-379bf.firebaseapp.com",
  databaseURL:
    "https://xmaswarmup-379bf-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "xmaswarmup-379bf",
  storageBucket: "xmaswarmup-379bf.firebasestorage.app",
  messagingSenderId: "42560463810",
  appId: "1:42560463810:web:dbe1d193da625f1cd1ac5b",
};

// Check if Firebase is configured
const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

// Initialize Firebase
const app = isConfigured ? initializeApp(firebaseConfig) : null;
const database = isConfigured ? getDatabase(app) : null;

export { database, isConfigured };
export default app;

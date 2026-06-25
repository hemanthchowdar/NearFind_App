// ─── Firebase Configuration ─────────────────────────────────────────────────
// TODO: Paste your Firebase project's web config object below.
// You can find it at: Firebase Console → Project Settings → General → Your apps → Web app → Config
//
// Steps:
//   1. Go to https://console.firebase.google.com
//   2. Create or select your project
//   3. Enable Firestore Database (in test mode for prototyping)
//   4. Add a Web app if you haven't already
//   5. Copy the config object and paste it below

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCAttfWkCpnf75mrPt9_2aKKgYsqfAsGBM",
  authDomain: "near-find.firebaseapp.com",
  projectId: "near-find",
  storageBucket: "near-find.firebasestorage.app",
  messagingSenderId: "674197646920",
  appId: "1:674197646920:web:a30ef78d328479dc9bb27d",
  measurementId: "G-GJPE8RZJ9P"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

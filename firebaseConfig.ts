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
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

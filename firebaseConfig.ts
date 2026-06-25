
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

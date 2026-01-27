import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDaHxZohIvyN13cEcBI95P4PKZAmcghGxw',
  authDomain: 'edutasker-31495.firebaseapp.com',
  projectId: 'edutasker-31495',
  storageBucket: 'edutasker-31495.firebasestorage.app',
  messagingSenderId: '835329304221',
  appId: '1:835329304221:web:a92e238be2c220beec5674',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
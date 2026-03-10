import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCCmLY20wHwL5YDiEJWJocXMq6JHUkrNzo",
  authDomain: "life-9fb4f.firebaseapp.com",
  projectId: "life-9fb4f",
  storageBucket: "life-9fb4f.firebasestorage.app",
  messagingSenderId: "1026529359003",
  appId: "1:1026529359003:web:dc1a788e59abb4f630423e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
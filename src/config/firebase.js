import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBSyGb2M8KBAnxbal3piSYkPZiGyHwhYQg',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'thakre-printing-press.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'thakre-printing-press',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'thakre-printing-press.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '760512353738',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:760512353738:web:4c9507559f47a88acceb33',
};

let app = null;
let auth = null;
let db = null;
let storage = null;

try {
  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.warn('Firebase initialization note:', error.message);
}

export { auth, db, storage };
export default app;

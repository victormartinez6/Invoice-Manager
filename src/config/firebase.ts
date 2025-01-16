import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager
} from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAsbaNLhypdUv5iQRJTv-_44xTLfSVGGEQ",
  authDomain: "gerar-invoice.firebaseapp.com",
  projectId: "gerar-invoice",
  storageBucket: "gerar-invoice.appspot.com",
  messagingSenderId: "846248367483",
  appId: "1:846248367483:web:761c39667a2801489a99de"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager()
  })
});

// Initialize Auth with persistence
const auth = getAuth(app);

// Export initialized services
export { db, auth };
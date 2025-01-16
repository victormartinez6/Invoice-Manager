import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { app } from './firebase';

export const db = getFirestore(app);

// Enable offline persistence
const ENABLE_PERSISTENCE = true;

if (ENABLE_PERSISTENCE) {
  import('firebase/firestore').then(async (firestore) => {
    try {
      await firestore.enableIndexedDbPersistence(db);
      console.log('Offline persistence enabled');
    } catch (err) {
      console.error('Error enabling offline persistence:', err);
    }
  });
}

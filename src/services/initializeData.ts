import { 
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { toast } from 'react-toastify';

const defaultSettings = {
  currency: 'BRL',
  paymentTerms: 30,
  companyDetails: {
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'BR'
    }
  }
};

export const initializeData = async () => {
  // Se não houver usuário autenticado, retorna silenciosamente
  if (!auth.currentUser) {
    return;
  }

  try {
    const userId = auth.currentUser.uid;
    const userEmail = auth.currentUser.email;

    if (!userId || !userEmail) {
      throw new Error('User ID or email not available');
    }

    // Inicializa o documento do usuário com dados básicos
    const userRef = doc(db, 'users', userId);
    const userData = {
      email: userEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(userRef, userData, { merge: true });

    // Inicializa as configurações do usuário se não existirem
    const settingsRef = doc(db, 'settings', userId);
    const settingsDoc = await getDoc(settingsRef);

    if (!settingsDoc.exists()) {
      const settingsData = {
        ...defaultSettings,
        userId,
        email: userEmail,
        updatedAt: new Date().toISOString()
      };

      await setDoc(settingsRef, settingsData);
    }

  } catch (error) {
    console.error('Error initializing user data:', error);
    // Não mostra toast de erro para o usuário pois isso é uma operação em background
  }
};
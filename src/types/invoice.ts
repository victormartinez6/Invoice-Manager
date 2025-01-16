import { Team } from './team';
import { Timestamp } from 'firebase/firestore';

export interface Invoice {
  id: string;
  userId: string;
  teamId?: string;
  team?: Team;
  number: string;
  date: Date | Timestamp;
  dueDate: Date | Timestamp;
  shippingDate?: Date | Timestamp; // Data de previsão de embarque
  clientName: string;
  clientEmail: string;
  clientAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    price: number;
  }>;
  notes?: string;
  status: 'pending' | 'paid';
  amount: number;
  currency: string;
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  // Detalhes bancários principais
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    swiftCode: string;
    iban: string;
    additionalInfo?: string;
  };
  // Banco intermediário
  intermediaryBank?: {
    country: string;
    bankName: string;
    swiftCode: string;
  };
}
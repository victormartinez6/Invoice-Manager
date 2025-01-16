import { create } from 'zustand';
import { Invoice } from '../types/invoice';
import { invoiceService } from '../services/invoiceService';
import { useAuthStore } from './useAuthStore';

interface InvoiceStore {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  fetchInvoices: () => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  markAsPaid: (id: string) => Promise<void>;
  duplicateInvoice: (invoice: Invoice) => Promise<Invoice>;
}

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  invoices: [],
  loading: false,
  error: null,

  fetchInvoices: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ invoices: [], loading: false, error: 'Not authenticated' });
      return;
    }

    set({ loading: true, error: null });
    try {
      console.log('Fetching invoices...');
      const invoices = await invoiceService.getAll();
      console.log('Fetched invoices:', invoices);
      
      // Sort invoices by date in descending order (newest first)
      const sortedInvoices = invoices.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
      
      set({ invoices: sortedInvoices, loading: false, error: null });
      console.log('Updated store with sorted invoices');
    } catch (error) {
      console.error('Error fetching invoices:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch invoices', 
        loading: false,
        invoices: [] 
      });
    }
  },

  addInvoice: async (invoice) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'Not authenticated' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const newInvoice = await invoiceService.create(invoice);
      set(state => ({
        invoices: [newInvoice, ...state.invoices],
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error adding invoice:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add invoice', 
        loading: false 
      });
    }
  },

  updateInvoice: async (id, invoice) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'Not authenticated' });
      return;
    }

    set({ loading: true, error: null });
    try {
      console.log('Atualizando invoice no store:', { id, invoice });
      const updatedInvoice = await invoiceService.update(id, invoice);
      console.log('Invoice atualizada com sucesso:', updatedInvoice);
      
      set(state => {
        const newInvoices = state.invoices.map(inv => 
          inv.id === id ? updatedInvoice : inv
        );
        console.log('Estado atualizado:', newInvoices);
        return {
          invoices: newInvoices,
          loading: false,
          error: null
        };
      });
    } catch (error) {
      console.error('Erro ao atualizar invoice no store:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update invoice', 
        loading: false 
      });
      throw error;
    }
  },

  deleteInvoice: async (id) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'Not authenticated' });
      return;
    }

    set({ loading: true, error: null });
    try {
      console.log('Starting delete in store for invoice:', id);
      await invoiceService.delete(id);
      set(state => ({
        invoices: state.invoices.filter(invoice => invoice.id !== id),
        loading: false,
        error: null
      }));
      console.log('Delete completed in store');
    } catch (error) {
      console.error('Error in store deleteInvoice:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete invoice', 
        loading: false 
      });
      throw error; // Re-throw to be caught by the component
    }
  },

  markAsPaid: async (id) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'Not authenticated' });
      return;
    }

    set({ loading: true, error: null });
    try {
      await invoiceService.markAsPaid(id);
      set(state => ({
        invoices: state.invoices.map(inv => 
          inv.id === id ? { ...inv, status: 'paid' } : inv
        ),
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to mark invoice as paid', 
        loading: false 
      });
    }
  },

  duplicateInvoice: async (invoice) => {
    try {
      // Criar uma cópia da invoice sem o ID e número
      const { id, number, date, ...rest } = invoice;
      
      // Criar nova invoice com dados duplicados
      const newInvoice = {
        ...rest,
        date: new Date().toISOString(),
        paid: false, // Sempre começa como não pago
        number: await invoiceService.getNextInvoiceNumber()
      };

      // Adicionar a nova invoice
      const addedInvoice = await invoiceService.create(newInvoice);
      
      // Atualizar a lista de invoices
      set(state => ({
        ...state,
        invoices: [...state.invoices, addedInvoice]
      }));

      return addedInvoice;
    } catch (error) {
      console.error('Error duplicating invoice:', error);
      throw error;
    }
  }
}));
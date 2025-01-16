import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  where,
  writeBatch,
  serverTimestamp,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Invoice } from '../types/invoice';
import { parseToDateBR } from '../utils/dateUtils';

export const invoiceService = {
  async getAll() {
    if (!auth.currentUser) {
      throw new Error('Not authenticated');
    }

    try {
      // Primeiro, buscar todas as invoices
      const q = query(collection(db, 'invoices'));
      
      const snapshot = await getDocs(q);
      console.log('Total de invoices encontradas:', snapshot.docs.length);
      
      const invoices = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Dados brutos da invoice:', {
          id: doc.id,
          date: data.date,
          dateType: typeof data.date,
          dateToDate: data.date?.toDate?.(),
          dueDate: data.dueDate,
          dueDateType: typeof data.dueDate,
          dueDateToDate: data.dueDate?.toDate?.()
        });

        const invoice = {
          id: doc.id,
          ...data,
          date: parseToDateBR(data.date),
          createdAt: parseToDateBR(data.createdAt),
          updatedAt: parseToDateBR(data.updatedAt),
          dueDate: parseToDateBR(data.dueDate),
        };

        console.log('Invoice após processamento:', {
          id: invoice.id,
          date: invoice.date,
          dateType: typeof invoice.date,
          dateIsDate: invoice.date instanceof Date,
          dueDate: invoice.dueDate,
          dueDateType: typeof invoice.dueDate,
          dueDateIsDate: invoice.dueDate instanceof Date
        });

        return invoice;
      }) as Invoice[];

      return invoices;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw new Error('Falha ao buscar invoices');
    }
  },

  async create(invoice: Omit<Invoice, 'id'>) {
    if (!auth.currentUser) {
      throw new Error('Usuário não está autenticado');
    }

    try {
      console.log('Iniciando criação da invoice no Firestore:', invoice);
      
      // Converter datas para Timestamp do Firestore
      const invoiceData = {
        ...invoice,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Garantir que as datas estejam no fuso horário correto
        date: invoice.date ? Timestamp.fromDate(new Date(invoice.date)) : Timestamp.fromDate(new Date()),
        dueDate: invoice.dueDate ? Timestamp.fromDate(new Date(invoice.dueDate)) : null
      };

      console.log('Dados formatados para salvar:', {
        ...invoiceData,
        date: invoiceData.date?.toDate?.(),
        dueDate: invoiceData.dueDate?.toDate?.(),
      });

      const docRef = await addDoc(collection(db, 'invoices'), invoiceData);
      console.log('Invoice criada com sucesso! ID:', docRef.id);

      // Buscar o documento recém-criado para garantir os dados corretos
      const docSnap = await getDoc(docRef);
      const savedData = docSnap.data();

      console.log('Dados salvos:', {
        ...savedData,
        date: savedData?.date?.toDate?.(),
        dueDate: savedData?.dueDate?.toDate?.(),
      });

      // Converter as datas de volta para o formato correto
      const processedData = {
        id: docRef.id,
        ...savedData,
        date: parseToDateBR(savedData?.date),
        dueDate: parseToDateBR(savedData?.dueDate),
        createdAt: parseToDateBR(savedData?.createdAt),
        updatedAt: parseToDateBR(savedData?.updatedAt),
      } as Invoice;

      console.log('Dados processados:', {
        ...processedData,
        date: processedData.date?.toString?.(),
        dueDate: processedData.dueDate?.toString?.(),
      });

      return processedData;
    } catch (error) {
      console.error('Erro ao criar invoice:', error);
      throw new Error('Falha ao criar a invoice. Por favor, tente novamente.');
    }
  },

  async update(id: string, invoice: Partial<Invoice>) {
    if (!auth.currentUser) {
      throw new Error('Not authenticated');
    }

    try {
      console.log('Iniciando atualização da invoice:', { id, invoice });
      
      const docRef = doc(db, 'invoices', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Invoice not found');
      }

      // Remove campos que não devem ser atualizados
      const { id: _, createdAt: __, ...updateData } = invoice as any;

      console.log('Dados a serem atualizados:', updateData);

      // Converter datas para Timestamp
      const updates = {
        ...updateData,
        updatedAt: serverTimestamp()
      };

      if (updates.dueDate) {
        try {
          // Converter a data do formulário (YYYY-MM-DD) para Timestamp
          const [year, month, day] = updates.dueDate.split('-').map(Number);
          const dueDate = new Date(year, month - 1, day); // month - 1 porque os meses em JS são 0-based
          updates.dueDate = Timestamp.fromDate(dueDate);
        } catch (error) {
          console.error('Erro ao converter dueDate:', error);
          delete updates.dueDate;
        }
      }

      console.log('Atualizando documento no Firestore:', updates);
      await updateDoc(docRef, updates);
      console.log('Documento atualizado com sucesso');

      // Buscar o documento atualizado
      const updatedDoc = await getDoc(docRef);
      const updatedData = updatedDoc.data();
      console.log('Documento após atualização:', updatedData);

      // Converter datas de volta para Date
      const date = parseToDateBR(updatedData?.date);
      const createdAt = parseToDateBR(updatedData?.createdAt);
      const updatedAt = parseToDateBR(updatedData?.updatedAt);
      const dueDate = parseToDateBR(updatedData?.dueDate);

      return {
        id,
        ...updatedData,
        date,
        createdAt,
        updatedAt,
        dueDate
      } as Invoice;
    } catch (error) {
      console.error('Erro ao atualizar invoice:', error);
      throw error;
    }
  },

  async delete(id: string) {
    if (!auth.currentUser) {
      throw new Error('Usuário não está autenticado');
    }

    try {
      console.log('Iniciando exclusão da invoice:', id); 
      
      // Verificar se o documento existe
      const docRef = doc(db, 'invoices', id);
      console.log('Referência do documento:', docRef.path);
      
      const docSnap = await getDoc(docRef);
      console.log('Documento existe:', docSnap.exists(), 'ID:', docSnap.id); 

      if (!docSnap.exists()) {
        console.error('Documento não encontrado. ID:', id);
        throw new Error('Invoice não encontrada. Por favor, atualize a página e tente novamente.');
      }

      // Tentar excluir
      console.log('Tentando excluir documento...');
      await deleteDoc(docRef);
      console.log('Documento excluído com sucesso!'); 
      return true;
    } catch (error) {
      console.error('Erro na operação de exclusão:', error); 
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Falha ao excluir a invoice. Por favor, tente novamente.');
      }
    }
  },

  async markAsPaid(id: string) {
    if (!auth.currentUser) {
      throw new Error('Not authenticated');
    }

    try {
      const docRef = doc(db, 'invoices', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Invoice não encontrada');
      }

      const data = docSnap.data();
      if (data.userId !== auth.currentUser.uid) {
        throw new Error('Permissão negada');
      }

      await updateDoc(docRef, {
        paid: true,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      throw new Error('Falha ao marcar invoice como paga');
    }
  },

  async getNextInvoiceNumber() {
    if (!auth.currentUser) {
      throw new Error('Not authenticated');
    }

    try {
      const invoices = await this.getAll();
      
      // Encontrar o maior número de invoice
      const maxNumber = invoices.reduce((max, invoice) => {
        const currentNumber = parseInt(invoice.number.replace(/\D/g, ''), 10);
        return isNaN(currentNumber) ? max : Math.max(max, currentNumber);
      }, 0);

      // Incrementar o número e formatar
      const nextNumber = maxNumber + 1;
      return nextNumber.toString().padStart(5, '0'); // Formato: 00001, 00002, etc.
    } catch (error) {
      console.error('Error getting next invoice number:', error);
      throw new Error('Falha ao gerar próximo número de invoice');
    }
  },
};
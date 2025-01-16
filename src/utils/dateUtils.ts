import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDateBR = (date: any): string => {
  try {
    if (!date) return 'N/A';
    
    let dateObj: Date;
    
    // Se for um timestamp do Firestore
    if (date?.toDate) {
      dateObj = date.toDate();
    }
    // Se for uma string de data
    else if (typeof date === 'string') {
      try {
        dateObj = parseISO(date);
      } catch {
        dateObj = new Date(date);
      }
    }
    // Se for um objeto Date
    else if (date instanceof Date) {
      dateObj = date;
    }
    // Se for um número (timestamp)
    else if (typeof date === 'number') {
      dateObj = new Date(date);
    }
    else {
      return 'N/A';
    }

    console.log('Data antes da formatação:', {
      original: date,
      convertida: dateObj,
      timestamp: dateObj.getTime()
    });
    
    // Formatar a data no padrão brasileiro
    return format(dateObj, 'dd/MM/yyyy', {
      locale: ptBR
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error, 'Data original:', date);
    return 'N/A';
  }
};

export const getCurrentDateBR = (): Date => {
  return new Date();
};

export const getISODateBR = (date?: Date): string => {
  const dateToUse = date || getCurrentDateBR();
  return format(dateToUse, 'yyyy-MM-dd');
};

export const parseToDateBR = (date: any): Date => {
  if (!date) return getCurrentDateBR();
  
  let dateObj: Date;
  
  // Se for um timestamp do Firestore
  if (date?.toDate) {
    dateObj = date.toDate();
  }
  // Se for uma string de data
  else if (typeof date === 'string') {
    try {
      dateObj = parseISO(date);
    } catch {
      dateObj = new Date(date);
    }
  }
  // Se for um objeto Date
  else if (date instanceof Date) {
    dateObj = date;
  }
  // Se for um número (timestamp)
  else if (typeof date === 'number') {
    dateObj = new Date(date);
  }
  else {
    return getCurrentDateBR();
  }

  return dateObj;
};

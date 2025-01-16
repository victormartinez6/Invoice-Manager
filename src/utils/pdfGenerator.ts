import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Invoice } from '../types/invoice';
import { Settings } from '../types/settings';
import { setupDocument } from './pdf/constants';
import { drawHeader } from './pdf/sections/header';
import { drawInvoiceDetails } from './pdf/sections/details';
import { drawParties } from './pdf/sections/parties';
import { drawItemsTable } from './pdf/sections/items';
import { drawPaymentInstructions } from './pdf/sections/paymentInstructions';
import { drawNotesAndTerms } from './pdf/sections/notes';

export const generatePDF = async (invoice: Invoice, settings?: Settings) => {
  try {
    if (!invoice) {
      throw new Error('Invoice é obrigatória para gerar o PDF');
    }

    console.log('Dados da invoice antes de gerar PDF:', {
      number: invoice.number,
      date: invoice.date,
      dateType: typeof invoice.date,
      dateIsDate: invoice.date instanceof Date,
      dateString: invoice.date?.toString?.(),
      dueDate: invoice.dueDate,
      dueDateType: typeof invoice.dueDate,
      dueDateIsDate: invoice.dueDate instanceof Date,
      dueDateString: invoice.dueDate?.toString?.()
    });

    // Criar documento PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16
    });

    // Configurar documento
    setupDocument(doc);

    console.log('Iniciando geração do PDF para invoice:', invoice.number);

    try {
      // Começar do topo da página
      let currentY = 20;

      // Desenhar header
      currentY = drawHeader(doc, invoice, currentY);
      console.log('Header desenhado em Y:', currentY);

      // Desenhar detalhes da invoice
      currentY = drawInvoiceDetails(doc, invoice, currentY);
      console.log('Detalhes desenhados em Y:', currentY);

      // Desenhar informações das partes
      currentY = drawParties(doc, invoice, currentY);
      console.log('Informações das partes desenhadas em Y:', currentY);

      // Desenhar tabela de itens
      currentY = drawItemsTable(doc, invoice, currentY);
      console.log('Tabela de itens desenhada em Y:', currentY);
      
      // Desenhar instruções de pagamento
      console.log('Desenhando instruções de pagamento...');
      currentY = drawPaymentInstructions(doc, invoice, currentY);
      console.log('Instruções de pagamento desenhadas em Y:', currentY);

      if (invoice.notes || invoice.terms) {
        currentY = drawNotesAndTerms(doc, invoice, currentY);
        console.log('Notas e termos desenhados em Y:', currentY);
      }

    } catch (error) {
      console.error('Erro ao desenhar seção do PDF:', error);
      throw new Error('Falha ao gerar seções do PDF: ' + error.message);
    }

    // Gerar nome do arquivo
    const timestamp = new Date().getTime();
    const fileName = `invoice-${invoice.number || timestamp}.pdf`;
    console.log('Salvando PDF com nome:', fileName);

    // Salvar o PDF
    doc.save(fileName);
    console.log('PDF gerado com sucesso!');

    return fileName;
  } catch (error) {
    console.error('Erro fatal ao gerar PDF:', error);
    throw new Error('Não foi possível gerar o PDF: ' + error.message);
  }
};
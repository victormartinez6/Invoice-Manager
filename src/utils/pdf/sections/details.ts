import { jsPDF } from 'jspdf';
import { Invoice } from '../../../types/invoice';
import { PDF_CONSTANTS, FONT_SIZES } from '../constants';
import { formatDateBR } from '../../../utils/dateUtils';

export const drawInvoiceDetails = (
  doc: jsPDF,
  invoice: Invoice,
  startY: number
): number => {
  try {
    // Configurar fonte
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_SIZES.heading);

    // Título da seção
    doc.text('Invoice Details', PDF_CONSTANTS.MARGINS.left, startY);
    startY += PDF_CONSTANTS.LINE_HEIGHT;

    // Configurar fonte para os detalhes
    doc.setFontSize(FONT_SIZES.normal);

    // Coluna única alinhada à esquerda
    let currentY = startY;
    const labelX = PDF_CONSTANTS.MARGINS.left;
    const valueX = labelX + PDF_CONSTANTS.LABEL_WIDTH;

    const addDetailLine = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label + ':', labelX, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(value, valueX, currentY);
      currentY += PDF_CONSTANTS.LINE_HEIGHT;
    };

    // Número da Invoice
    addDetailLine('Invoice #', invoice.number || '');

    // Data da Invoice
    addDetailLine('Date', formatDateBR(invoice.date) || '');

    // Data de Vencimento
    addDetailLine('Due Date', formatDateBR(invoice.dueDate) || '');

    // Data de Embarque (se existir)
    if (invoice.shippingDate) {
      addDetailLine('Shipping Date', formatDateBR(invoice.shippingDate) || '');
    }

    // Retornar a posição Y atual
    return currentY + 5;
  } catch (error) {
    console.error('Erro ao desenhar detalhes da invoice:', error);
    throw error;
  }
};
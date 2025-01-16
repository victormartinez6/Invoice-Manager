import { jsPDF } from 'jspdf';
import { Invoice } from '../../../types/invoice';
import { PDF_CONSTANTS, FONT_SIZES } from '../constants';

export const drawHeader = (
  doc: jsPDF,
  invoice: Invoice,
  startY: number
): number => {
  try {
    // Configurar fonte e tamanho
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_SIZES.title);
    doc.setTextColor(PDF_CONSTANTS.COLORS.text);

    // Desenhar título
    doc.text('INVOICE', PDF_CONSTANTS.MARGINS.left, startY);

    // Adicionar linha decorativa
    const lineY = startY + 3;
    doc.setDrawColor(PDF_CONSTANTS.COLORS.primary);
    doc.setLineWidth(0.5);
    doc.line(
      PDF_CONSTANTS.MARGINS.left,
      lineY,
      PDF_CONSTANTS.PAGE.width - PDF_CONSTANTS.MARGINS.right,
      lineY
    );

    return startY + PDF_CONSTANTS.HEADER_HEIGHT;
  } catch (error) {
    console.error('Erro ao desenhar header:', error);
    throw error;
  }
};
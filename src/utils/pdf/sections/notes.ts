import { jsPDF } from 'jspdf';
import { Invoice } from '../../../types/invoice';
import { PDF_CONSTANTS, FONT_SIZES } from '../constants';

export const drawNotesAndTerms = (doc: jsPDF, invoice: Invoice, startY: number): number => {
  let currentY = startY + 5;

  if (invoice.notes) {
    doc.setFontSize(FONT_SIZES.heading);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes', PDF_CONSTANTS.MARGINS.left, currentY);
    
    currentY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT_SIZES.normal);
    
    const lines = doc.splitTextToSize(invoice.notes, PDF_CONSTANTS.MAX_LINE_WIDTH - 40);
    doc.text(lines, PDF_CONSTANTS.MARGINS.left, currentY);
    currentY += lines.length * 4;
  }

  if (invoice.terms) {
    currentY += 5;
    doc.setFontSize(FONT_SIZES.heading);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions', PDF_CONSTANTS.MARGINS.left, currentY);
    
    currentY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT_SIZES.normal);
    
    const lines = doc.splitTextToSize(invoice.terms, PDF_CONSTANTS.MAX_LINE_WIDTH - 40);
    doc.text(lines, PDF_CONSTANTS.MARGINS.left, currentY);
    currentY += lines.length * 4;
  }

  return currentY;
};
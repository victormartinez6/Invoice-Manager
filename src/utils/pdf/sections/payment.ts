import { jsPDF } from 'jspdf';
import { Invoice } from '../../../types/invoice';
import { PDF_CONSTANTS, FONT_SIZES } from '../constants';

export const drawPaymentInstructions = (doc: jsPDF, invoice: Invoice, startY: number): number => {
  let currentY = startY + 5;

  doc.setFontSize(FONT_SIZES.heading);
  doc.setFont('helvetica', 'bold');
  doc.text('Instruções de Pagamento', PDF_CONSTANTS.MARGINS.left, currentY);
  
  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(FONT_SIZES.normal);

  const instructions = [
    { label: 'Banco', value: invoice.wireInstructions.bankName },
    { label: 'Nome da Conta', value: invoice.wireInstructions.accountName },
    { label: 'Número da Conta', value: invoice.wireInstructions.accountNumber },
    { label: 'Agência', value: invoice.wireInstructions.routingNumber },
    { label: 'Código SWIFT', value: invoice.wireInstructions.swiftCode },
    { label: 'IBAN', value: invoice.wireInstructions.iban }
  ].filter(item => item.value);

  instructions.forEach(({ label, value }) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, PDF_CONSTANTS.MARGINS.left, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(value, PDF_CONSTANTS.MARGINS.left + 35, currentY);
    currentY += 4;
  });

  if (invoice.wireInstructions.additionalInfo) {
    currentY += 2;
    doc.setFont('helvetica', 'bold');
    doc.text('Informações Adicionais:', PDF_CONSTANTS.MARGINS.left, currentY);
    currentY += 4;
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(
      invoice.wireInstructions.additionalInfo,
      PDF_CONSTANTS.MAX_LINE_WIDTH - 40
    );
    doc.text(lines, PDF_CONSTANTS.MARGINS.left, currentY);
    currentY += lines.length * 4;
  }

  return currentY + 5;
};
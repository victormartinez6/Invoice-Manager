import { jsPDF } from 'jspdf';
import { Invoice } from '../../../types/invoice';
import { PDF_CONSTANTS, FONT_SIZES } from '../constants';

export const drawPaymentInstructions = (
  doc: jsPDF,
  invoice: Invoice,
  startY: number
): number => {
  try {
    let currentY = startY + 10; // Aumentei o espaço inicial

    // Título principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_SIZES.heading);
    doc.text('Payment Instructions', PDF_CONSTANTS.MARGINS.left, currentY);
    currentY += PDF_CONSTANTS.LINE_HEIGHT * 2; // Dobrei o espaço após título principal

    // Configurar fonte para os detalhes
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT_SIZES.normal);

    const addDetailLine = (label: string, value: string | undefined | null) => {
      if (!value) return;
      doc.setFont('helvetica', 'bold');
      doc.text(label + ':', PDF_CONSTANTS.MARGINS.left, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(value, PDF_CONSTANTS.MARGINS.left + PDF_CONSTANTS.LABEL_WIDTH, currentY);
      currentY += PDF_CONSTANTS.LINE_HEIGHT * 1.5; // Aumentei o espaço entre linhas
    };

    // Adicionar subtítulo "Wire Instructions"
    currentY += PDF_CONSTANTS.LINE_HEIGHT;
    doc.setFont('helvetica', 'bold');
    doc.text('Wire Instructions:', PDF_CONSTANTS.MARGINS.left, currentY);
    currentY += PDF_CONSTANTS.LINE_HEIGHT * 1.5; // Aumentei o espaço após subtítulo

    // Detalhes do banco principal (usando wireInstructions)
    if (invoice.wireInstructions) {
      const wire = invoice.wireInstructions;
      addDetailLine('Bank Name', wire.bankName);
      addDetailLine('Account Name', wire.accountName);
      addDetailLine('Account Number', wire.accountNumber);
      addDetailLine('Routing Number', wire.routingNumber);
      addDetailLine('Swift Code', wire.swiftCode);
      addDetailLine('IBAN', wire.iban);

      // Informações adicionais
      if (wire.additionalInfo) {
        currentY += PDF_CONSTANTS.LINE_HEIGHT * 1.5; // Aumentei o espaço antes das informações adicionais
        doc.setFont('helvetica', 'bold');
        doc.text('Additional Information:', PDF_CONSTANTS.MARGINS.left, currentY);
        currentY += PDF_CONSTANTS.LINE_HEIGHT * 1.5; // Aumentei o espaço após subtítulo

        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(
          wire.additionalInfo,
          PDF_CONSTANTS.MAX_LINE_WIDTH - PDF_CONSTANTS.MARGINS.left - PDF_CONSTANTS.MARGINS.right
        );
        
        lines.forEach((line: string) => {
          doc.text(line, PDF_CONSTANTS.MARGINS.left, currentY);
          currentY += PDF_CONSTANTS.LINE_HEIGHT * 1.3; // Aumentei o espaço entre linhas do texto adicional
        });
      }
    }

    // Banco intermediário (só mostrar se tiver pelo menos um campo preenchido)
    const intermediaryBank = invoice.intermediaryBank;
    if (intermediaryBank && (intermediaryBank.country || intermediaryBank.bankName || intermediaryBank.swiftCode)) {
      currentY += PDF_CONSTANTS.LINE_HEIGHT * 1.5; // Aumentei o espaço antes do banco intermediário
      doc.setFont('helvetica', 'bold');
      doc.text('Intermediary Bank:', PDF_CONSTANTS.MARGINS.left, currentY);
      currentY += PDF_CONSTANTS.LINE_HEIGHT * 1.5; // Aumentei o espaço após subtítulo

      addDetailLine('Country', intermediaryBank.country);
      addDetailLine('Bank Name', intermediaryBank.bankName);
      addDetailLine('Swift Code', intermediaryBank.swiftCode);
    }

    return currentY + PDF_CONSTANTS.LINE_HEIGHT * 1.5; // Aumentei o espaço final
  } catch (error) {
    console.error('Erro ao desenhar instruções de pagamento:', error);
    throw error;
  }
};

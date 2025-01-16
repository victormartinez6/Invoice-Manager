import { jsPDF } from 'jspdf';
import { Invoice } from '../../../types/invoice';
import { PDF_CONSTANTS, FONT_SIZES } from '../constants';

const formatAddress = (address: any): string[] => {
  if (!address) return [];
  if (typeof address === 'string') return [address];
  
  return [
    address.street,
    [address.city, address.state, address.zip || address.zipCode].filter(Boolean).join(', '),
    address.country
  ].filter(Boolean);
};

export const drawParties = (
  doc: jsPDF,
  invoice: Invoice,
  startY: number
): number => {
  try {
    let currentY = startY;
    const pageWidth = doc.internal.pageSize.width;
    const midPoint = pageWidth / 2;
    
    // Definir margens e larguras das colunas
    const leftColumnX = PDF_CONSTANTS.MARGINS.left;
    const rightColumnX = midPoint + 5;
    const columnWidth = (midPoint - PDF_CONSTANTS.MARGINS.left - 10); // 10px de espaço entre colunas

    // Configurar fonte menor para melhor layout
    doc.setFontSize(FONT_SIZES.normal - 1);

    // Função para quebrar texto em linhas
    const wrapText = (text: string, maxWidth: number): string[] => {
      return doc.splitTextToSize(text, maxWidth);
    };

    // Coluna da esquerda (From/Recebedor)
    doc.setFont('helvetica', 'bold');
    doc.text('From:', leftColumnX, currentY);
    
    // Coluna da direita (To/Pagador)
    doc.text('To:', rightColumnX, currentY);
    currentY += PDF_CONSTANTS.LINE_HEIGHT;

    // Preparar arrays de linhas com quebra de texto
    const companyDetails = invoice.companyDetails || {};
    const fromLines = [
      invoice.clientName,
      ...formatAddress(invoice.clientAddress),
      invoice.clientEmail
    ].filter(Boolean).map(line => wrapText(line, columnWidth)).flat();

    const toLines = [
      companyDetails.name,
      ...formatAddress(companyDetails.address),
      companyDetails.phone,
      companyDetails.email
    ].filter(Boolean).map(line => wrapText(line, columnWidth)).flat();

    // Encontrar o maior número de linhas entre as duas colunas
    const maxLines = Math.max(fromLines.length, toLines.length);

    // Desenhar as linhas
    doc.setFont('helvetica', 'normal');
    for (let i = 0; i < maxLines; i++) {
      if (fromLines[i]) {
        doc.text(fromLines[i], leftColumnX, currentY);
      }
      if (toLines[i]) {
        doc.text(toLines[i], rightColumnX, currentY);
      }
      currentY += PDF_CONSTANTS.LINE_HEIGHT;
    }

    return currentY + PDF_CONSTANTS.LINE_HEIGHT;
  } catch (error) {
    console.error('Erro ao desenhar partes:', error);
    throw error;
  }
};
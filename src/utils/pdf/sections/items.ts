import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Invoice } from '../../../types/invoice';
import { PDF_CONSTANTS, FONT_SIZES } from '../constants';
import { formatCurrency } from '../../../utils/formatters';

export const drawItemsTable = (
  doc: jsPDF,
  invoice: Invoice,
  startY: number
): number => {
  try {
    // Garantir que a moeda está definida
    if (!invoice.currency) {
      throw new Error('Currency must be defined in the invoice');
    }
    const currency = invoice.currency;

    // Título da seção
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_SIZES.heading);
    doc.text('Itens / Items', PDF_CONSTANTS.MARGINS.left, startY);
    startY += 8;

    // Preparar dados da tabela
    const tableData = invoice.items.map(item => [
      item.description,
      item.quantity?.toString() || '1',
      formatCurrency(item.price || 0, currency),
      formatCurrency((item.quantity || 1) * (item.price || 0), currency)
    ]);

    // Configurar cabeçalho
    const headers = [
      'Descrição / Description',
      'Quantidade / Quantity',
      'Preço Unitário / Unit Price',
      'Total'
    ];

    // Desenhar tabela
    doc.autoTable({
      startY: startY,
      head: [headers],
      body: tableData,
      margin: { left: PDF_CONSTANTS.MARGINS.left },
      headStyles: {
        fillColor: [79, 70, 229], // PDF_CONSTANTS.COLORS.primary em RGB
        textColor: 255,
        fontSize: FONT_SIZES.normal,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        fontSize: FONT_SIZES.normal,
        textColor: 30
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' }
      },
      theme: 'grid'
    });

    // Calcular posição final após a tabela
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Calcular total
    const total = invoice.items.reduce((sum, item) => 
      sum + ((item.quantity || 1) * (item.price || 0)), 0
    );

    // Adicionar total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_SIZES.heading);
    const totalText = `Total: ${formatCurrency(total, currency)}`;
    const totalWidth = doc.getTextWidth(totalText);
    doc.text(
      totalText,
      PDF_CONSTANTS.PAGE.width - PDF_CONSTANTS.MARGINS.right - totalWidth,
      finalY
    );

    return finalY + 10;
  } catch (error) {
    console.error('Erro ao desenhar tabela de itens:', error);
    throw error;
  }
};
import { jsPDF } from 'jspdf';

export const FONT_SIZES = {
  title: 14,
  heading: 11,
  subheading: 10,
  normal: 9,
  small: 8,
  large: 12
} as const;

export const PDF_CONSTANTS = {
  PAGE: {
    width: 210, // A4 width in mm
    height: 297 // A4 height in mm
  },
  MARGINS: {
    top: 15,
    bottom: 15,
    left: 15,
    right: 15
  },
  MAX_LINE_WIDTH: 180, // PAGE.width - (MARGINS.left + MARGINS.right)
  COLORS: {
    primary: '#4F46E5',
    secondary: '#F3F4F6',
    text: '#111827',
    lightText: '#6B7280'
  },
  HEADER_HEIGHT: 20,
  LABEL_WIDTH: 25,
  LINE_HEIGHT: 6
} as const;

export const setupDocument = (doc: jsPDF) => {
  doc.setFont('helvetica');
  doc.setFontSize(FONT_SIZES.normal);
  doc.setTextColor(PDF_CONSTANTS.COLORS.text);
};
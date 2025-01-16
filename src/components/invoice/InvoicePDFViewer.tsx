import React from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { PDFGenerator } from './PDFGeneratorNew';
import { Invoice } from '../../types/invoice';
import { Button } from '../ui/button';
import { FileDown, Eye } from 'lucide-react';

interface InvoicePDFViewerProps {
  invoice: Invoice;
  companyLogo?: string;
  showPreview?: boolean;
}

export const InvoicePDFViewer: React.FC<InvoicePDFViewerProps> = ({
  invoice,
  companyLogo,
  showPreview = true,
}) => {
  const fileName = `invoice-${invoice.number}.pdf`;

  return (
    <div className="space-y-4">
      {/* Download Button */}
      <PDFDownloadLink
        document={<PDFGenerator invoice={invoice} companyLogo={companyLogo} />}
        fileName={fileName}
      >
        {({ loading }) => (
          <Button disabled={loading}>
            <FileDown className="mr-2 h-4 w-4" />
            {loading ? 'Generating PDF...' : 'Download PDF'}
          </Button>
        )}
      </PDFDownloadLink>

      {/* Preview */}
      {showPreview && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">Preview</span>
          </div>
          <PDFViewer style={{ width: '100%', height: '600px' }}>
            <PDFGenerator invoice={invoice} companyLogo={companyLogo} />
          </PDFViewer>
        </div>
      )}
    </div>
  );
};

import { Document, Page, View, Text, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { Invoice } from '../../types/invoice';
import { formatCurrency } from '../../utils/formatCurrency';

// Registrar fonte personalizada (opcional)
Font.register({
  family: 'Open Sans',
  src: 'https://fonts.gstatic.com/s/opensans/v34/memvYaGs126MiZpBA-UvWbX2vVnXBbObj2OVTS-mu0SC55I.woff2'
});

// Estilos do PDF
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Open Sans',
    fontSize: 8,
  },
  header: {
    marginBottom: 20,
  },
  companyInfo: {
    marginBottom: 15,
  },
  companyName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyAddress: {
    fontSize: 8,
    marginBottom: 2,
  },
  invoiceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a237e',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  infoLabel: {
    width: 70,
    fontSize: 8,
  },
  infoValue: {
    flex: 1,
    fontSize: 8,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 5,
  },
  col1: { width: '40%' },
  col2: { width: '20%' },
  col3: { width: '20%' },
  col4: { width: '20%' },
  rightAlign: { textAlign: 'right' },
  centerAlign: { textAlign: 'center' },
  totalSection: {
    marginTop: 10,
    width: '100%',
  },
  bankDetails: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a237e',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    fontSize: 7,
    textAlign: 'center',
    color: '#666',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
});

interface PDFGeneratorProps {
  invoice: Invoice;
  companyLogo?: string;
}

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({ invoice, companyLogo }) => {
  const calculateSubtotal = (items: Invoice['items']) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTotal = (items: Invoice['items']) => {
    const subtotal = calculateSubtotal(items);
    return invoice.tax ? subtotal + (subtotal * invoice.tax / 100) : subtotal;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            {companyLogo && <Image src={companyLogo} style={{ width: 80, marginBottom: 10 }} />}
            <Text style={styles.companyName}>{invoice.companyDetails.name}</Text>
            <Text style={styles.companyAddress}>{invoice.companyDetails.address.street}</Text>
            <Text style={styles.companyAddress}>{invoice.companyDetails.address.city}</Text>
            <Text style={styles.companyAddress}>{invoice.companyDetails.address.state}</Text>
            <Text style={styles.companyAddress}>{invoice.companyDetails.address.zipCode}</Text>
            <Text style={styles.companyAddress}>{invoice.companyDetails.address.country}</Text>
            <Text style={styles.companyAddress}>{invoice.companyDetails.phone}</Text>
          </View>

          <Text style={styles.invoiceTitle}>INVOICE</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Invoice #:</Text>
            <Text style={styles.infoValue}>{invoice.number}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{new Date(invoice.date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Due Date:</Text>
            <Text style={styles.infoValue}>{new Date(invoice.dueDate).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Description</Text>
            <Text style={[styles.col2, styles.centerAlign]}>Quantity</Text>
            <Text style={[styles.col3, styles.rightAlign]}>Price</Text>
            <Text style={[styles.col4, styles.rightAlign]}>Total</Text>
          </View>
          
          {invoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{item.description}</Text>
              <Text style={[styles.col2, styles.centerAlign]}>{item.quantity}</Text>
              <Text style={[styles.col3, styles.rightAlign]}>
                {formatCurrency(item.price, invoice.currency)}
              </Text>
              <Text style={[styles.col4, styles.rightAlign]}>
                {formatCurrency(item.quantity * item.price, invoice.currency)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Subtotal:</Text>
            <Text style={[styles.infoValue, styles.rightAlign]}>
              {formatCurrency(calculateSubtotal(invoice.items), invoice.currency)}
            </Text>
          </View>
          
          {invoice.tax > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tax ({invoice.tax}%):</Text>
              <Text style={[styles.infoValue, styles.rightAlign]}>
                {formatCurrency(calculateSubtotal(invoice.items) * invoice.tax / 100, invoice.currency)}
              </Text>
            </View>
          )}

          <View style={[styles.infoRow, { marginTop: 5, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 5 }]}>
            <Text style={[styles.infoLabel, { fontWeight: 'bold' }]}>Total:</Text>
            <Text style={[styles.infoValue, styles.rightAlign, { fontWeight: 'bold' }]}>
              {formatCurrency(calculateTotal(invoice.items), invoice.currency)}
            </Text>
          </View>
        </View>

        <View style={styles.bankDetails}>
          <Text style={styles.sectionTitle}>WIRE TRANSFER INSTRUCTIONS</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bank Name:</Text>
            <Text style={styles.infoValue}>{invoice.bankDetails?.bankName || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Name:</Text>
            <Text style={styles.infoValue}>{invoice.bankDetails?.accountName || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account #:</Text>
            <Text style={styles.infoValue}>{invoice.bankDetails?.accountNumber || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Swift Code:</Text>
            <Text style={styles.infoValue}>{invoice.bankDetails?.swiftCode || '-'}</Text>
          </View>
          {invoice.bankDetails?.iban && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>IBAN:</Text>
              <Text style={styles.infoValue}>{invoice.bankDetails.iban}</Text>
            </View>
          )}

          {invoice.intermediaryBank && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 10 }]}>INTERMEDIARY BANK</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Bank Name:</Text>
                <Text style={styles.infoValue}>{invoice.intermediaryBank.bankName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Swift Code:</Text>
                <Text style={styles.infoValue}>{invoice.intermediaryBank.swiftCode}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Country:</Text>
                <Text style={styles.infoValue}>{invoice.intermediaryBank.country}</Text>
              </View>
            </>
          )}
        </View>

        {invoice.notes && (
          <View style={{ marginTop: 15 }}>
            <Text style={styles.sectionTitle}>NOTES</Text>
            <Text style={{ fontSize: 8 }}>{invoice.notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          This is an electronically generated invoice and does not require a signature.
        </Text>
      </Page>
    </Document>
  );
};

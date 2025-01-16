import React, { useEffect, useState } from 'react';
import { Download, Edit, Trash2, CheckCircle, Plus, Copy, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useInvoiceStore } from '../store/useInvoiceStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { generatePDF } from '../utils/pdfGenerator';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from './LoadingSpinner';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDateBR } from '../utils/dateUtils';
import { useTranslation } from 'react-i18next';
import { toast } from '../utils/toast';

export const InvoiceList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { invoices, fetchInvoices, deleteInvoice, markAsPaid, duplicateInvoice } = useInvoiceStore();
  const { settings } = useSettingsStore();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
      setIsDeleting(id);
      try {
        await deleteInvoice(id);
        toast.success(t('common.deleted'));
      } catch (error) {
        console.error('Error deleting invoice:', error);
        toast.error(t('common.error'));
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await markAsPaid(id);
      toast.success(t('common.saved'));
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast.error(t('common.error'));
    }
  };

  const handleDuplicate = async (invoice: any) => {
    try {
      await duplicateInvoice(invoice);
      toast.success(t('common.duplicated'));
    } catch (error) {
      console.error('Error duplicating invoice:', error);
      toast.error(t('common.error'));
    }
  };

  const handleDownload = async (invoice: any) => {
    try {
      console.log('Iniciando download da invoice:', invoice.number);
      
      if (!invoice || !invoice.items || invoice.items.length === 0) {
        toast.error('Invoice inválida ou sem itens');
        return;
      }

      // Mostrar loading durante o processo
      toast.loading('Gerando PDF...');
      
      console.log('Gerando PDF para invoice:', {
        number: invoice.number,
        date: invoice.date,
        dateType: typeof invoice.date,
        dateIsDate: invoice.date instanceof Date,
        dateString: invoice.date?.toString(),
        dueDate: invoice.dueDate,
        dueDateType: typeof invoice.dueDate,
        dueDateIsDate: invoice.dueDate instanceof Date,
        dueDateString: invoice.dueDate?.toString(),
      });

      const fileName = await generatePDF(invoice, settings);
      console.log('PDF gerado com sucesso:', fileName);
      
      toast.dismiss();
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : 'Falha ao gerar PDF. Por favor, tente novamente.');
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const searchTermLower = searchTerm.toLowerCase();
    const amount = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const formattedAmount = formatCurrency(amount, settings?.currency || 'USD').toLowerCase();
    
    return (
      invoice.number.toLowerCase().includes(searchTermLower) ||
      (invoice.companyDetails?.name || '').toLowerCase().includes(searchTermLower) ||
      invoice.clientName.toLowerCase().includes(searchTermLower) ||
      formattedAmount.includes(searchTermLower)
    );
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const toggleExpand = (invoiceId: string) => {
    setExpandedInvoice(expandedInvoice === invoiceId ? null : invoiceId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header com Título e Botões */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">{t('invoices.title')}</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar faturas..."
              className="w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={() => navigate('/invoices/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('invoices.createNew')}
          </button>
        </div>
      </div>

      {/* Lista de Faturas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedInvoices.map((invoice) => (
          <div
            key={invoice.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col border-2 border-transparent hover:border-primary-500"
            style={{ minHeight: '280px' }}
          >
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="space-y-3">
                {/* Número da Fatura e Data */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('invoices.number')} {invoice.number}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDateBR(invoice.date)}
                  </p>
                </div>

                {/* Status e Botões */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.paid
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {invoice.paid ? t('invoice.status.paid') : t('invoice.status.pending')}
                    </span>
                    {!invoice.paid && (
                      <button
                        onClick={() => handleMarkAsPaid(invoice.id)}
                        className="text-sm text-primary-500 hover:text-white hover:bg-primary-500 p-2 rounded-full transition-all duration-200 hover:scale-110"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownload(invoice)}
                      className="p-2 text-primary-500 hover:text-white hover:bg-primary-500 rounded-full transition-all duration-200 hover:scale-110"
                      title={t('common.download')}
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(invoice)}
                      className="p-2 text-primary-500 hover:text-white hover:bg-primary-500 rounded-full transition-all duration-200 hover:scale-110"
                      title={t('invoices.duplicate')}
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                      className="p-2 text-primary-500 hover:text-white hover:bg-primary-500 rounded-full transition-all duration-200 hover:scale-110"
                      title={t('common.edit')}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(invoice.id)}
                      className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-full transition-all duration-200 hover:scale-110"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="px-6 py-4 flex-grow">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Recebedor</p>
                  <p className="text-base text-gray-900 font-semibold truncate">{invoice.companyDetails?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Pagador</p>
                  <p className="text-base text-gray-900 font-semibold truncate">{invoice.clientName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('common.amount')}</p>
                  <p className="text-base text-gray-900 font-semibold">
                    {formatCurrency(
                      invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0),
                      settings?.currency || 'USD'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedInvoices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{t('invoices.noInvoices')}</p>
        </div>
      )}
    </div>
  );
};
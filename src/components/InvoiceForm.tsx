import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useInvoiceStore } from '../store/useInvoiceStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Invoice, InvoiceItem } from '../types/invoice';
import { CompanyDetails } from './InvoiceForm/CompanyDetails';
import { ClientDetails } from './InvoiceForm/ClientDetails';
import { WireInstructions } from './InvoiceForm/WireInstructions';
import { LoadingSpinner } from './LoadingSpinner';
import { formatCurrency } from '../utils/formatCurrency';
import { useTranslation } from 'react-i18next';
import { auth } from '../config/firebase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getCurrentDateBR, getISODateBR } from '../utils/dateUtils';

export const InvoiceForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { addInvoice, updateInvoice, invoices, fetchInvoices } = useInvoiceStore();
  const { settings, fetchSettings } = useSettingsStore();
  const [loading, setLoading] = useState(true);
  
  const emptyInvoice: Omit<Invoice, 'id' | 'number' | 'date'> = {
    clientName: '',
    clientAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    companyDetails: {
      name: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
    },
    dueDate: getISODateBR(),
    shippingDate: '',
    items: [{ id: '1', description: '', quantity: 1, price: 0 }],
    notes: '',
    terms: '',
    wireInstructions: {
      bankName: '',
      accountName: '',
      accountNumber: '',
      routingNumber: '',
      swiftCode: '',
      iban: '',
      additionalInfo: ''
    },
    intermediaryBank: {
      country: '',
      bankName: '',
      swiftCode: ''
    },
    amount: 0,
    tax: 0,
    status: 'pending',
    paymentMethod: 'bank_transfer',
    currency: settings?.currency || 'BRL'
  };

  const [formData, setFormData] = useState<Omit<Invoice, 'id' | 'number' | 'date'>>({
    clientName: '',
    clientAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    companyDetails: {
      name: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
    },
    dueDate: getISODateBR(),
    shippingDate: '',
    items: [{ id: '1', description: '', quantity: 1, price: 0 }],
    notes: '',
    terms: '',
    wireInstructions: {
      bankName: '',
      accountName: '',
      accountNumber: '',
      routingNumber: '',
      swiftCode: '',
      iban: '',
      additionalInfo: ''
    },
    intermediaryBank: {
      country: '',
      bankName: '',
      swiftCode: ''
    },
    currency: settings?.currency || 'USD'
  });

  // Initial data fetch
  useEffect(() => {
    const initializeForm = async () => {
      try {
        setLoading(true);
        console.log('Initializing form with id:', id);
        
        // Se for edição, busca os dados
        if (id) {
          await Promise.all([fetchSettings(), fetchInvoices()]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };

    initializeForm();
  }, [fetchSettings, fetchInvoices, t, id]);

  // Form data setup
  useEffect(() => {
    if (!loading && id) {
      const invoice = invoices.find(inv => inv.id === id);
      console.log('Found invoice:', invoice);
      
      if (invoice) {
        // Converter as datas para o formato esperado pelo input type="date"
        const formattedDueDate = invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : getISODateBR().split('T')[0];
        const formattedShippingDate = invoice.shippingDate ? new Date(invoice.shippingDate).toISOString().split('T')[0] : '';
        
        // Remove id, number, and date from the invoice data before setting form
        const { id: _, number: __, date: ___, ...rest } = invoice;
        const formData = {
          ...rest,
          dueDate: formattedDueDate,
          shippingDate: formattedShippingDate,
          items: rest.items || [{ id: '1', description: '', quantity: 1, price: 0 }],
          currency: rest.currency || settings?.currency || 'USD'
        };
        console.log('Setting form data:', formData);
        setFormData(formData);
      }
    }
  }, [id, invoices, loading]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev],
            [child]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleCompanyDetailsChange = (details: Invoice['companyDetails']) => {
    setFormData(prev => ({
      ...prev,
      companyDetails: details
    }));
  };

  const handleWireInstructionsChange = (field: keyof Invoice['wireInstructions'], value: string) => {
    setFormData(prev => ({
      ...prev,
      wireInstructions: {
        ...prev.wireInstructions,
        [field]: value
      }
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Math.random().toString(),
          description: '',
          quantity: 1,
          price: 0
        }
      ]
    }));
  };

  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const updateItem = (itemId: string, field: keyof InvoiceItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId
          ? { ...item, [field]: field === 'quantity' || field === 'price' ? Number(value) : value }
          : item
      )
    }));
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    return subtotal + (subtotal * (formData.tax || 0)) / 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const total = calculateTotal();
    
    try {
      if (!auth.currentUser?.uid) {
        throw new Error('Usuário não está autenticado');
      }

      console.log('Iniciando submissão do formulário:', { formData, total });
      
      if (id) {
        // Encontra a invoice original
        const originalInvoice = invoices.find(inv => inv.id === id);
        if (!originalInvoice) {
          throw new Error('Invoice não encontrada');
        }

        // Mantém os campos originais que não devem ser alterados
        const updatedInvoice = {
          id,
          number: originalInvoice.number,
          date: originalInvoice.date,
          createdAt: originalInvoice.createdAt,
          userId: originalInvoice.userId,
          status: originalInvoice.status,
          ...formData,
          amount: total
        };
        
        console.log('Atualizando invoice:', updatedInvoice);
        await updateInvoice(id, updatedInvoice);
        console.log('Invoice atualizada com sucesso');
      } else {
        const newInvoice = {
          number: `INV-${Date.now()}`,
          date: getCurrentDateBR(),
          ...formData,
          amount: total,
          userId: auth.currentUser.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'pending'
        };
        console.log('Criando nova invoice:', newInvoice);
        await addInvoice(newInvoice);
        console.log('Nova invoice criada com sucesso');
      }
      
      navigate('/invoices');
    } catch (error) {
      console.error('Erro ao salvar invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Falha ao salvar invoice. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {id ? t('invoice.edit') : t('invoice.new')}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Grid para Recebedor e Pagador lado a lado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recebedor */}
            <div className="bg-white rounded-lg shadow p-6">
              <ClientDetails
                clientName={formData.clientName}
                clientAddress={formData.clientAddress}
                onChange={handleFieldChange}
              />
            </div>

            {/* Pagador */}
            <div className="bg-white rounded-lg shadow p-6">
              <CompanyDetails
                companyDetails={formData.companyDetails}
                onChange={handleCompanyDetailsChange}
              />
            </div>
          </div>

          {/* Seção de Itens */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{t('invoice.items')}</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t('invoice.addItem')}
                </button>
              </div>

              {/* Cabeçalho da tabela */}
              <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-700 mb-2">
                <div className="col-span-5">{t('invoice.itemDescription')}</div>
                <div className="col-span-2 text-center">{t('invoice.quantity')}</div>
                <div className="col-span-3 text-right">{t('invoice.price')}</div>
                <div className="col-span-1 text-right">{t('invoice.total')}</div>
                <div className="col-span-1"></div>
              </div>
              
              {/* Itens */}
              {formData.items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder={t('invoice.itemDescription')}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                      min="1"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm text-center"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                      min="0"
                      step="0.01"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm text-right"
                    />
                  </div>
                  <div className="col-span-1 text-right text-sm font-medium">
                    {formatCurrency(item.quantity * item.price, formData.currency)}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-end text-sm">
                  <div className="w-48 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{t('invoice.total')}:</span>
                      <span className="font-bold">
                        {formatCurrency(calculateTotal(), formData.currency)}
                      </span>
                    </div>
                    {formData.tax > 0 && (
                      <div className="text-gray-500 text-xs">
                        {t('invoice.includingTax', { rate: formData.tax })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Datas e Valores */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('invoice.details')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('common.dueDate')}</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Previsão de Embarque</label>
                  <input
                    type="date"
                    value={formData.shippingDate}
                    onChange={(e) => handleFieldChange('shippingDate', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('invoice.taxRate')}</label>
                  <input
                    type="number"
                    value={formData.tax}
                    onChange={(e) => handleFieldChange('tax', Number(e.target.value))}
                    min="0"
                    max="100"
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Notas e Termos */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('common.notes')}</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleFieldChange('notes', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder={t('invoice.additionalNotes')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('common.terms')}</label>
                  <textarea
                    value={formData.terms}
                    onChange={(e) => handleFieldChange('terms', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder={t('invoice.termsAndConditions')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Instruções de Pagamento */}
          <div className="mt-8">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Canal de Pagamento / Wire Instructions</h3>
            
            {/* Campos principais de pagamento */}
            <div className="bg-white rounded-lg shadow p-6 mb-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('invoice.bankName')}</label>
                  <input
                    type="text"
                    value={formData.wireInstructions.bankName}
                    onChange={(e) => handleWireInstructionsChange('bankName', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('invoice.accountName')}</label>
                  <input
                    type="text"
                    value={formData.wireInstructions.accountName}
                    onChange={(e) => handleWireInstructionsChange('accountName', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('invoice.accountNumber')}</label>
                  <input
                    type="text"
                    value={formData.wireInstructions.accountNumber}
                    onChange={(e) => handleWireInstructionsChange('accountNumber', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('invoice.routingNumber')}</label>
                  <input
                    type="text"
                    value={formData.wireInstructions.routingNumber}
                    onChange={(e) => handleWireInstructionsChange('routingNumber', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('invoice.swiftCode')}</label>
                  <input
                    type="text"
                    value={formData.wireInstructions.swiftCode}
                    onChange={(e) => handleWireInstructionsChange('swiftCode', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('invoice.iban')}</label>
                  <input
                    type="text"
                    value={formData.wireInstructions.iban}
                    onChange={(e) => handleWireInstructionsChange('iban', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Banco Intermediário */}
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-md font-medium leading-6 text-gray-800 mb-4">Banco Intermediário</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">País</label>
                  <input
                    type="text"
                    value={formData.intermediaryBank?.country || ''}
                    onChange={(e) => handleFieldChange('intermediaryBank.country', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome do Banco / Bank Name</label>
                  <input
                    type="text"
                    value={formData.intermediaryBank?.bankName || ''}
                    onChange={(e) => handleFieldChange('intermediaryBank.bankName', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">SWIFT Code</label>
                  <input
                    type="text"
                    value={formData.intermediaryBank?.swiftCode || ''}
                    onChange={(e) => handleFieldChange('intermediaryBank.swiftCode', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Total e Botões */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xl font-semibold text-gray-900">
                  {t('invoice.total')}: {formatCurrency(calculateTotal(), formData.currency)}
                </div>
                {formData.tax > 0 && (
                  <div className="text-sm text-gray-600">
                    {t('invoice.includingTax', { rate: formData.tax })}
                  </div>
                )}
              </div>
              <div className="space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {id ? t('common.save') : t('common.create')}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
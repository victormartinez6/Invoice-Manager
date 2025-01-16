import React, { useEffect } from 'react';
import { Key } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

export const Settings: React.FC = () => {
  const { settings, loading, error, fetchSettings, updateSettings } = useSettingsStore();
  const [apiKey, setApiKey] = React.useState('');

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleCurrencyChange = async (currency: string) => {
    await updateSettings({ currency });
  };

  const generateApiKey = () => {
    const newKey = Math.random().toString(36).substring(2) + 
                  Math.random().toString(36).substring(2);
    setApiKey(newKey);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-2xl p-8">
        <h2 className="text-3xl font-bold text-white mb-2">Configurações</h2>
        <p className="text-primary-100">Gerencie suas preferências e configurações do sistema</p>
      </div>

      <div className="bg-white rounded-b-2xl shadow-lg p-8">
        <div className="grid gap-8">
          {/* Configurações de Pagamento */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="bg-primary-100 p-2 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Configurações de Pagamento</h3>
            </div>

            <div className="space-y-6">
              {/* Moeda Padrão */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moeda Padrão
                </label>
                <select 
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  value={settings?.currency || 'BRL'}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                >
                  <option value="BRL">Real (R$)</option>
                  <option value="USD">Dólar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">Libra (£)</option>
                </select>
              </div>

              {/* Prazo de Pagamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prazo de Pagamento
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Dias (ex: 30)"
                    value={settings?.paymentTerms || 30}
                    onChange={(e) => updateSettings({ paymentTerms: parseInt(e.target.value) })}
                  />
                  <span className="absolute right-3 top-2 text-gray-500">dias</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Número de dias para vencimento da invoice
                </p>
              </div>
            </div>
          </div>

          {/* Configurações da API */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="bg-primary-100 p-2 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Configurações da API</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chave da API
              </label>
              <div className="flex space-x-2">
                <div className="flex-grow">
                  <input
                    type="text"
                    value={apiKey}
                    readOnly
                    className="w-full px-4 py-2 bg-gray-100 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Clique em Gerar para criar uma nova chave"
                  />
                </div>
                <button
                  onClick={generateApiKey}
                  className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors inline-flex items-center"
                >
                  <Key className="h-5 w-5 mr-2" />
                  Gerar
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Use esta chave para acessar a API do sistema
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AddressInput } from './AddressInput';

interface ClientDetailsProps {
  clientName: string;
  clientAddress: Invoice['clientAddress'];
  onChange: (field: string, value: string) => void;
}

export const ClientDetails: React.FC<ClientDetailsProps> = ({
  clientName,
  clientAddress,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">{t('invoice.clientDetails')}</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('invoice.clientName')}
        </label>
        <input
          type="text"
          required
          value={clientName}
          onChange={(e) => onChange('clientName', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {t('invoice.address')}
        </label>
        <AddressInput
          address={clientAddress}
          onChange={onChange}
          prefix="clientAddress"
        />
      </div>
    </div>
  );
};
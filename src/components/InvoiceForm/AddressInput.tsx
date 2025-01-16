import React from 'react';
import { useTranslation } from 'react-i18next';

interface AddressInputProps {
  address: Invoice['clientAddress'];
  onChange: (field: string, value: string) => void;
  prefix: string;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  address,
  onChange,
  prefix,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          {t('invoice.street')}
        </label>
        <input
          type="text"
          value={address.street}
          onChange={(e) => onChange(`${prefix}.street`, e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('invoice.city')}
        </label>
        <input
          type="text"
          value={address.city}
          onChange={(e) => onChange(`${prefix}.city`, e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('invoice.state')}
        </label>
        <input
          type="text"
          value={address.state}
          onChange={(e) => onChange(`${prefix}.state`, e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('invoice.zipCode')}
        </label>
        <input
          type="text"
          value={address.zipCode}
          onChange={(e) => onChange(`${prefix}.zipCode`, e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('invoice.country')}
        </label>
        <input
          type="text"
          value={address.country}
          onChange={(e) => onChange(`${prefix}.country`, e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};
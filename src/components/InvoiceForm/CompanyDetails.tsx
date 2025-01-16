import React from 'react';
import { useTranslation } from 'react-i18next';
import { AddressInput } from './AddressInput';

interface CompanyDetailsProps {
  companyDetails: Invoice['companyDetails'];
  onChange: (details: Invoice['companyDetails']) => void;
}

export const CompanyDetails: React.FC<CompanyDetailsProps> = ({ companyDetails, onChange }) => {
  const { t } = useTranslation();

  const handleChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      onChange({
        ...companyDetails,
        [parent]: {
          ...companyDetails[parent as keyof typeof companyDetails],
          [child]: value,
        },
      });
    } else {
      onChange({ ...companyDetails, [field]: value });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">{t('invoice.companyDetails')}</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('invoice.companyName')}
        </label>
        <input
          type="text"
          value={companyDetails.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {t('invoice.address')}
        </label>
        <AddressInput
          address={companyDetails.address}
          onChange={handleChange}
          prefix="address"
        />
      </div>
    </div>
  );
};
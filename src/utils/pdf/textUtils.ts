import { Address } from '../../types/invoice';

export const formatAddress = (address: Address): string[] => {
  if (!address) return [];

  return [
    address.street,
    `${address.city}${address.state ? `, ${address.state}` : ''} ${address.zipCode || ''}`.trim(),
    address.country
  ].filter(Boolean);
};
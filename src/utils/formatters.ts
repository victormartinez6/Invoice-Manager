export const formatCurrency = (value: number, currency: string): string => {
  try {
    // Mapa de locales por moeda
    const currencyLocales: { [key: string]: string } = {
      'BRL': 'pt-BR',
      'USD': 'en-US',
      'EUR': 'de-DE',
      'GBP': 'en-GB'
    };

    // Usar o locale apropriado para a moeda ou fallback para en-US
    const locale = currencyLocales[currency] || 'en-US';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  } catch (error) {
    console.error('Erro ao formatar moeda:', error);
    return `${currency} ${value.toFixed(2)}`;
  }
};

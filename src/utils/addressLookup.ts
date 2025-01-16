import { AddressLookupResult } from '../types/invoice';

export const lookupBrazilianAddress = async (cep: string): Promise<AddressLookupResult | null> => {
  try {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return null;

    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    
    if (data.erro) {
      return null;
    }

    return {
      street: `${data.logradouro}${data.complemento ? `, ${data.complemento}` : ''}`,
      city: data.localidade,
      state: data.uf,
      zipCode: cleanCep.replace(/^(\d{5})(\d{3})/, '$1-$2')
    };
  } catch (error) {
    console.error('Error looking up Brazilian address:', error);
    return null;
  }
};

export const lookupUSAddress = async (street: string): Promise<AddressLookupResult[]> => {
  try {
    // Add more specific parameters to get better results
    const encodedAddress = encodeURIComponent(street + ', United States');
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&addressdetails=1&countrycodes=us&limit=5`,
      {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': 'Invoice Generator App'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data
      .map(item => {
        const addr = item.address;
        if (!addr) return null;

        // Build street address
        const streetParts = [
          addr.house_number,
          addr.road,
          addr.suburb
        ].filter(Boolean);

        const street = streetParts.length > 0 ? streetParts.join(' ') : '';

        // Get city (try multiple fields)
        const city = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || '';

        // Get state (try both state and state_code)
        const state = addr.state_code || addr.state || '';

        // Get ZIP code
        const zipCode = addr.postcode || '';

        // Only return if we have all required fields
        if (!street || !city || !state || !zipCode) return null;

        return {
          street,
          city,
          state,
          zipCode
        };
      })
      .filter((addr): addr is AddressLookupResult => addr !== null)
      // Remove duplicates
      .filter((addr, index, self) => 
        index === self.findIndex(a => 
          a.street === addr.street && 
          a.city === addr.city && 
          a.state === addr.state
        )
      );
  } catch (error) {
    console.error('Error looking up US address:', error);
    return [];
  }
};
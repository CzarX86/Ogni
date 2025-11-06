export interface ShippingAddress {
  postal_code: string;
  address: string;
  number: string;
  district: string;
  city: string;
  state_abbr: string;
  country_id: string;
}

export interface PackageData {
  weight: number; // in grams
  width: number;  // in cm
  height: number; // in cm
  length: number; // in cm
}

export interface ShippingQuote {
  id: number;
  name: string;
  price: number;
  currency: string;
  delivery_time: number; // in days
  delivery_range: {
    min: number;
    max: number;
  };
  company: {
    id: number;
    name: string;
    picture: string;
  };
  error?: string;
}

export class ShippingService {
  private static readonly MELHOR_ENVIO_API_URL = 'https://www.melhorenvio.com.br/api/v2/me';
  private static readonly TOKEN = process.env.REACT_APP_MELHOR_ENVIO_TOKEN || '';

  // Calculate shipping quotes
  static async calculateShipping(
    fromPostalCode: string,
    toPostalCode: string,
    packageData: PackageData,
    services?: string[]
  ): Promise<ShippingQuote[]> {
    if (!this.TOKEN || this.TOKEN === 'your_melhor_envio_token_here') {
      throw new Error('Melhor Envio API token not configured. Please set REACT_APP_MELHOR_ENVIO_TOKEN environment variable.');
    }

    try {
      const response = await fetch(`${this.MELHOR_ENVIO_API_URL}/shipment/calculate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          from: {
            postal_code: fromPostalCode,
          },
          to: {
            postal_code: toPostalCode,
          },
          package: packageData,
          options: {
            insurance_value: 0,
            receipt: false,
            own_hand: false,
            reverse: false,
            non_commercial: true,
          },
          services: services || ['correios', 'jadlog', 'azul_cargo'],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Melhor Envio API error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return data.map((quote: any) => ({
        id: quote.id,
        name: quote.name,
        price: parseFloat(quote.price),
        currency: quote.currency,
        delivery_time: quote.delivery_time,
        delivery_range: quote.delivery_range,
        company: quote.company,
        error: quote.error,
      }));
    } catch (error) {
      console.error('Error calculating shipping:', error);
      throw error;
    }
  }

  // Get available shipping services
  static async getShippingServices(): Promise<any[]> {
    if (!this.TOKEN || this.TOKEN === 'your_melhor_envio_token_here') {
      throw new Error('Melhor Envio API token not configured. Please set REACT_APP_MELHOR_ENVIO_TOKEN environment variable.');
    }

    try {
      const response = await fetch(`${this.MELHOR_ENVIO_API_URL}/shipment/services`, {
        headers: {
          'Authorization': `Bearer ${this.TOKEN}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get shipping services: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting shipping services:', error);
      throw error;
    }
  }

  // Create shipment label
  static async createShipmentLabel(shipmentData: {
    service: number;
    agency: number;
    from: ShippingAddress;
    to: ShippingAddress;
    package: PackageData;
    options: {
      insurance_value: number;
      receipt: boolean;
      own_hand: boolean;
      reverse: boolean;
      non_commercial: boolean;
    };
    products: Array<{
      name: string;
      quantity: number;
      unitary_value: number;
    }>;
  }): Promise<any> {
    if (!this.TOKEN || this.TOKEN === 'your_melhor_envio_token_here') {
      throw new Error('Melhor Envio API token not configured. Please set REACT_APP_MELHOR_ENVIO_TOKEN environment variable.');
    }

    try {
      const response = await fetch(`${this.MELHOR_ENVIO_API_URL}/shipment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(shipmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create shipment: ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating shipment label:', error);
      throw error;
    }
  }

  // Track shipment
  static async trackShipment(trackingCode: string): Promise<any> {
    if (!this.TOKEN || this.TOKEN === 'your_melhor_envio_token_here') {
      throw new Error('Melhor Envio API token not configured. Please set REACT_APP_MELHOR_ENVIO_TOKEN environment variable.');
    }

    try {
      const response = await fetch(`${this.MELHOR_ENVIO_API_URL}/shipment/track/${trackingCode}`, {
        headers: {
          'Authorization': `Bearer ${this.TOKEN}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to track shipment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error tracking shipment:', error);
      throw error;
    }
  }

  // Cancel shipment
  static async cancelShipment(shipmentId: string): Promise<any> {
    if (!this.TOKEN || this.TOKEN === 'your_melhor_envio_token_here') {
      throw new Error('Melhor Envio API token not configured. Please set REACT_APP_MELHOR_ENVIO_TOKEN environment variable.');
    }

    try {
      const response = await fetch(`${this.MELHOR_ENVIO_API_URL}/shipment/cancel/${shipmentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.TOKEN}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel shipment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error canceling shipment:', error);
      throw error;
    }
  }
}
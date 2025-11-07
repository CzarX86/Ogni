import { log } from '../utils/logger';

export interface PaymentData {
  transaction_amount: number;
  description: string;
  payment_method_id: string;
  payer: {
    email: string;
    identification: {
      type: string;
      number: string;
    };
  };
  installments?: number;
  issuer_id?: string;
}

export interface PaymentResponse {
  id: number;
  status: 'pending' | 'approved' | 'authorized' | 'in_process' | 'in_mediation' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back';
  status_detail: string;
  transaction_amount: number;
  installments: number;
  payment_method_id: string;
  date_created: string;
  date_approved?: string;
  date_last_updated: string;
}

export interface RefundResponse {
  id: number;
  payment_id: number;
  amount: number;
  date_created: string;
  status: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  payment_type_id: string;
  status: string;
  secure_thumbnail: string;
  thumbnail: string;
  deferred_capture: string;
  settings: Array<{
    card_number: {
      length: number;
      validation: string;
    };
    bin: {
      pattern: string;
      installments_pattern: string;
      exclusion_pattern: string;
    };
    security_code: {
      length: number;
      card_location: string;
      mode: string;
    };
  }>;
  additional_info_needed: string[];
  min_allowed_amount: number;
  max_allowed_amount: number;
  accreditation_time: number;
  financial_institutions: Array<{
    id: string;
    description: string;
  }>;
  processing_modes: string[];
}

export class PaymentService {
  private static readonly MERCADO_PAGO_API_URL = 'https://api.mercadopago.com/v1';
  private static readonly ACCESS_TOKEN = process.env.REACT_APP_MERCADO_PAGO_ACCESS_TOKEN || '';

  // Create payment preference for checkout
  static async createPaymentPreference(orderData: {
    items: Array<{
      title: string;
      quantity: number;
      unit_price: number;
      currency_id: string;
    }>;
    payer: {
      name: string;
      surname: string;
      email: string;
      phone?: {
        area_code: string;
        number: string;
      };
      identification?: {
        type: string;
        number: string;
      };
    };
    back_urls?: {
      success: string;
      failure: string;
      pending: string;
    };
    auto_return?: string;
    external_reference?: string;
  }): Promise<{ id: string; init_point: string }> {
    try {
      const response = await fetch(`${this.MERCADO_PAGO_API_URL}/checkout/preferences`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: orderData.items,
          payer: orderData.payer,
          back_urls: orderData.back_urls || {
            success: `${window.location.origin}/checkout/success`,
            failure: `${window.location.origin}/checkout/failure`,
            pending: `${window.location.origin}/checkout/pending`,
          },
          auto_return: orderData.auto_return || 'approved',
          external_reference: orderData.external_reference,
          notification_url: `${window.location.origin}/api/webhooks/mercadopago`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Mercado Pago API error: ${errorData.message}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        init_point: data.init_point,
      };
    } catch (error) {
      log.error('Error creating payment preference:', { error });
      throw error;
    }
  }

  // Process payment (for card payments)
  static async processPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.MERCADO_PAGO_API_URL}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Mercado Pago payment error: ${errorData.message}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error processing payment:', { error });
      throw error;
    }
  }

  // Get payment status
  static async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.MERCADO_PAGO_API_URL}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get payment status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error getting payment status:', { error });
      throw error;
    }
  }

  // Refund payment
  static async refundPayment(paymentId: string, amount?: number): Promise<RefundResponse> {
    try {
      const response = await fetch(`${this.MERCADO_PAGO_API_URL}/payments/${paymentId}/refunds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(amount ? { amount } : {}),
      });

      if (!response.ok) {
        throw new Error(`Failed to refund payment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error refunding payment:', { error });
      throw error;
    }
  }

  // Get available payment methods
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(`${this.MERCADO_PAGO_API_URL}/payment_methods`, {
        headers: {
          'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get payment methods: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      log.error('Error getting payment methods:', { error });
      throw error;
    }
  }
}
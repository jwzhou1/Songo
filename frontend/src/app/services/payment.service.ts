import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

declare var Stripe: any;

export interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  billing_details: {
    name: string;
    email: string;
    address: {
      line1: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
}

export interface PaymentRequest {
  quoteId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethodId: string;
  billingAddress: {
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  paymentId: string;
  status: 'succeeded' | 'failed' | 'processing' | 'requires_action';
  amount: number;
  currency: string;
  receiptUrl?: string;
  clientSecret?: string;
  error?: string;
}

export interface PaymentIntent {
  id: string;
  client_secret: string;
  status: string;
  amount: number;
  currency: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private stripe: any;
  private elements: any;
  private cardElement: any;
  private apiUrl = environment.apiUrl;
  
  private paymentMethodsSubject = new BehaviorSubject<PaymentMethod[]>([]);
  public paymentMethods$ = this.paymentMethodsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeStripe();
  }

  private async initializeStripe(): Promise<void> {
    try {
      // Load Stripe.js
      if (!window.Stripe) {
        await this.loadStripeScript();
      }
      
      this.stripe = Stripe(environment.stripePublishableKey);
      this.elements = this.stripe.elements();
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
    }
  }

  private loadStripeScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('stripe-script')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'stripe-script';
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Stripe.js'));
      document.head.appendChild(script);
    });
  }

  // Create and mount card element
  createCardElement(container: HTMLElement, options?: any): void {
    const defaultOptions = {
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          '::placeholder': {
            color: '#aab7c4',
          },
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: 'antialiased',
        },
        invalid: {
          color: '#9e2146',
        },
      },
      hidePostalCode: false,
    };

    this.cardElement = this.elements.create('card', { ...defaultOptions, ...options });
    this.cardElement.mount(container);

    // Listen for real-time validation errors
    this.cardElement.on('change', (event: any) => {
      const displayError = document.getElementById('card-errors');
      if (displayError) {
        if (event.error) {
          displayError.textContent = event.error.message;
        } else {
          displayError.textContent = '';
        }
      }
    });
  }

  // Create payment method from card element
  async createPaymentMethod(billingDetails: any): Promise<{ paymentMethod?: any; error?: any }> {
    if (!this.stripe || !this.cardElement) {
      return { error: { message: 'Stripe not initialized' } };
    }

    const { paymentMethod, error } = await this.stripe.createPaymentMethod({
      type: 'card',
      card: this.cardElement,
      billing_details: billingDetails,
    });

    return { paymentMethod, error };
  }

  // Process payment
  processPayment(paymentRequest: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/api/payments/process`, paymentRequest);
  }

  // Create payment intent
  createPaymentIntent(amount: number, currency: string, metadata?: any): Observable<PaymentIntent> {
    return this.http.post<PaymentIntent>(`${this.apiUrl}/api/payments/create-intent`, {
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata
    });
  }

  // Confirm payment intent
  async confirmPaymentIntent(clientSecret: string, paymentMethod?: any): Promise<{ paymentIntent?: any; error?: any }> {
    if (!this.stripe) {
      return { error: { message: 'Stripe not initialized' } };
    }

    const confirmOptions: any = {
      payment_method: paymentMethod || {
        card: this.cardElement,
      }
    };

    const { paymentIntent, error } = await this.stripe.confirmCardPayment(
      clientSecret,
      confirmOptions
    );

    return { paymentIntent, error };
  }

  // Save payment method for future use
  savePaymentMethod(userId: string, paymentMethodId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/payments/save-method`, {
      userId,
      paymentMethodId
    });
  }

  // Get saved payment methods
  getPaymentMethods(userId: string): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.apiUrl}/api/payments/methods/${userId}`);
  }

  // Delete payment method
  deletePaymentMethod(paymentMethodId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/payments/methods/${paymentMethodId}`);
  }

  // Create setup intent for saving payment method
  createSetupIntent(customerId?: string): Observable<{ client_secret: string }> {
    return this.http.post<{ client_secret: string }>(`${this.apiUrl}/api/payments/setup-intent`, {
      customer_id: customerId
    });
  }

  // Confirm setup intent
  async confirmSetupIntent(clientSecret: string, paymentMethod?: any): Promise<{ setupIntent?: any; error?: any }> {
    if (!this.stripe) {
      return { error: { message: 'Stripe not initialized' } };
    }

    const { setupIntent, error } = await this.stripe.confirmCardSetup(
      clientSecret,
      {
        payment_method: paymentMethod || {
          card: this.cardElement,
        }
      }
    );

    return { setupIntent, error };
  }

  // Format card brand for display
  formatCardBrand(brand: string): string {
    const brandMap: { [key: string]: string } = {
      'visa': 'Visa',
      'mastercard': 'Mastercard',
      'amex': 'American Express',
      'discover': 'Discover',
      'diners': 'Diners Club',
      'jcb': 'JCB',
      'unionpay': 'UnionPay'
    };
    
    return brandMap[brand] || brand.charAt(0).toUpperCase() + brand.slice(1);
  }

  // Get card icon
  getCardIcon(brand: string): string {
    const iconMap: { [key: string]: string } = {
      'visa': 'assets/images/cards/visa.png',
      'mastercard': 'assets/images/cards/mastercard.png',
      'amex': 'assets/images/cards/amex.png',
      'discover': 'assets/images/cards/discover.png',
      'diners': 'assets/images/cards/diners.png',
      'jcb': 'assets/images/cards/jcb.png',
      'unionpay': 'assets/images/cards/unionpay.png'
    };
    
    return iconMap[brand] || 'assets/images/cards/generic.png';
  }

  // Validate payment amount
  validatePaymentAmount(amount: number): { valid: boolean; error?: string } {
    if (amount <= 0) {
      return { valid: false, error: 'Payment amount must be greater than zero' };
    }
    
    if (amount > 999999.99) {
      return { valid: false, error: 'Payment amount exceeds maximum limit' };
    }
    
    return { valid: true };
  }

  // Calculate processing fee
  calculateProcessingFee(amount: number): number {
    // Stripe's standard processing fee: 2.9% + $0.30
    return Math.round((amount * 0.029 + 0.30) * 100) / 100;
  }

  // Format currency for display
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  }

  // Handle payment errors
  handlePaymentError(error: any): string {
    const errorMessages: { [key: string]: string } = {
      'card_declined': 'Your card was declined. Please try a different payment method.',
      'expired_card': 'Your card has expired. Please use a different card.',
      'incorrect_cvc': 'Your card\'s security code is incorrect.',
      'processing_error': 'An error occurred while processing your card. Please try again.',
      'incorrect_number': 'Your card number is incorrect.',
      'invalid_expiry_month': 'Your card\'s expiration month is invalid.',
      'invalid_expiry_year': 'Your card\'s expiration year is invalid.',
      'invalid_cvc': 'Your card\'s security code is invalid.',
      'insufficient_funds': 'Your card has insufficient funds.',
      'withdrawal_count_limit_exceeded': 'You have exceeded the balance or credit limit on your card.',
      'charge_exceeds_source_limit': 'The payment exceeds the maximum amount for your card.',
      'instant_payouts_unsupported': 'Your debit card does not support instant payouts.',
      'duplicate_transaction': 'A payment with identical amount and details was recently submitted.',
      'fraudulent': 'The payment has been declined as it appears to be fraudulent.',
      'generic_decline': 'Your card was declined.',
      'invalid_account': 'The account number provided is invalid.',
      'lost_card': 'The payment has been declined because the card is reported lost.',
      'merchant_blacklist': 'The payment has been declined by your card issuer.',
      'new_account_information_available': 'Your card was declined. Please contact your card issuer for more information.',
      'no_action_taken': 'The requested action could not be performed.',
      'not_permitted': 'The payment is not permitted.',
      'pickup_card': 'Your card cannot be used to make this payment.',
      'restricted_card': 'Your card cannot be used to make this payment.',
      'revocation_of_all_authorizations': 'Your card was declined.',
      'revocation_of_authorization': 'Your card was declined.',
      'security_violation': 'Your card was declined.',
      'service_not_allowed': 'The payment is not permitted.',
      'stolen_card': 'The payment has been declined because the card is reported stolen.',
      'stop_payment_order': 'The payment has been declined by your card issuer.',
      'testmode_decline': 'Your card was declined.',
      'transaction_not_allowed': 'The payment is not permitted.',
      'try_again_later': 'The payment could not be processed. Please try again later.',
      'withdrawal_count_limit_exceeded': 'You have exceeded the balance or credit limit on your card.'
    };

    return errorMessages[error.code] || error.message || 'An unexpected error occurred. Please try again.';
  }

  // Destroy card element
  destroyCardElement(): void {
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
    }
  }

  // Check if Stripe is loaded
  isStripeLoaded(): boolean {
    return !!this.stripe;
  }
}

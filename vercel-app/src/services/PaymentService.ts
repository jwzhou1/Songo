import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js'
import axios from 'axios'

export interface PaymentMethod {
  id: string
  type: 'card'
  card: {
    brand: string
    last4: string
    exp_month: number
    exp_year: number
    funding: string
    country: string
  }
  billing_details: {
    name: string
    email: string
    phone?: string
    address: {
      line1: string
      line2?: string
      city: string
      state: string
      postal_code: string
      country: string
    }
  }
  created: number
}

export interface PaymentRequest {
  amount: number
  currency: string
  paymentMethodId?: string
  savePaymentMethod?: boolean
  customerId?: string
  metadata?: { [key: string]: string }
  shipping?: {
    name: string
    address: {
      line1: string
      line2?: string
      city: string
      state: string
      postal_code: string
      country: string
    }
  }
  billing?: {
    name: string
    email: string
    phone?: string
    address: {
      line1: string
      line2?: string
      city: string
      state: string
      postal_code: string
      country: string
    }
  }
}

export interface PaymentResponse {
  success: boolean
  paymentIntentId?: string
  clientSecret?: string
  status: 'succeeded' | 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'canceled' | 'failed'
  amount: number
  currency: string
  receiptUrl?: string
  error?: {
    code: string
    message: string
    type: string
  }
  paymentMethod?: PaymentMethod
}

export interface SetupIntentResponse {
  success: boolean
  setupIntentId?: string
  clientSecret?: string
  status: string
  paymentMethod?: PaymentMethod
  error?: {
    code: string
    message: string
    type: string
  }
}

export class PaymentService {
  private stripe: Stripe | null = null
  private elements: StripeElements | null = null
  private cardElement: StripeCardElement | null = null
  private baseURL = process.env.NEXT_PUBLIC_API_URL || '/api'

  constructor() {
    this.initializeStripe()
  }

  // Initialize Stripe
  private async initializeStripe(): Promise<void> {
    try {
      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      if (!publishableKey) {
        throw new Error('Stripe publishable key not found')
      }

      this.stripe = await loadStripe(publishableKey)
      
      if (this.stripe) {
        this.elements = this.stripe.elements({
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#667eea',
              colorBackground: '#ffffff',
              colorText: '#30313d',
              colorDanger: '#df1b41',
              fontFamily: 'Roboto, system-ui, sans-serif',
              spacingUnit: '4px',
              borderRadius: '8px'
            }
          }
        })
      }
    } catch (error) {
      console.error('Failed to initialize Stripe:', error)
    }
  }

  // Create and mount card element
  createCardElement(container: HTMLElement, options?: any): StripeCardElement | null {
    if (!this.elements) {
      console.error('Stripe elements not initialized')
      return null
    }

    const defaultOptions = {
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          '::placeholder': {
            color: '#aab7c4',
          },
          fontFamily: 'Roboto, system-ui, sans-serif',
          fontSmoothing: 'antialiased',
        },
        invalid: {
          color: '#9e2146',
          iconColor: '#9e2146'
        },
        complete: {
          color: '#4caf50',
          iconColor: '#4caf50'
        }
      },
      hidePostalCode: false,
      iconStyle: 'solid' as const,
      ...options
    }

    this.cardElement = this.elements.create('card', defaultOptions)
    this.cardElement.mount(container)

    // Add event listeners
    this.cardElement.on('change', (event) => {
      const displayError = document.getElementById('card-errors')
      if (displayError) {
        if (event.error) {
          displayError.textContent = event.error.message
          displayError.style.display = 'block'
        } else {
          displayError.textContent = ''
          displayError.style.display = 'none'
        }
      }
    })

    this.cardElement.on('ready', () => {
      console.log('Card element ready')
    })

    this.cardElement.on('focus', () => {
      console.log('Card element focused')
    })

    this.cardElement.on('blur', () => {
      console.log('Card element blurred')
    })

    return this.cardElement
  }

  // Create payment method
  async createPaymentMethod(billingDetails: any): Promise<{ paymentMethod?: any; error?: any }> {
    if (!this.stripe || !this.cardElement) {
      return { error: { message: 'Stripe not initialized' } }
    }

    try {
      const { paymentMethod, error } = await this.stripe.createPaymentMethod({
        type: 'card',
        card: this.cardElement,
        billing_details: {
          name: billingDetails.name,
          email: billingDetails.email,
          phone: billingDetails.phone,
          address: {
            line1: billingDetails.address?.line1,
            line2: billingDetails.address?.line2,
            city: billingDetails.address?.city,
            state: billingDetails.address?.state,
            postal_code: billingDetails.address?.postal_code,
            country: billingDetails.address?.country || 'US'
          }
        }
      })

      return { paymentMethod, error }
    } catch (error) {
      console.error('Error creating payment method:', error)
      return { error: { message: 'Failed to create payment method' } }
    }
  }

  // Process payment
  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Create payment intent on server
      const response = await axios.post(`${this.baseURL}/payments/create-intent`, {
        amount: Math.round(paymentRequest.amount * 100), // Convert to cents
        currency: paymentRequest.currency.toLowerCase(),
        metadata: paymentRequest.metadata,
        shipping: paymentRequest.shipping,
        customer: paymentRequest.customerId,
        setup_future_usage: paymentRequest.savePaymentMethod ? 'on_session' : undefined
      })

      if (!response.data.success) {
        return {
          success: false,
          status: 'failed',
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          error: response.data.error
        }
      }

      const { client_secret, payment_intent_id } = response.data

      if (!this.stripe) {
        return {
          success: false,
          status: 'failed',
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          error: { code: 'stripe_not_initialized', message: 'Stripe not initialized', type: 'api_error' }
        }
      }

      // Confirm payment with Stripe
      let confirmResult
      if (paymentRequest.paymentMethodId) {
        // Use existing payment method
        confirmResult = await this.stripe.confirmCardPayment(client_secret, {
          payment_method: paymentRequest.paymentMethodId
        })
      } else if (this.cardElement) {
        // Use card element
        confirmResult = await this.stripe.confirmCardPayment(client_secret, {
          payment_method: {
            card: this.cardElement,
            billing_details: paymentRequest.billing
          }
        })
      } else {
        return {
          success: false,
          status: 'failed',
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          error: { code: 'no_payment_method', message: 'No payment method provided', type: 'validation_error' }
        }
      }

      if (confirmResult.error) {
        return {
          success: false,
          status: 'failed',
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          error: {
            code: confirmResult.error.code || 'payment_failed',
            message: confirmResult.error.message || 'Payment failed',
            type: confirmResult.error.type || 'card_error'
          }
        }
      }

      const paymentIntent = confirmResult.paymentIntent
      
      return {
        success: paymentIntent.status === 'succeeded',
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status as any,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        receiptUrl: (paymentIntent as any).charges?.data[0]?.receipt_url,
        paymentMethod: paymentIntent.payment_method as PaymentMethod
      }
    } catch (error) {
      console.error('Payment processing error:', error)
      return {
        success: false,
        status: 'failed',
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Payment processing failed',
          type: 'api_error'
        }
      }
    }
  }

  // Save payment method for future use
  async savePaymentMethod(customerId: string, billingDetails: any): Promise<SetupIntentResponse> {
    try {
      // Create setup intent on server
      const response = await axios.post(`${this.baseURL}/payments/create-setup-intent`, {
        customer: customerId
      })

      if (!response.data.success) {
        return {
          success: false,
          status: 'failed',
          error: response.data.error
        }
      }

      const { client_secret, setup_intent_id } = response.data

      if (!this.stripe || !this.cardElement) {
        return {
          success: false,
          status: 'failed',
          error: { code: 'stripe_not_initialized', message: 'Stripe not initialized', type: 'api_error' }
        }
      }

      // Confirm setup intent
      const { setupIntent, error } = await this.stripe.confirmCardSetup(client_secret, {
        payment_method: {
          card: this.cardElement,
          billing_details: billingDetails
        }
      })

      if (error) {
        return {
          success: false,
          status: 'failed',
          error: {
            code: error.code || 'setup_failed',
            message: error.message || 'Failed to save payment method',
            type: error.type || 'card_error'
          }
        }
      }

      return {
        success: setupIntent.status === 'succeeded',
        setupIntentId: setupIntent.id,
        status: setupIntent.status,
        paymentMethod: setupIntent.payment_method as PaymentMethod
      }
    } catch (error) {
      console.error('Error saving payment method:', error)
      return {
        success: false,
        status: 'failed',
        error: {
          code: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to save payment method',
          type: 'api_error'
        }
      }
    }
  }

  // Get saved payment methods
  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const response = await axios.get(`${this.baseURL}/payments/payment-methods/${customerId}`)
      
      if (response.data.success) {
        return response.data.paymentMethods || []
      }
      
      return []
    } catch (error) {
      console.error('Error getting payment methods:', error)
      return []
    }
  }

  // Delete payment method
  async deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      const response = await axios.delete(`${this.baseURL}/payments/payment-methods/${paymentMethodId}`)
      return response.data.success
    } catch (error) {
      console.error('Error deleting payment method:', error)
      return false
    }
  }

  // Calculate processing fee
  calculateProcessingFee(amount: number): number {
    // Stripe's standard processing fee: 2.9% + $0.30
    return Math.round((amount * 0.029 + 0.30) * 100) / 100
  }

  // Validate payment amount
  validatePaymentAmount(amount: number): { valid: boolean; error?: string } {
    if (amount <= 0) {
      return { valid: false, error: 'Payment amount must be greater than zero' }
    }
    
    if (amount < 0.50) {
      return { valid: false, error: 'Payment amount must be at least $0.50' }
    }
    
    if (amount > 999999.99) {
      return { valid: false, error: 'Payment amount exceeds maximum limit' }
    }
    
    return { valid: true }
  }

  // Format currency
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount)
  }

  // Get card brand icon
  getCardBrandIcon(brand: string): string {
    const iconMap: { [key: string]: string } = {
      'visa': '💳',
      'mastercard': '💳',
      'amex': '💳',
      'discover': '💳',
      'diners': '💳',
      'jcb': '💳',
      'unionpay': '💳'
    }
    
    return iconMap[brand.toLowerCase()] || '💳'
  }

  // Format card brand name
  formatCardBrand(brand: string): string {
    const brandMap: { [key: string]: string } = {
      'visa': 'Visa',
      'mastercard': 'Mastercard',
      'amex': 'American Express',
      'discover': 'Discover',
      'diners': 'Diners Club',
      'jcb': 'JCB',
      'unionpay': 'UnionPay'
    }
    
    return brandMap[brand.toLowerCase()] || brand.charAt(0).toUpperCase() + brand.slice(1)
  }

  // Handle payment errors
  getErrorMessage(error: any): string {
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
    }

    if (error?.code && errorMessages[error.code]) {
      return errorMessages[error.code]
    }

    if (error?.message) {
      return error.message
    }

    return 'An unexpected error occurred. Please try again.'
  }

  // Destroy card element
  destroyCardElement(): void {
    if (this.cardElement) {
      this.cardElement.destroy()
      this.cardElement = null
    }
  }

  // Check if Stripe is loaded
  isStripeLoaded(): boolean {
    return !!this.stripe
  }

  // Get Stripe instance
  getStripe(): Stripe | null {
    return this.stripe
  }

  // Get Elements instance
  getElements(): StripeElements | null {
    return this.elements
  }
}

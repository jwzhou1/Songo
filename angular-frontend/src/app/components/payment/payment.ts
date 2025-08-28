import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

interface PaymentData {
  amount: number;
  currency: string;
  shipmentId?: number;
  quoteId?: number;
  description: string;
}

interface CardDetails {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}

@Component({
  selector: 'app-payment',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatStepperModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './payment.html',
  styleUrl: './payment.scss'
})
export class PaymentComponent implements OnInit {
  paymentForm: FormGroup;
  billingForm: FormGroup;
  loading = false;
  processing = false;
  paymentSuccess = false;
  errorMessage = '';
  
  paymentData: PaymentData = {
    amount: 0,
    currency: 'USD',
    description: 'Shipping Payment'
  };

  supportedCards = [
    { name: 'Visa', icon: 'credit_card' },
    { name: 'Mastercard', icon: 'credit_card' },
    { name: 'American Express', icon: 'credit_card' },
    { name: 'Discover', icon: 'credit_card' }
  ];

  // Demo card numbers for testing
  demoCards = [
    { name: 'Visa', number: '4242424242424242', cvc: '123' },
    { name: 'Visa (Debit)', number: '4000056655665556', cvc: '123' },
    { name: 'Mastercard', number: '5555555555554444', cvc: '123' },
    { name: 'American Express', number: '378282246310005', cvc: '1234' },
    { name: 'Discover', number: '6011111111111117', cvc: '123' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.paymentForm = this.fb.group({
      cardNumber: ['4242424242424242', [Validators.required, this.cardNumberValidator]],
      expiryMonth: ['12', [Validators.required, Validators.min(1), Validators.max(12)]],
      expiryYear: ['2025', [Validators.required, Validators.min(new Date().getFullYear())]],
      cvc: ['123', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      cardName: ['Demo User', [Validators.required, Validators.minLength(2)]],
      saveCard: [false]
    });

    this.billingForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required]],
      country: ['US', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadPaymentData();
    this.loadUserBillingInfo();
  }

  // Custom validator for card numbers (accepts demo cards)
  cardNumberValidator(control: any) {
    if (!control.value) return null;

    const cardNumber = control.value.replace(/\s/g, '');

    // Demo card numbers (always valid)
    const demoNumbers = [
      '4242424242424242', // Visa
      '4000056655665556', // Visa Debit
      '5555555555554444', // Mastercard
      '378282246310005',  // American Express
      '6011111111111117'  // Discover
    ];

    if (demoNumbers.includes(cardNumber)) {
      return null; // Valid
    }

    // Basic Luhn algorithm check for other cards
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      return { invalidCard: true };
    }

    return null; // Accept any other reasonable length card for demo
  }

  loadPaymentData() {
    // Get payment data from query parameters or route state
    this.route.queryParams.subscribe(params => {
      if (params['amount']) {
        this.paymentData.amount = parseFloat(params['amount']);
      }
      if (params['shipmentId']) {
        this.paymentData.shipmentId = parseInt(params['shipmentId']);
      }
      if (params['quoteId']) {
        this.paymentData.quoteId = parseInt(params['quoteId']);
      }
      if (params['description']) {
        this.paymentData.description = params['description'];
      }
    });

    // Demo data if no parameters
    if (this.paymentData.amount === 0) {
      this.paymentData.amount = 125.50;
      this.paymentData.description = 'Shipping Service - FedEx Ground';
    }
  }

  loadUserBillingInfo() {
    // Load user data from localStorage and pre-fill billing form
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.billingForm.patchValue({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
    }
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    const matches = value.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      event.target.value = parts.join(' ');
    } else {
      event.target.value = value;
    }
  }

  getCardType(cardNumber: string): string {
    const number = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(number)) return 'Visa';
    if (/^5[1-5]/.test(number)) return 'Mastercard';
    if (/^3[47]/.test(number)) return 'American Express';
    if (/^6/.test(number)) return 'Discover';
    
    return 'Unknown';
  }

  onSubmit() {
    if (this.paymentForm.valid && this.billingForm.valid) {
      this.processing = true;
      this.errorMessage = '';

      // Simulate payment processing
      setTimeout(() => {
        // Demo: Always succeed
        this.paymentSuccess = true;
        this.processing = false;

        // Save completed shipment to user account
        this.saveCompletedShipment();

        // Redirect to success page after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/dashboard'], {
            queryParams: {
              paymentSuccess: true,
              amount: this.paymentData.amount
            }
          });
        }, 2000);

      }, 3000); // 3 second processing simulation
    } else {
      this.markFormGroupTouched(this.paymentForm);
      this.markFormGroupTouched(this.billingForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  goBack() {
    window.history.back();
  }

  // Use demo card data
  useDemoCard(cardIndex: number) {
    const demoCard = this.demoCards[cardIndex];
    if (demoCard) {
      this.paymentForm.patchValue({
        cardNumber: demoCard.number,
        cvc: demoCard.cvc,
        expiryMonth: '12',
        expiryYear: '2025',
        cardName: 'Demo User'
      });
    }
  }

  // Security: Mask card number for display
  getMaskedCardNumber(): string {
    const cardNumber = this.paymentForm.get('cardNumber')?.value || '';
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length >= 4) {
      return '**** **** **** ' + cleaned.slice(-4);
    }
    return cardNumber;
  }

  // Save completed shipment to user account
  private saveCompletedShipment() {
    try {
      const shipmentData = {
        id: Date.now(),
        trackingNumber: 'SG' + Date.now(),
        status: 'Processing',
        service: this.paymentData.description,
        carrier: this.paymentData.description.split(' ')[0] || 'FedEx',
        amount: this.paymentData.amount,
        paymentDate: new Date(),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        sender: {
          name: this.billingForm.get('firstName')?.value + ' ' + this.billingForm.get('lastName')?.value,
          email: this.billingForm.get('email')?.value
        },
        paymentMethod: this.getMaskedCardNumber()
      };

      // Get existing shipments from localStorage
      const existingShipments = JSON.parse(localStorage.getItem('user_shipments') || '[]');

      // Add new shipment
      existingShipments.unshift(shipmentData);

      // Keep only latest 20 shipments
      if (existingShipments.length > 20) {
        existingShipments.splice(20);
      }

      // Save back to localStorage
      localStorage.setItem('user_shipments', JSON.stringify(existingShipments));

      // Also save payment record
      const paymentRecord = {
        id: Date.now(),
        paymentNumber: 'PAY' + Date.now(),
        amount: this.paymentData.amount,
        date: new Date(),
        status: 'Completed',
        description: this.paymentData.description,
        cardLastFour: this.paymentForm.get('cardNumber')?.value?.slice(-4) || '****'
      };

      const existingPayments = JSON.parse(localStorage.getItem('user_payments') || '[]');
      existingPayments.unshift(paymentRecord);

      if (existingPayments.length > 20) {
        existingPayments.splice(20);
      }

      localStorage.setItem('user_payments', JSON.stringify(existingPayments));

      console.log('Shipment and payment saved successfully');

    } catch (error) {
      console.error('Error saving shipment data:', error);
    }
  }
}

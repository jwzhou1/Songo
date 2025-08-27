import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';

interface QuoteData {
  id?: number;
  quoteNumber?: string;
  service: string;
  carrier: string;
  price: number;
  estimatedDays: number;
  route?: string;
  validUntil?: Date;
  // Package details
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  // Addresses
  origin?: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  destination?: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

@Component({
  selector: 'app-shipment-create',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule
  ],
  templateUrl: './shipment-create.html',
  styleUrl: './shipment-create.scss'
})
export class ShipmentCreateComponent implements OnInit {
  shipmentForm: FormGroup;
  quoteData: QuoteData | null = null;
  loading = false;

  // Make Math available in template
  Math = Math;
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.shipmentForm = this.fb.group({
      // Sender Information
      senderName: ['', [Validators.required]],
      senderCompany: [''],
      senderPhone: ['', [Validators.required]],
      senderEmail: ['', [Validators.required, Validators.email]],
      
      // Recipient Information
      recipientName: ['', [Validators.required]],
      recipientCompany: [''],
      recipientPhone: ['', [Validators.required]],
      recipientEmail: ['', [Validators.email]],
      
      // Shipment Options
      pickupDate: [new Date(), [Validators.required]],
      deliveryInstructions: [''],
      signatureRequired: [false],
      insuranceValue: [0],
      
      // Additional Services
      saturdayDelivery: [false],
      holdAtLocation: [false],
      adultSignature: [false]
    });
  }

  ngOnInit() {
    this.loadQuoteData();
    this.loadUserData();
  }

  loadQuoteData() {
    // Get quote data from route state or query parameters
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.quoteData = navigation.extras.state as QuoteData;
    } else {
      // Try to get from query parameters
      this.route.queryParams.subscribe(params => {
        if (params['quoteId']) {
          // Load quote from saved quotes (demo data)
          this.loadSavedQuote(params['quoteId']);
        } else if (params['service'] && params['price']) {
          // Create quote data from parameters
          this.quoteData = {
            service: params['service'],
            carrier: params['carrier'] || 'FedEx',
            price: parseFloat(params['price']),
            estimatedDays: parseInt(params['estimatedDays']) || 1,
            route: params['route'] || 'Selected Route'
          };
        }
      });
    }

    // Fallback demo data if no quote data found
    if (!this.quoteData) {
      this.quoteData = {
        service: 'FedEx Express Overnight',
        carrier: 'FedEx',
        price: 45.99,
        estimatedDays: 1,
        route: 'Demo Route'
      };
    }
  }

  loadSavedQuote(quoteId: string) {
    // Demo saved quotes data
    const savedQuotes = [
      {
        id: 1,
        quoteNumber: 'QT001',
        service: 'FedEx Ground',
        carrier: 'FedEx',
        price: 125.50,
        estimatedDays: 5,
        route: 'Dallas, TX → Houston, TX',
        validUntil: new Date('2024-01-25'),
        weight: 5.2,
        dimensions: { length: 12, width: 8, height: 6 },
        origin: {
          address: '123 Main St',
          city: 'Dallas',
          state: 'TX',
          zip: '75201',
          country: 'US'
        },
        destination: {
          address: '456 Oak Ave',
          city: 'Houston',
          state: 'TX',
          zip: '77001',
          country: 'US'
        }
      },
      {
        id: 2,
        quoteNumber: 'QT002',
        service: 'UPS Standard',
        carrier: 'UPS',
        price: 89.25,
        estimatedDays: 3,
        route: 'Phoenix, AZ → Denver, CO',
        validUntil: new Date('2024-01-22')
      }
    ];

    const quote = savedQuotes.find(q => q.id.toString() === quoteId);
    if (quote) {
      this.quoteData = quote;
    }
  }

  loadUserData() {
    // Pre-fill sender information from user data
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.shipmentForm.patchValue({
          senderName: `${user.firstName} ${user.lastName}`,
          senderEmail: user.email
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }
  }

  onConfirm() {
    if (this.shipmentForm.valid && this.quoteData) {
      this.loading = true;

      // Prepare shipment data
      const shipmentData = {
        quote: this.quoteData,
        shipmentDetails: this.shipmentForm.value,
        totalAmount: this.calculateTotalAmount()
      };

      // Navigate to payment page with shipment data
      setTimeout(() => {
        this.router.navigate(['/payment'], {
          queryParams: {
            amount: shipmentData.totalAmount,
            description: `${this.quoteData?.carrier} ${this.quoteData?.service}`,
            service: this.quoteData?.service,
            carrier: this.quoteData?.carrier
          },
          state: shipmentData
        });
      }, 1000);
    } else {
      this.markFormGroupTouched();
    }
  }

  calculateTotalAmount(): number {
    let total = this.quoteData?.price || 0;
    const formValue = this.shipmentForm.value;

    // Add additional service fees
    if (formValue.saturdayDelivery) total += 15.00;
    if (formValue.adultSignature) total += 5.50;
    if (formValue.insuranceValue > 0) {
      total += Math.max(2.50, formValue.insuranceValue * 0.01);
    }

    return Math.round(total * 100) / 100;
  }

  private markFormGroupTouched() {
    Object.keys(this.shipmentForm.controls).forEach(key => {
      this.shipmentForm.get(key)?.markAsTouched();
    });
  }

  goBack() {
    window.history.back();
  }

  getEstimatedDeliveryDate(): Date {
    const today = new Date();
    const pickupDate = this.shipmentForm.get('pickupDate')?.value || today;
    const deliveryDate = new Date(pickupDate);
    deliveryDate.setDate(deliveryDate.getDate() + (this.quoteData?.estimatedDays || 1));
    return deliveryDate;
  }
}

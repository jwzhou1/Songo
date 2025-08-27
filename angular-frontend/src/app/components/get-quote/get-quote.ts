import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-get-quote',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './get-quote.html',
  styleUrl: './get-quote.scss'
})
export class GetQuoteComponent {
  quoteForm: FormGroup;
  quotes: any[] = [];
  loading = false;

  packageTypes = [
    { value: 'envelope', label: 'Envelope' },
    { value: 'package', label: 'Package' },
    { value: 'box', label: 'Box' },
    { value: 'tube', label: 'Tube' }
  ];

  constructor(private fb: FormBuilder, private router: Router) {
    this.quoteForm = this.fb.group({
      fromAddress: ['', Validators.required],
      fromCity: ['', Validators.required],
      fromPostal: ['', Validators.required],
      toAddress: ['', Validators.required],
      toCity: ['', Validators.required],
      toPostal: ['', Validators.required],
      packageType: ['package', Validators.required],
      weight: ['', [Validators.required, Validators.min(0.1)]],
      length: ['', [Validators.required, Validators.min(1)]],
      width: ['', [Validators.required, Validators.min(1)]],
      height: ['', [Validators.required, Validators.min(1)]]
    });
  }

  onSubmit() {
    if (this.quoteForm.valid) {
      this.loading = true;
      // Simulate API call
      setTimeout(() => {
        this.quotes = [
          {
            carrier: 'FedEx',
            service: 'Express Overnight',
            price: 45.99,
            deliveryTime: '1 business day',
            estimatedDays: 1,
            icon: 'flight_takeoff'
          },
          {
            carrier: 'UPS',
            service: 'Next Day Air',
            price: 42.50,
            deliveryTime: '1 business day',
            estimatedDays: 1,
            icon: 'flight_takeoff'
          },
          {
            carrier: 'FedEx',
            service: 'Ground',
            price: 12.99,
            deliveryTime: '3-5 business days',
            estimatedDays: 4,
            icon: 'local_shipping'
          },
          {
            carrier: 'UPS',
            service: 'Ground',
            price: 11.75,
            deliveryTime: '3-5 business days',
            estimatedDays: 4,
            icon: 'local_shipping'
          }
        ];
        this.loading = false;
      }, 2000);
    }
  }

  selectQuote(quote: any) {
    // Navigate to shipment create page with selected quote
    this.router.navigate(['/shipment-create'], {
      queryParams: {
        service: quote.service,
        carrier: quote.carrier,
        price: quote.price,
        estimatedDays: quote.estimatedDays,
        route: `${this.quoteForm.get('fromCity')?.value} → ${this.quoteForm.get('toCity')?.value}`
      },
      state: {
        service: quote.service,
        carrier: quote.carrier,
        price: quote.price,
        estimatedDays: quote.estimatedDays,
        weight: this.quoteForm.get('weight')?.value,
        dimensions: {
          length: this.quoteForm.get('length')?.value,
          width: this.quoteForm.get('width')?.value,
          height: this.quoteForm.get('height')?.value
        },
        origin: {
          address: this.quoteForm.get('fromAddress')?.value,
          city: this.quoteForm.get('fromCity')?.value,
          zip: this.quoteForm.get('fromPostal')?.value,
          country: 'US'
        },
        destination: {
          address: this.quoteForm.get('toAddress')?.value,
          city: this.quoteForm.get('toCity')?.value,
          zip: this.quoteForm.get('toPostal')?.value,
          country: 'US'
        }
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { QuoteService, QuoteRequest, ShipmentType, QuickQuoteResponse } from '../../../services/quote.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-get-quote',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './get-quote.component.html',
  styleUrls: ['./get-quote.component.scss']
})
export class GetQuoteComponent implements OnInit {
  quoteForm!: FormGroup;
  loading = false;
  submitted = false;
  quickQuoteResult: QuickQuoteResponse | null = null;
  shipmentTypes = this.quoteService.getShipmentTypes();
  isAuthenticated = false;

  constructor(
    private formBuilder: FormBuilder,
    private quoteService: QuoteService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    
    this.quoteForm = this.formBuilder.group({
      // Origin
      originAddress: ['', Validators.required],
      originCity: ['', Validators.required],
      originState: ['', Validators.required],
      originZip: ['', Validators.required],
      originCountry: ['USA', Validators.required],
      
      // Destination
      destinationAddress: ['', Validators.required],
      destinationCity: ['', Validators.required],
      destinationState: ['', Validators.required],
      destinationZip: ['', Validators.required],
      destinationCountry: ['USA', Validators.required],
      
      // Shipment details
      shipmentType: ['', Validators.required],
      weight: ['', [Validators.required, Validators.min(0.1)]],
      weightUnit: ['lbs'],
      dimensionsLength: [''],
      dimensionsWidth: [''],
      dimensionsHeight: [''],
      dimensionsUnit: ['in'],
      packageCount: [1, [Validators.required, Validators.min(1)]],
      cargoDescription: [''],
      cargoValue: [''],
      specialInstructions: ['']
    });
  }

  get f() { return this.quoteForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    if (this.quoteForm.invalid) {
      return;
    }

    this.loading = true;
    const quoteRequest: QuoteRequest = this.quoteForm.value;

    if (this.isAuthenticated) {
      // Create official quote for authenticated users
      this.quoteService.createQuote(quoteRequest)
        .subscribe({
          next: (quote) => {
            this.snackBar.open('Quote created successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/quotes', quote.id]);
          },
          error: (error) => {
            this.snackBar.open(error.message || 'Failed to create quote', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.loading = false;
          }
        });
    } else {
      // Get quick quote for non-authenticated users
      this.quoteService.getQuickQuote(quoteRequest)
        .subscribe({
          next: (result) => {
            this.quickQuoteResult = result;
            this.loading = false;
            this.snackBar.open('Quick quote generated!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            this.snackBar.open(error.message || 'Failed to get quick quote', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.loading = false;
          }
        });
    }
  }

  resetForm(): void {
    this.quoteForm.reset();
    this.quickQuoteResult = null;
    this.submitted = false;
    
    // Reset default values
    this.quoteForm.patchValue({
      originCountry: 'USA',
      destinationCountry: 'USA',
      weightUnit: 'lbs',
      dimensionsUnit: 'in',
      packageCount: 1
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login'], { queryParams: { returnUrl: '/get-quote' } });
  }

  goToRegister(): void {
    this.router.navigate(['/register'], { queryParams: { returnUrl: '/get-quote' } });
  }

  createOfficialQuote(): void {
    if (!this.isAuthenticated) {
      this.goToLogin();
      return;
    }

    // Submit the form to create an official quote
    this.onSubmit();
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss']
})
export class TrackingComponent implements OnInit {
  trackingForm!: FormGroup;
  loading = false;
  submitted = false;
  trackingResult: any = null;

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.trackingForm = this.formBuilder.group({
      trackingNumber: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  get f() { return this.trackingForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    if (this.trackingForm.invalid) {
      return;
    }

    this.loading = true;
    
    // Simulate tracking API call
    setTimeout(() => {
      this.trackingResult = {
        trackingNumber: this.trackingForm.value.trackingNumber,
        status: 'IN_TRANSIT',
        statusDescription: 'Package is in transit',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        events: [
          {
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            status: 'PICKED_UP',
            description: 'Package picked up from origin',
            location: 'New York, NY'
          },
          {
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            status: 'IN_TRANSIT',
            description: 'Package is in transit',
            location: 'Chicago, IL'
          },
          {
            date: new Date(),
            status: 'OUT_FOR_DELIVERY',
            description: 'Package is out for delivery',
            location: 'Los Angeles, CA'
          }
        ]
      };
      
      this.loading = false;
      this.snackBar.open('Tracking information retrieved!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }, 1500);
  }

  resetForm(): void {
    this.trackingForm.reset();
    this.trackingResult = null;
    this.submitted = false;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'PICKED_UP':
        return 'local_shipping';
      case 'IN_TRANSIT':
        return 'flight';
      case 'OUT_FOR_DELIVERY':
        return 'delivery_dining';
      case 'DELIVERED':
        return 'check_circle';
      default:
        return 'info';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PICKED_UP':
        return 'primary';
      case 'IN_TRANSIT':
        return 'accent';
      case 'OUT_FOR_DELIVERY':
        return 'warn';
      case 'DELIVERED':
        return 'primary';
      default:
        return '';
    }
  }
}

import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TrackingMapService, TrackingRoute, TrackingLocation } from '../../services/tracking-map.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule
  ],
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss']
})
export class TrackingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  trackingForm!: FormGroup;
  loading = false;
  submitted = false;
  trackingResult: any = null;
  trackingRoute: TrackingRoute | null = null;
  realTimeUpdates = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private trackingMapService: TrackingMapService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.trackingForm = this.formBuilder.group({
      trackingNumber: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngAfterViewInit(): void {
    // Initialize map after view is ready
    if (this.mapContainer) {
      this.trackingMapService.initializeMap(this.mapContainer.nativeElement);
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.trackingMapService.clearMap();
  }

  get f() { return this.trackingForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    if (this.trackingForm.invalid) {
      return;
    }

    this.loading = true;
    const trackingNumber = this.trackingForm.value.trackingNumber;

    // Call real tracking API
    this.http.get<any>(`${environment.apiUrl}/api/tracking/${trackingNumber}`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.trackingResult = response.data;
            this.createTrackingRoute(response.data);
            this.loading = false;

            this.snackBar.open('Tracking information retrieved!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });

            // Start real-time updates if available
            this.startRealTimeTracking(trackingNumber);
          } else {
            this.handleTrackingError('Tracking information not found');
          }
        },
        error: (error) => {
          console.error('Tracking error:', error);
          this.handleTrackingError('Failed to retrieve tracking information');
        }
      });
  }

  private handleTrackingError(message: string): void {
    this.loading = false;
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private createTrackingRoute(trackingData: any): void {
    // Convert tracking data to route format for map display
    const locations: TrackingLocation[] = trackingData.events
      .filter((event: any) => event.location.coordinates)
      .map((event: any) => ({
        lat: event.location.coordinates.lat,
        lng: event.location.coordinates.lng,
        timestamp: event.timestamp,
        status: event.status,
        description: event.statusDescription,
        city: event.location.city,
        state: event.location.state
      }));

    if (locations.length > 0) {
      this.trackingRoute = {
        trackingNumber: trackingData.trackingNumber,
        carrier: trackingData.carrier,
        currentLocation: locations[locations.length - 1],
        locations,
        estimatedDelivery: trackingData.estimatedDelivery,
        origin: {
          lat: locations[0].lat,
          lng: locations[0].lng,
          address: trackingData.shipmentInfo?.origin || 'Origin'
        },
        destination: {
          lat: 34.0522, // Default to LA for demo
          lng: -118.2437,
          address: trackingData.shipmentInfo?.destination || 'Destination'
        }
      };

      // Display route on map
      this.trackingMapService.displayTrackingRoute(this.trackingRoute);
    }
  }

  private startRealTimeTracking(trackingNumber: string): void {
    if (this.realTimeUpdates) return;

    this.realTimeUpdates = true;

    // Poll for updates every 30 seconds
    const updateSubscription = interval(30000)
      .pipe(
        switchMap(() => this.http.get<any>(`${environment.apiUrl}/api/tracking/${trackingNumber}`))
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data.events.length > this.trackingResult.events.length) {
            // New tracking events found
            this.trackingResult = response.data;
            this.createTrackingRoute(response.data);

            this.snackBar.open('Tracking information updated!', 'Close', {
              duration: 2000,
              panelClass: ['success-snackbar']
            });
          }
        },
        error: (error) => {
          console.error('Real-time tracking error:', error);
        }
      });

    this.subscriptions.push(updateSubscription);
  }

  toggleRealTimeUpdates(): void {
    this.realTimeUpdates = !this.realTimeUpdates;

    if (!this.realTimeUpdates) {
      // Stop real-time updates
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions = [];
    } else if (this.trackingResult) {
      // Restart real-time updates
      this.startRealTimeTracking(this.trackingResult.trackingNumber);
    }
  }

  resetForm(): void {
    this.trackingForm.reset();
    this.trackingResult = null;
    this.trackingRoute = null;
    this.submitted = false;
    this.realTimeUpdates = false;

    // Clear subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];

    // Clear map
    this.trackingMapService.clearMap();
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

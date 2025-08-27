import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';

interface TrackingEvent {
  date: Date;
  location: string;
  status: string;
  description: string;
  icon: string;
  coordinates: { lat: number; lng: number };
  completed: boolean;
  current?: boolean;
  estimated?: boolean;
}

@Component({
  selector: 'app-tracking',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTabsModule
  ],
  templateUrl: './tracking.html',
  styleUrl: './tracking.scss'
})
export class TrackingComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  trackingForm: FormGroup;
  trackingResult: any = null;
  loading = false;
  map: any = null;

  // Sample tracking data with coordinates for map
  sampleTrackingData = {
    'SG123456789': {
      trackingNumber: 'SG123456789',
      carrier: 'FedEx Express',
      service: 'FedEx Express Overnight',
      status: 'Out for Delivery',
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000),
      currentLocation: 'Montreal, QC',
      origin: { name: 'Toronto, ON', lat: 43.6532, lng: -79.3832 },
      destination: { name: 'Montreal, QC', lat: 45.5017, lng: -73.5673 },
      progress: 85,
      weight: '2.5 lbs',
      dimensions: '12" x 8" x 6"',
      events: [
        {
          date: new Date('2024-01-26T09:15:00'),
          location: 'Toronto, ON',
          status: 'Package picked up',
          description: 'Package has been picked up by FedEx',
          icon: 'inventory',
          coordinates: { lat: 43.6532, lng: -79.3832 },
          completed: true
        },
        {
          date: new Date('2024-01-26T14:30:00'),
          location: 'Toronto Sort Facility, ON',
          status: 'Arrived at facility',
          description: 'Package arrived at sorting facility',
          icon: 'warehouse',
          coordinates: { lat: 43.6532, lng: -79.3832 },
          completed: true
        },
        {
          date: new Date('2024-01-26T23:45:00'),
          location: 'Toronto Sort Facility, ON',
          status: 'Departed facility',
          description: 'Package departed from facility',
          icon: 'local_shipping',
          coordinates: { lat: 43.6532, lng: -79.3832 },
          completed: true
        },
        {
          date: new Date('2024-01-27T06:20:00'),
          location: 'In Transit to Montreal',
          status: 'In transit',
          description: 'Package is on the way to destination',
          icon: 'flight_takeoff',
          coordinates: { lat: 44.5, lng: -76.5 },
          completed: true
        },
        {
          date: new Date('2024-01-27T08:15:00'),
          location: 'Montreal Distribution Center, QC',
          status: 'Arrived at destination facility',
          description: 'Package arrived at destination facility',
          icon: 'warehouse',
          coordinates: { lat: 45.5017, lng: -73.5673 },
          completed: true
        },
        {
          date: new Date('2024-01-27T10:30:00'),
          location: 'Montreal, QC',
          status: 'Out for delivery',
          description: 'Package is out for delivery',
          icon: 'delivery_dining',
          coordinates: { lat: 45.5017, lng: -73.5673 },
          completed: false,
          current: true
        },
        {
          date: new Date('2024-01-27T16:00:00'),
          location: 'Montreal, QC',
          status: 'Delivered',
          description: 'Package will be delivered',
          icon: 'check_circle',
          coordinates: { lat: 45.5017, lng: -73.5673 },
          completed: false,
          estimated: true
        }
      ]
    }
  };

  constructor(private fb: FormBuilder) {
    this.trackingForm = this.fb.group({
      trackingNumber: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Check if there's a tracking number from user's shipments
    this.loadUserShipments();
  }

  ngAfterViewInit() {
    // Initialize map after view is ready
    if (this.trackingResult) {
      setTimeout(() => this.initializeMap(), 100);
    }
  }

  loadUserShipments() {
    const userShipments = JSON.parse(localStorage.getItem('user_shipments') || '[]');
    if (userShipments.length > 0) {
      // Pre-populate with the most recent shipment's tracking number
      const recentShipment = userShipments[0];
      this.trackingForm.patchValue({
        trackingNumber: recentShipment.trackingNumber
      });
    }
  }

  onSubmit() {
    if (this.trackingForm.valid) {
      this.loading = true;
      const trackingNumber = this.trackingForm.value.trackingNumber;

      // Simulate API call
      setTimeout(() => {
        // Check if it's a sample tracking number or user's shipment
        if (this.sampleTrackingData[trackingNumber as keyof typeof this.sampleTrackingData]) {
          this.trackingResult = this.sampleTrackingData[trackingNumber as keyof typeof this.sampleTrackingData];
        } else {
          // Check user's shipments
          const userShipments = JSON.parse(localStorage.getItem('user_shipments') || '[]');
          const userShipment = userShipments.find((s: any) => s.trackingNumber === trackingNumber);

          if (userShipment) {
            this.trackingResult = this.createTrackingDataFromShipment(userShipment);
          } else {
            // Default demo data
            this.trackingResult = {
              trackingNumber: trackingNumber,
              carrier: 'FedEx Express',
              service: 'FedEx Express Overnight',
              status: 'In Transit',
              estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
              currentLocation: 'Processing Center',
              origin: { name: 'Origin City', lat: 40.7128, lng: -74.0060 },
              destination: { name: 'Destination City', lat: 34.0522, lng: -118.2437 },
              progress: 45,
              weight: '1.0 lbs',
              dimensions: '10" x 6" x 4"',
              events: [
                {
                  date: new Date(Date.now() - 24 * 60 * 60 * 1000),
                  location: 'Origin City',
                  status: 'Package picked up',
                  description: 'Package has been picked up',
                  icon: 'inventory',
                  coordinates: { lat: 40.7128, lng: -74.0060 },
                  completed: true
                },
                {
                  date: new Date(Date.now() - 12 * 60 * 60 * 1000),
                  location: 'Processing Center',
                  status: 'In transit',
                  description: 'Package is being processed',
                  icon: 'local_shipping',
                  coordinates: { lat: 37.7749, lng: -122.4194 },
                  completed: false,
                  current: true
                },
                {
                  date: new Date(Date.now() + 24 * 60 * 60 * 1000),
                  location: 'Destination City',
                  status: 'Delivered',
                  description: 'Package will be delivered',
                  icon: 'check_circle',
                  coordinates: { lat: 34.0522, lng: -118.2437 },
                  completed: false,
                  estimated: true
                }
              ]
            };
          }
        }

        this.loading = false;
        // Initialize map after data is loaded
        setTimeout(() => this.initializeMap(), 100);
      }, 1500);
    }
  }

  createTrackingDataFromShipment(shipment: any) {
    const now = new Date();
    const daysSincePayment = Math.floor((now.getTime() - new Date(shipment.paymentDate).getTime()) / (1000 * 60 * 60 * 24));

    let status = 'Processing';
    let progress = 20;

    if (daysSincePayment >= 1) {
      status = 'In Transit';
      progress = 60;
    }
    if (daysSincePayment >= 2) {
      status = 'Out for Delivery';
      progress = 85;
    }
    if (daysSincePayment >= 3) {
      status = 'Delivered';
      progress = 100;
    }

    return {
      trackingNumber: shipment.trackingNumber,
      carrier: shipment.carrier,
      service: shipment.service,
      status: status,
      estimatedDelivery: shipment.estimatedDelivery,
      currentLocation: 'Distribution Center',
      origin: { name: 'Pickup Location', lat: 40.7128, lng: -74.0060 },
      destination: { name: 'Delivery Location', lat: 34.0522, lng: -118.2437 },
      progress: progress,
      weight: '2.0 lbs',
      dimensions: '12" x 8" x 6"',
      events: this.generateEventsForShipment(shipment, daysSincePayment)
    };
  }

  generateEventsForShipment(shipment: any, daysSincePayment: number): TrackingEvent[] {
    const events: TrackingEvent[] = [
      {
        date: new Date(shipment.paymentDate),
        location: 'Origin',
        status: 'Order processed',
        description: 'Your order has been processed and payment confirmed',
        icon: 'receipt',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        completed: true
      }
    ];

    if (daysSincePayment >= 1) {
      events.push({
        date: new Date(new Date(shipment.paymentDate).getTime() + 24 * 60 * 60 * 1000),
        location: 'Pickup Location',
        status: 'Package picked up',
        description: 'Package has been picked up by carrier',
        icon: 'inventory',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        completed: true
      });
    }

    if (daysSincePayment >= 2) {
      events.push({
        date: new Date(new Date(shipment.paymentDate).getTime() + 48 * 60 * 60 * 1000),
        location: 'Distribution Center',
        status: 'In transit',
        description: 'Package is on the way to destination',
        icon: 'local_shipping',
        coordinates: { lat: 37.7749, lng: -122.4194 },
        completed: daysSincePayment > 2,
        current: daysSincePayment === 2
      });
    }

    events.push({
      date: shipment.estimatedDelivery,
      location: 'Destination',
      status: daysSincePayment >= 3 ? 'Delivered' : 'Estimated delivery',
      description: daysSincePayment >= 3 ? 'Package has been delivered' : 'Package will be delivered',
      icon: 'check_circle',
      coordinates: { lat: 34.0522, lng: -118.2437 },
      completed: daysSincePayment >= 3,
      estimated: daysSincePayment < 3
    });

    return events;
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'delivered': return 'success';
      case 'out for delivery': return 'primary';
      case 'in transit': return 'accent';
      case 'processing': return 'warn';
      default: return 'basic';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'delivered': return 'check_circle';
      case 'out for delivery': return 'delivery_dining';
      case 'in transit': return 'local_shipping';
      case 'processing': return 'hourglass_empty';
      default: return 'info';
    }
  }

  initializeMap() {
    if (!this.mapContainer || !this.trackingResult) return;

    // Simple map implementation using CSS and positioning
    // In a real app, you would use Google Maps, Leaflet, or similar
    const mapElement = this.mapContainer.nativeElement;
    mapElement.innerHTML = this.generateMapHTML();
  }

  generateMapHTML(): string {
    if (!this.trackingResult || !this.trackingResult.events) return '';

    const events = this.trackingResult.events.filter((e: any) => e.coordinates);
    if (events.length === 0) return '<div class="no-map">Map data not available</div>';

    let mapHTML = '<div class="route-map">';

    // Add route line
    mapHTML += '<div class="route-line"></div>';

    // Add location markers
    events.forEach((event: any, index: number) => {
      const isCompleted = event.completed;
      const isCurrent = event.current;
      const isEstimated = event.estimated;

      let markerClass = 'location-marker';
      if (isCompleted) markerClass += ' completed';
      if (isCurrent) markerClass += ' current';
      if (isEstimated) markerClass += ' estimated';

      const leftPosition = (index / (events.length - 1)) * 80 + 10; // Distribute across 80% width

      mapHTML += `
        <div class="${markerClass}" style="left: ${leftPosition}%">
          <div class="marker-icon">
            <mat-icon>${event.icon}</mat-icon>
          </div>
          <div class="marker-label">
            <div class="location-name">${event.location}</div>
            <div class="event-time">${event.date.toLocaleDateString()}</div>
          </div>
        </div>
      `;
    });

    mapHTML += '</div>';
    return mapHTML;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getProgressPercentage(): number {
    return this.trackingResult?.progress || 0;
  }

  reset() {
    this.trackingResult = null;
    this.trackingForm.reset();
  }
}

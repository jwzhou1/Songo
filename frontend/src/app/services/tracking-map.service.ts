import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

declare var google: any;

export interface TrackingLocation {
  lat: number;
  lng: number;
  timestamp: string;
  status: string;
  description: string;
  city: string;
  state: string;
}

export interface TrackingRoute {
  trackingNumber: string;
  carrier: string;
  currentLocation: TrackingLocation;
  locations: TrackingLocation[];
  estimatedDelivery?: string;
  origin: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
}

@Injectable({
  providedIn: 'root'
})
export class TrackingMapService {
  private map: any;
  private directionsService: any;
  private directionsRenderer: any;
  private markers: any[] = [];
  private trackingRouteSubject = new BehaviorSubject<TrackingRoute | null>(null);
  
  public trackingRoute$: Observable<TrackingRoute | null> = this.trackingRouteSubject.asObservable();

  constructor() {
    this.initializeGoogleMaps();
  }

  private async initializeGoogleMaps(): Promise<void> {
    // Load Google Maps API if not already loaded
    if (typeof google === 'undefined') {
      await this.loadGoogleMapsScript();
    }
    
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true, // We'll add custom markers
      polylineOptions: {
        strokeColor: '#4285F4',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    });
  }

  private loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.getGoogleMapsApiKey()}&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps API'));
      
      document.head.appendChild(script);
    });
  }

  private getGoogleMapsApiKey(): string {
    // In production, this would come from environment variables
    return 'YOUR_GOOGLE_MAPS_API_KEY';
  }

  initializeMap(container: HTMLElement): void {
    const mapOptions = {
      zoom: 4,
      center: { lat: 39.8283, lng: -98.5795 }, // Center of USA
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'all',
          elementType: 'geometry.fill',
          stylers: [{ weight: '2.00' }]
        },
        {
          featureType: 'all',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#9c9c9c' }]
        },
        {
          featureType: 'all',
          elementType: 'labels.text',
          stylers: [{ visibility: 'on' }]
        }
      ]
    };

    this.map = new google.maps.Map(container, mapOptions);
    this.directionsRenderer.setMap(this.map);
  }

  displayTrackingRoute(trackingRoute: TrackingRoute): void {
    this.clearMap();
    this.trackingRouteSubject.next(trackingRoute);

    // Add origin marker
    this.addMarker(
      trackingRoute.origin,
      'Origin',
      'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      trackingRoute.origin.address
    );

    // Add destination marker
    this.addMarker(
      trackingRoute.destination,
      'Destination',
      'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      trackingRoute.destination.address
    );

    // Add tracking location markers
    trackingRoute.locations.forEach((location, index) => {
      const isCurrentLocation = index === trackingRoute.locations.length - 1;
      const icon = isCurrentLocation 
        ? 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        : 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
      
      this.addMarker(
        { lat: location.lat, lng: location.lng },
        location.status,
        icon,
        `${location.description}\n${location.city}, ${location.state}\n${new Date(location.timestamp).toLocaleString()}`
      );
    });

    // Draw route if we have tracking locations
    if (trackingRoute.locations.length > 0) {
      this.drawTrackingPath(trackingRoute);
    }

    // Fit map to show all markers
    this.fitMapToMarkers();
  }

  private addMarker(position: { lat: number; lng: number }, title: string, icon: string, description: string): void {
    const marker = new google.maps.Marker({
      position,
      map: this.map,
      title,
      icon: {
        url: icon,
        scaledSize: new google.maps.Size(32, 32)
      },
      animation: google.maps.Animation.DROP
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="max-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: #333;">${title}</h4>
          <p style="margin: 0; font-size: 14px; line-height: 1.4;">${description}</p>
        </div>
      `
    });

    marker.addListener('click', () => {
      // Close all other info windows
      this.markers.forEach(m => {
        if (m.infoWindow) {
          m.infoWindow.close();
        }
      });
      
      infoWindow.open(this.map, marker);
    });

    this.markers.push({ marker, infoWindow });
  }

  private drawTrackingPath(trackingRoute: TrackingRoute): void {
    const path = [
      trackingRoute.origin,
      ...trackingRoute.locations.map(loc => ({ lat: loc.lat, lng: loc.lng })),
      trackingRoute.destination
    ];

    // Create a polyline to show the tracking path
    const trackingPath = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#FF6B35',
      strokeOpacity: 1.0,
      strokeWeight: 3,
      icons: [{
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 3,
          strokeColor: '#FF6B35'
        },
        offset: '100%',
        repeat: '100px'
      }]
    });

    trackingPath.setMap(this.map);

    // Animate the path
    this.animateTrackingPath(trackingPath);
  }

  private animateTrackingPath(polyline: any): void {
    let count = 0;
    const icons = polyline.get('icons');
    
    const animate = () => {
      count = (count + 1) % 200;
      
      icons[0].offset = (count / 2) + '%';
      polyline.set('icons', icons);
      
      setTimeout(animate, 100);
    };
    
    animate();
  }

  private fitMapToMarkers(): void {
    if (this.markers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    this.markers.forEach(markerObj => {
      bounds.extend(markerObj.marker.getPosition());
    });

    this.map.fitBounds(bounds);
    
    // Ensure minimum zoom level
    google.maps.event.addListenerOnce(this.map, 'bounds_changed', () => {
      if (this.map.getZoom() > 15) {
        this.map.setZoom(15);
      }
    });
  }

  clearMap(): void {
    // Remove all markers
    this.markers.forEach(markerObj => {
      markerObj.marker.setMap(null);
      if (markerObj.infoWindow) {
        markerObj.infoWindow.close();
      }
    });
    this.markers = [];

    // Clear directions
    this.directionsRenderer.setDirections({ routes: [] });
  }

  // Real-time tracking simulation
  simulateRealTimeTracking(trackingNumber: string): Observable<TrackingLocation> {
    return new Observable(observer => {
      const locations: TrackingLocation[] = [
        {
          lat: 40.7128,
          lng: -74.0060,
          timestamp: new Date().toISOString(),
          status: 'PICKED_UP',
          description: 'Package picked up',
          city: 'New York',
          state: 'NY'
        },
        {
          lat: 41.8781,
          lng: -87.6298,
          timestamp: new Date(Date.now() + 3600000).toISOString(),
          status: 'IN_TRANSIT',
          description: 'In transit to sorting facility',
          city: 'Chicago',
          state: 'IL'
        },
        {
          lat: 39.7392,
          lng: -104.9903,
          timestamp: new Date(Date.now() + 7200000).toISOString(),
          status: 'IN_TRANSIT',
          description: 'Arrived at sorting facility',
          city: 'Denver',
          state: 'CO'
        },
        {
          lat: 34.0522,
          lng: -118.2437,
          timestamp: new Date(Date.now() + 10800000).toISOString(),
          status: 'OUT_FOR_DELIVERY',
          description: 'Out for delivery',
          city: 'Los Angeles',
          state: 'CA'
        }
      ];

      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < locations.length) {
          observer.next(locations[currentIndex]);
          currentIndex++;
        } else {
          observer.complete();
          clearInterval(interval);
        }
      }, 2000); // Update every 2 seconds

      return () => clearInterval(interval);
    });
  }

  // Calculate estimated delivery time based on current location and destination
  calculateEstimatedDelivery(currentLocation: TrackingLocation, destination: { lat: number; lng: number }): Promise<string> {
    return new Promise((resolve) => {
      const service = new google.maps.DistanceMatrixService();
      
      service.getDistanceMatrix({
        origins: [{ lat: currentLocation.lat, lng: currentLocation.lng }],
        destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
        avoidHighways: false,
        avoidTolls: false
      }, (response: any, status: any) => {
        if (status === google.maps.DistanceMatrixStatus.OK) {
          const duration = response.rows[0].elements[0].duration;
          const estimatedDelivery = new Date(Date.now() + duration.value * 1000);
          resolve(estimatedDelivery.toISOString());
        } else {
          // Fallback to 2 days from now
          const fallbackDelivery = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
          resolve(fallbackDelivery.toISOString());
        }
      });
    });
  }

  // Get current tracking route
  getCurrentTrackingRoute(): TrackingRoute | null {
    return this.trackingRouteSubject.value;
  }

  // Update tracking location in real-time
  updateTrackingLocation(newLocation: TrackingLocation): void {
    const currentRoute = this.trackingRouteSubject.value;
    if (currentRoute) {
      currentRoute.locations.push(newLocation);
      currentRoute.currentLocation = newLocation;
      this.displayTrackingRoute(currentRoute);
    }
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Address {
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Package {
  type: 'PALLET' | 'PARCEL';
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
    unit: 'IN' | 'CM';
    weightUnit: 'LB' | 'KG';
  };
  value: number;
  contents: string;
  hazardous?: boolean;
  fragile?: boolean;
}

export interface QuoteRequest {
  origin: Address;
  destination: Address;
  packages: Package[];
  serviceLevel: 'GROUND' | 'EXPRESS' | 'OVERNIGHT' | 'ECONOMY';
  pickupDate: string;
  deliveryDate?: string;
  insurance?: boolean;
  signatureRequired?: boolean;
  userId?: string;
}

export interface CarrierQuote {
  id: string;
  carrier: string;
  service: string;
  price: number;
  currency: string;
  transitDays: number;
  deliveryDate: string;
  features: string[];
  restrictions?: string[];
  trackingIncluded: boolean;
  insuranceIncluded: boolean;
  signatureRequired: boolean;
  carbonNeutral?: boolean;
  reliability: number; // 1-5 stars
}

export interface QuoteResponse {
  success: boolean;
  quotes: CarrierQuote[];
  requestId: string;
  timestamp: string;
  validUntil: string;
  error?: string;
}

export interface SavedQuote {
  id: string;
  userId: string;
  request: QuoteRequest;
  selectedQuote: CarrierQuote;
  status: 'QUOTED' | 'ACCEPTED' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  paymentId?: string;
  shipmentId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnhancedQuoteService {
  private apiUrl = environment.apiUrl;
  private quotesSubject = new BehaviorSubject<SavedQuote[]>([]);
  public quotes$ = this.quotesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get real-time quotes from multiple carriers
  getQuotes(request: QuoteRequest): Observable<QuoteResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<QuoteResponse>(`${this.apiUrl}/api/quotes/get-quotes`, request, { headers })
      .pipe(
        map(response => {
          // Sort quotes by price and add additional metadata
          if (response.success && response.quotes) {
            response.quotes = response.quotes
              .map(quote => ({
                ...quote,
                pricePerDay: quote.price / Math.max(quote.transitDays, 1),
                valueScore: this.calculateValueScore(quote)
              }))
              .sort((a, b) => a.price - b.price);
          }
          return response;
        }),
        catchError(error => {
          console.error('Error getting quotes:', error);
          return of({
            success: false,
            quotes: [],
            requestId: '',
            timestamp: new Date().toISOString(),
            validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            error: 'Failed to get quotes from carriers'
          });
        })
      );
  }

  // Get quick quote without authentication
  getQuickQuote(request: Omit<QuoteRequest, 'userId'>): Observable<QuoteResponse> {
    return this.http.post<QuoteResponse>(`${this.apiUrl}/api/quotes/quick-quote`, request)
      .pipe(
        catchError(error => {
          console.error('Error getting quick quote:', error);
          return of({
            success: false,
            quotes: [],
            requestId: '',
            timestamp: new Date().toISOString(),
            validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            error: 'Failed to get quick quote'
          });
        })
      );
  }

  // Save quote for authenticated user
  saveQuote(request: QuoteRequest, selectedQuote: CarrierQuote): Observable<SavedQuote> {
    const payload = {
      request,
      selectedQuote
    };

    return this.http.post<SavedQuote>(`${this.apiUrl}/api/quotes/save`, payload)
      .pipe(
        map(savedQuote => {
          // Update local quotes list
          const currentQuotes = this.quotesSubject.value;
          this.quotesSubject.next([savedQuote, ...currentQuotes]);
          return savedQuote;
        }),
        catchError(error => {
          console.error('Error saving quote:', error);
          throw error;
        })
      );
  }

  // Get user's saved quotes
  getUserQuotes(userId: string): Observable<SavedQuote[]> {
    return this.http.get<SavedQuote[]>(`${this.apiUrl}/api/quotes/user/${userId}`)
      .pipe(
        map(quotes => {
          this.quotesSubject.next(quotes);
          return quotes;
        }),
        catchError(error => {
          console.error('Error getting user quotes:', error);
          return of([]);
        })
      );
  }

  // Accept a quote and proceed to payment
  acceptQuote(quoteId: string): Observable<SavedQuote> {
    return this.http.put<SavedQuote>(`${this.apiUrl}/api/quotes/${quoteId}/accept`, {})
      .pipe(
        map(updatedQuote => {
          this.updateQuoteInList(updatedQuote);
          return updatedQuote;
        }),
        catchError(error => {
          console.error('Error accepting quote:', error);
          throw error;
        })
      );
  }

  // Cancel a quote
  cancelQuote(quoteId: string): Observable<SavedQuote> {
    return this.http.put<SavedQuote>(`${this.apiUrl}/api/quotes/${quoteId}/cancel`, {})
      .pipe(
        map(updatedQuote => {
          this.updateQuoteInList(updatedQuote);
          return updatedQuote;
        }),
        catchError(error => {
          console.error('Error cancelling quote:', error);
          throw error;
        })
      );
  }

  // Get quote by ID
  getQuoteById(quoteId: string): Observable<SavedQuote> {
    return this.http.get<SavedQuote>(`${this.apiUrl}/api/quotes/${quoteId}`)
      .pipe(
        catchError(error => {
          console.error('Error getting quote by ID:', error);
          throw error;
        })
      );
  }

  // Calculate dimensional weight
  calculateDimensionalWeight(dimensions: Package['dimensions']): number {
    const { length, width, height, unit } = dimensions;
    
    // Convert to inches if needed
    const lengthInches = unit === 'CM' ? length / 2.54 : length;
    const widthInches = unit === 'CM' ? width / 2.54 : width;
    const heightInches = unit === 'CM' ? height / 2.54 : height;
    
    // Standard dimensional weight factor (166 for domestic, 139 for international)
    const dimFactor = 166;
    
    return (lengthInches * widthInches * heightInches) / dimFactor;
  }

  // Calculate billable weight
  calculateBillableWeight(pkg: Package): number {
    const actualWeight = pkg.dimensions.weightUnit === 'KG' 
      ? pkg.dimensions.weight * 2.20462 
      : pkg.dimensions.weight;
    
    const dimWeight = this.calculateDimensionalWeight(pkg.dimensions);
    
    return Math.max(actualWeight, dimWeight);
  }

  // Estimate shipping cost based on package details
  estimateShippingCost(request: QuoteRequest): number {
    let baseCost = 15; // Base shipping cost
    
    // Calculate total billable weight
    const totalWeight = request.packages.reduce((total, pkg) => {
      return total + this.calculateBillableWeight(pkg);
    }, 0);
    
    // Weight-based pricing
    baseCost += totalWeight * 0.75;
    
    // Distance factor (simplified)
    if (request.origin.state !== request.destination.state) {
      baseCost *= 1.5;
    }
    
    // Service level multiplier
    const serviceMultipliers = {
      'ECONOMY': 0.8,
      'GROUND': 1.0,
      'EXPRESS': 1.8,
      'OVERNIGHT': 2.5
    };
    
    baseCost *= serviceMultipliers[request.serviceLevel];
    
    // Package type multiplier
    const hasLargePackages = request.packages.some(pkg => pkg.type === 'PALLET');
    if (hasLargePackages) {
      baseCost *= 1.3;
    }
    
    // Additional services
    if (request.insurance) {
      const totalValue = request.packages.reduce((total, pkg) => total + pkg.value, 0);
      baseCost += totalValue * 0.01; // 1% of declared value
    }
    
    if (request.signatureRequired) {
      baseCost += 5;
    }
    
    return Math.round(baseCost * 100) / 100;
  }

  // Calculate value score for quote comparison
  private calculateValueScore(quote: CarrierQuote): number {
    let score = 0;
    
    // Price factor (lower is better)
    score += (100 - Math.min(quote.price, 100)) * 0.4;
    
    // Transit time factor (faster is better)
    score += (10 - Math.min(quote.transitDays, 10)) * 10 * 0.3;
    
    // Reliability factor
    score += quote.reliability * 20 * 0.2;
    
    // Features factor
    score += quote.features.length * 2 * 0.1;
    
    return Math.round(score);
  }

  // Update quote in local list
  private updateQuoteInList(updatedQuote: SavedQuote): void {
    const currentQuotes = this.quotesSubject.value;
    const index = currentQuotes.findIndex(q => q.id === updatedQuote.id);
    
    if (index !== -1) {
      currentQuotes[index] = updatedQuote;
      this.quotesSubject.next([...currentQuotes]);
    }
  }

  // Get carrier logo URL
  getCarrierLogo(carrier: string): string {
    const logos: { [key: string]: string } = {
      'FedEx': 'assets/images/carriers/fedex-logo.png',
      'UPS': 'assets/images/carriers/ups-logo.png',
      'DHL': 'assets/images/carriers/dhl-logo.png',
      'USPS': 'assets/images/carriers/usps-logo.png',
      'Canada Post': 'assets/images/carriers/canada-post-logo.png',
      'Purolator': 'assets/images/carriers/purolator-logo.png'
    };
    
    return logos[carrier] || 'assets/images/carriers/default-carrier.png';
  }

  // Get service level description
  getServiceLevelDescription(level: string): string {
    const descriptions: { [key: string]: string } = {
      'ECONOMY': 'Lowest cost option with longer delivery times',
      'GROUND': 'Standard ground delivery, reliable and cost-effective',
      'EXPRESS': 'Faster delivery with premium service',
      'OVERNIGHT': 'Next business day delivery'
    };
    
    return descriptions[level] || 'Standard shipping service';
  }

  // Format currency
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
}

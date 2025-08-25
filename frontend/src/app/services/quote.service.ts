import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Quote {
  id: number;
  quoteNumber: string;
  user?: any;
  originAddress: string;
  originCity: string;
  originState: string;
  originZip: string;
  originCountry: string;
  destinationAddress: string;
  destinationCity: string;
  destinationState: string;
  destinationZip: string;
  destinationCountry: string;
  shipmentType: ShipmentType;
  weight: number;
  weightUnit: string;
  dimensionsLength?: number;
  dimensionsWidth?: number;
  dimensionsHeight?: number;
  dimensionsUnit: string;
  packageCount: number;
  cargoDescription?: string;
  cargoValue?: number;
  estimatedPrice?: number;
  estimatedTransitDays?: number;
  status: QuoteStatus;
  validUntil: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteRequest {
  originAddress: string;
  originCity: string;
  originState: string;
  originZip: string;
  originCountry: string;
  destinationAddress: string;
  destinationCity: string;
  destinationState: string;
  destinationZip: string;
  destinationCountry: string;
  shipmentType: ShipmentType;
  weight: number;
  weightUnit?: string;
  dimensionsLength?: number;
  dimensionsWidth?: number;
  dimensionsHeight?: number;
  dimensionsUnit?: string;
  packageCount?: number;
  cargoDescription?: string;
  cargoValue?: number;
  specialInstructions?: string;
}

export interface QuickQuoteResponse {
  estimatedPrice: number;
  estimatedTransitDays: number;
  message: string;
}

export interface QuoteStats {
  totalQuotes: number;
  pendingQuotes: number;
  quotedQuotes: number;
  acceptedQuotes: number;
  rejectedQuotes: number;
  expiredQuotes: number;
}

export enum ShipmentType {
  LTL = 'LTL',
  FTL = 'FTL',
  PARCEL = 'PARCEL',
  FREIGHT = 'FREIGHT',
  EXPEDITED = 'EXPEDITED'
}

export enum QuoteStatus {
  PENDING = 'PENDING',
  QUOTED = 'QUOTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private apiUrl = `${environment.apiUrl}/quotes`;

  constructor(private http: HttpClient) {}

  createQuote(quoteRequest: QuoteRequest): Observable<Quote> {
    return this.http.post<Quote>(this.apiUrl, quoteRequest)
      .pipe(catchError(this.handleError));
  }

  getQuotes(page: number = 0, size: number = 10, sortBy: string = 'createdAt', 
           sortDir: string = 'desc', search?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  getQuoteById(id: number): Observable<Quote> {
    return this.http.get<Quote>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getQuoteByNumber(quoteNumber: string): Observable<Quote> {
    return this.http.get<Quote>(`${this.apiUrl}/number/${quoteNumber}`)
      .pipe(catchError(this.handleError));
  }

  updateQuoteStatus(id: number, status: QuoteStatus): Observable<Quote> {
    const params = new HttpParams().set('status', status);
    return this.http.put<Quote>(`${this.apiUrl}/${id}/status`, null, { params })
      .pipe(catchError(this.handleError));
  }

  deleteQuote(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getQuoteStats(): Observable<QuoteStats> {
    return this.http.get<QuoteStats>(`${this.apiUrl}/stats`)
      .pipe(catchError(this.handleError));
  }

  getQuickQuote(quoteRequest: QuoteRequest): Observable<QuickQuoteResponse> {
    return this.http.post<QuickQuoteResponse>(`${this.apiUrl}/public/quick`, quoteRequest)
      .pipe(catchError(this.handleError));
  }

  getShipmentTypes(): { value: ShipmentType; label: string; description: string }[] {
    return [
      {
        value: ShipmentType.PARCEL,
        label: 'Parcel',
        description: 'Small packages and documents'
      },
      {
        value: ShipmentType.LTL,
        label: 'Less Than Truckload (LTL)',
        description: 'Freight that doesn\'t require a full truck'
      },
      {
        value: ShipmentType.FTL,
        label: 'Full Truckload (FTL)',
        description: 'Large shipments requiring a full truck'
      },
      {
        value: ShipmentType.FREIGHT,
        label: 'Freight',
        description: 'General freight shipments'
      },
      {
        value: ShipmentType.EXPEDITED,
        label: 'Expedited',
        description: 'Time-sensitive shipments'
      }
    ];
  }

  getStatusColor(status: QuoteStatus): string {
    switch (status) {
      case QuoteStatus.PENDING:
        return 'warn';
      case QuoteStatus.QUOTED:
        return 'primary';
      case QuoteStatus.ACCEPTED:
        return 'accent';
      case QuoteStatus.REJECTED:
        return 'warn';
      case QuoteStatus.EXPIRED:
        return '';
      default:
        return '';
    }
  }

  getStatusIcon(status: QuoteStatus): string {
    switch (status) {
      case QuoteStatus.PENDING:
        return 'hourglass_empty';
      case QuoteStatus.QUOTED:
        return 'request_quote';
      case QuoteStatus.ACCEPTED:
        return 'check_circle';
      case QuoteStatus.REJECTED:
        return 'cancel';
      case QuoteStatus.EXPIRED:
        return 'schedule';
      default:
        return 'help';
    }
  }

  private handleError(error: any) {
    let errorMessage = 'An error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (typeof error.error === 'string') {
      errorMessage = error.error;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}

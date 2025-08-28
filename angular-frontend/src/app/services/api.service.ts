import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: any;
  token: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  shipmentId?: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  // Authentication endpoints
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, request);
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, request);
  }

  // User endpoints
  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/me`, { headers: this.getHeaders() });
  }

  // Quote endpoints
  getQuote(quoteData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/quotes`, quoteData, { headers: this.getHeaders() });
  }

  // Shipment endpoints
  createShipment(shipmentData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/shipments`, shipmentData, { headers: this.getHeaders() });
  }

  getUserShipments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/shipments/user`, { headers: this.getHeaders() });
  }

  // Payment endpoints
  createPaymentIntent(paymentData: PaymentRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/payments/create-intent`, paymentData, { headers: this.getHeaders() });
  }

  confirmPayment(paymentIntentId: string, paymentMethodId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/payments/confirm`, null, {
      headers: this.getHeaders(),
      params: { paymentIntentId, paymentMethodId }
    });
  }

  // Tracking endpoints
  trackShipment(trackingNumber: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tracking/${trackingNumber}`, { headers: this.getHeaders() });
  }
}

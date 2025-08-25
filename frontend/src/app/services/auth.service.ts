import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  emailVerified: boolean;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  emailVerified: boolean;
  fullName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map(response => {
          // Store user details and jwt token in local storage
          localStorage.setItem('currentUser', JSON.stringify(response));
          localStorage.setItem('token', response.token);
          
          const user: User = {
            id: response.id,
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName,
            phone: response.phone,
            role: response.role,
            emailVerified: response.emailVerified,
            fullName: response.fullName
          };
          
          this.currentUserSubject.next(user);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        map(response => {
          // Store user details and jwt token in local storage
          localStorage.setItem('currentUser', JSON.stringify(response));
          localStorage.setItem('token', response.token);
          
          const user: User = {
            id: response.id,
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName,
            phone: response.phone,
            role: response.role,
            emailVerified: response.emailVerified,
            fullName: response.fullName
          };
          
          this.currentUserSubject.next(user);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {})
      .pipe(
        map(() => {
          // Remove user from local storage
          localStorage.removeItem('currentUser');
          localStorage.removeItem('token');
          this.currentUserSubject.next(null);
        }),
        catchError(() => {
          // Even if logout fails on server, clear local storage
          localStorage.removeItem('currentUser');
          localStorage.removeItem('token');
          this.currentUserSubject.next(null);
          return [];
        })
      );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`)
      .pipe(catchError(this.handleError));
  }

  refreshToken(): Observable<AuthResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token available'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {}, { headers })
      .pipe(
        map(response => {
          localStorage.setItem('currentUser', JSON.stringify(response));
          localStorage.setItem('token', response.token);
          
          const user: User = {
            id: response.id,
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName,
            phone: response.phone,
            role: response.role,
            emailVerified: response.emailVerified,
            fullName: response.fullName
          };
          
          this.currentUserSubject.next(user);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  isAdmin(): boolean {
    const user = this.currentUserValue;
    return user?.role === 'ADMIN';
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const authResponse = JSON.parse(userStr);
        return {
          id: authResponse.id,
          email: authResponse.email,
          firstName: authResponse.firstName,
          lastName: authResponse.lastName,
          phone: authResponse.phone,
          role: authResponse.role,
          emailVerified: authResponse.emailVerified,
          fullName: authResponse.fullName
        };
      } catch (error) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        return null;
      }
    }
    return null;
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

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, User } from '../../services/auth.service';
import { QuoteService, QuoteStats } from '../../services/quote.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  quoteStats: QuoteStats | null = null;
  loading = true;

  constructor(
    private authService: AuthService,
    private quoteService: QuoteService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    this.quoteService.getQuoteStats()
      .subscribe({
        next: (stats) => {
          this.quoteStats = stats;
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to load dashboard data:', error);
          this.loading = false;
          this.snackBar.open('Failed to load dashboard data', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  navigateToQuotes(): void {
    this.router.navigate(['/quotes']);
  }

  navigateToGetQuote(): void {
    this.router.navigate(['/get-quote']);
  }

  navigateToTracking(): void {
    this.router.navigate(['/tracking']);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.snackBar.open('Logged out successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if logout fails on server, redirect to home
        this.router.navigate(['/home']);
      }
    });
  }
}

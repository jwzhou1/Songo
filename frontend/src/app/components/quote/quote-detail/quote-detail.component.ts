import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuoteService, Quote, QuoteStatus } from '../../../services/quote.service';

@Component({
  selector: 'app-quote-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './quote-detail.component.html',
  styleUrls: ['./quote-detail.component.scss']
})
export class QuoteDetailComponent implements OnInit {
  quote: Quote | null = null;
  loading = true;
  quoteId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quoteService: QuoteService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.quoteId = +params['id'];
      this.loadQuote();
    });
  }

  loadQuote(): void {
    this.loading = true;
    
    this.quoteService.getQuoteById(this.quoteId)
      .subscribe({
        next: (quote) => {
          this.quote = quote;
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to load quote:', error);
          this.loading = false;
          this.snackBar.open('Failed to load quote details', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.router.navigate(['/quotes']);
        }
      });
  }

  acceptQuote(): void {
    if (!this.quote) return;
    
    this.quoteService.updateQuoteStatus(this.quote.id, QuoteStatus.ACCEPTED)
      .subscribe({
        next: (updatedQuote) => {
          this.quote = updatedQuote;
          this.snackBar.open('Quote accepted successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          this.snackBar.open('Failed to accept quote', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  rejectQuote(): void {
    if (!this.quote) return;
    
    this.quoteService.updateQuoteStatus(this.quote.id, QuoteStatus.REJECTED)
      .subscribe({
        next: (updatedQuote) => {
          this.quote = updatedQuote;
          this.snackBar.open('Quote rejected', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          this.snackBar.open('Failed to reject quote', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/quotes']);
  }

  getStatusColor(status: QuoteStatus): string {
    return this.quoteService.getStatusColor(status);
  }

  getStatusIcon(status: QuoteStatus): string {
    return this.quoteService.getStatusIcon(status);
  }

  formatPrice(price: number | undefined): string {
    if (!price) return 'N/A';
    return `$${price.toFixed(2)}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  canAcceptOrReject(): boolean {
    return this.quote?.status === QuoteStatus.QUOTED;
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuoteService, Quote, QuoteStatus } from '../../../services/quote.service';

@Component({
  selector: 'app-quote-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './quote-list.component.html',
  styleUrls: ['./quote-list.component.scss']
})
export class QuoteListComponent implements OnInit {
  quotes: Quote[] = [];
  loading = true;
  page = 0;
  size = 10;
  totalElements = 0;

  constructor(
    private quoteService: QuoteService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadQuotes();
  }

  loadQuotes(): void {
    this.loading = true;
    
    this.quoteService.getQuotes(this.page, this.size)
      .subscribe({
        next: (response) => {
          this.quotes = response.content || [];
          this.totalElements = response.totalElements || 0;
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to load quotes:', error);
          this.loading = false;
          this.snackBar.open('Failed to load quotes', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  viewQuote(quote: Quote): void {
    this.router.navigate(['/quotes', quote.id]);
  }

  getStatusColor(status: QuoteStatus): string {
    return this.quoteService.getStatusColor(status);
  }

  getStatusIcon(status: QuoteStatus): string {
    return this.quoteService.getStatusIcon(status);
  }

  createNewQuote(): void {
    this.router.navigate(['/get-quote']);
  }

  formatPrice(price: number | undefined): string {
    if (!price) return 'N/A';
    return `$${price.toFixed(2)}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}

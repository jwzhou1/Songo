import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <section class="hero-section bg-primary text-white">
        <div class="container">
          <div class="row align-items-center min-vh-75">
            <div class="col-lg-6">
              <h1 class="display-4 fw-bold mb-4 fade-in">
                Your Shipping Made Simple
              </h1>
              <p class="lead mb-4 fade-in slide-in-left">
                Compare rates from multiple carriers, book shipments, and track packages 
                all in one place. Get the best shipping rates for your business.
              </p>
              <div class="d-flex gap-3 fade-in">
                <button mat-raised-button 
                        color="accent" 
                        size="large"
                        routerLink="/quote"
                        class="btn-custom">
                  <mat-icon>calculate</mat-icon>
                  Get Quote
                </button>
                <button mat-stroked-button 
                        color="accent"
                        size="large"
                        routerLink="/track"
                        class="btn-custom text-white border-white">
                  <mat-icon>search</mat-icon>
                  Track Package
                </button>
              </div>
            </div>
            <div class="col-lg-6 text-center">
              <div class="hero-image fade-in">
                <mat-icon class="hero-icon">local_shipping</mat-icon>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section py-5">
        <div class="container">
          <div class="row text-center mb-5">
            <div class="col-12">
              <h2 class="display-5 fw-bold mb-3">Why Choose SonGo?</h2>
              <p class="lead text-muted">
                We make shipping simple, fast, and affordable for businesses of all sizes.
              </p>
            </div>
          </div>
          
          <div class="row g-4">
            <div class="col-md-4" *ngFor="let feature of features">
              <mat-card class="feature-card h-100 card-custom">
                <mat-card-content class="text-center p-4">
                  <div class="feature-icon mb-3">
                    <mat-icon class="text-primary fs-1">{{ feature.icon }}</mat-icon>
                  </div>
                  <h5 class="fw-bold mb-3">{{ feature.title }}</h5>
                  <p class="text-muted">{{ feature.description }}</p>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </div>
      </section>

      <!-- Carriers Section -->
      <section class="carriers-section py-5 bg-light">
        <div class="container">
          <div class="row text-center mb-5">
            <div class="col-12">
              <h2 class="display-5 fw-bold mb-3">Trusted Carriers</h2>
              <p class="lead text-muted">
                We partner with leading shipping companies to get you the best rates.
              </p>
            </div>
          </div>
          
          <div class="row justify-content-center align-items-center g-4">
            <div class="col-6 col-md-3" *ngFor="let carrier of carriers">
              <div class="carrier-logo text-center p-3">
                <div class="carrier-name fw-bold text-primary">{{ carrier.name }}</div>
                <small class="text-muted">{{ carrier.type }}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section py-5 bg-primary text-white">
        <div class="container">
          <div class="row text-center">
            <div class="col-12">
              <h2 class="display-5 fw-bold mb-3">Ready to Start Shipping?</h2>
              <p class="lead mb-4">
                Join thousands of businesses that trust SonGo for their shipping needs.
              </p>
              <div class="d-flex justify-content-center gap-3">
                <button mat-raised-button 
                        color="accent" 
                        size="large"
                        routerLink="/register"
                        class="btn-custom">
                  Get Started Free
                </button>
                <button mat-stroked-button 
                        color="accent"
                        size="large"
                        routerLink="/quote"
                        class="btn-custom text-white border-white">
                  Get Quote Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      overflow-x: hidden;
    }

    .hero-section {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      min-height: 80vh;
      display: flex;
      align-items: center;
    }

    .hero-icon {
      font-size: 200px;
      width: 200px;
      height: 200px;
      opacity: 0.9;
    }

    .feature-card {
      transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
      border: none;
      height: 100%;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .feature-icon mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
    }

    .carrier-logo {
      transition: transform 0.2s ease-in-out;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .carrier-logo:hover {
      transform: scale(1.05);
    }

    .carrier-name {
      font-size: 1.1rem;
    }

    .btn-custom {
      padding: 12px 24px;
      font-weight: 500;
      border-radius: 6px;
    }

    /* Animations */
    .fade-in {
      animation: fadeIn 1s ease-in-out;
    }

    .slide-in-left {
      animation: slideInLeft 1s ease-in-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .min-vh-75 {
      min-height: 75vh;
    }

    @media (max-width: 768px) {
      .hero-icon {
        font-size: 120px;
        width: 120px;
        height: 120px;
      }
      
      .display-4 {
        font-size: 2.5rem;
      }
    }
  `]
})
export class HomeComponent {
  features = [
    {
      icon: 'compare_arrows',
      title: 'Compare Rates',
      description: 'Get instant quotes from multiple carriers and choose the best rate for your shipment.'
    },
    {
      icon: 'track_changes',
      title: 'Real-time Tracking',
      description: 'Track your packages in real-time with updates from pickup to delivery.'
    },
    {
      icon: 'security',
      title: 'Secure & Reliable',
      description: 'Your shipments are protected with insurance and our trusted carrier network.'
    },
    {
      icon: 'speed',
      title: 'Fast Booking',
      description: 'Book your shipments in minutes with our streamlined booking process.'
    },
    {
      icon: 'support_agent',
      title: '24/7 Support',
      description: 'Get help when you need it with our dedicated customer support team.'
    },
    {
      icon: 'savings',
      title: 'Save Money',
      description: 'Access discounted shipping rates and save up to 70% on your shipping costs.'
    }
  ];

  carriers = [
    { name: 'Canada Post', type: 'National Postal Service' },
    { name: 'Purolator', type: 'Express & Ground' },
    { name: 'UPS', type: 'Global Shipping' },
    { name: 'FedEx', type: 'Express Delivery' },
    { name: 'DHL', type: 'International Express' },
    { name: 'Canpar', type: 'Ground Delivery' }
  ];
}

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {
  features = [
    {
      icon: 'request_quote',
      title: 'Get Instant Quotes',
      description: 'Compare shipping rates from multiple carriers instantly',
      link: '/get-quote'
    },
    {
      icon: 'track_changes',
      title: 'Real-time Tracking',
      description: 'Track your packages with GPS precision and live updates',
      link: '/tracking'
    },
    {
      icon: 'dashboard',
      title: 'Smart Dashboard',
      description: 'Manage all your shipments from one centralized dashboard',
      link: '/dashboard'
    },
    {
      icon: 'security',
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime guarantee',
      link: '/register'
    }
  ];

  carriers = [
    { name: 'FedEx', logo: 'assets/fedex-logo.png' },
    { name: 'UPS', logo: 'assets/ups-logo.png' },
    { name: 'DHL', logo: 'assets/dhl-logo.png' },
    { name: 'USPS', logo: 'assets/usps-logo.png' },
    { name: 'Canada Post', logo: 'assets/canada-post-logo.png' },
    { name: 'Canpar', logo: 'assets/canpar-logo.png' }
  ];
}

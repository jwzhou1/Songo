import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Stats {
  activeShipments: number;
  totalQuotes: number;
  totalSpent: number;
  deliveredPackages: number;
}

interface Shipment {
  id: number;
  trackingNumber: string;
  status: string;
  origin: string;
  destination: string;
  date: Date;
}

interface Quote {
  id: number;
  quoteNumber: string;
  price: number;
  service: string;
  route: string;
  validUntil: Date;
}

interface Activity {
  id: number;
  type: string;
  title: string;
  description: string;
  timestamp: Date;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  stats: Stats = {
    activeShipments: 0,
    totalQuotes: 0,
    totalSpent: 0,
    deliveredPackages: 0
  };
  recentShipments: Shipment[] = [];
  savedQuotes: Quote[] = [];
  recentActivity: Activity[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadUserData();
    this.loadDashboardData();
  }

  loadUserData() {
    // Get user from localStorage (demo)
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    } else {
      // Redirect to login if no user data
      this.router.navigate(['/login']);
    }
  }

  loadDashboardData() {
    // Load real user data from localStorage
    const userShipments = JSON.parse(localStorage.getItem('user_shipments') || '[]');
    const userPayments = JSON.parse(localStorage.getItem('user_payments') || '[]');

    // Calculate stats from real data
    const activeShipments = userShipments.filter((s: any) =>
      s.status === 'Processing' || s.status === 'In Transit' || s.status === 'Picked Up'
    ).length;

    const deliveredPackages = userShipments.filter((s: any) => s.status === 'Delivered').length;
    const totalSpent = userPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    this.stats = {
      activeShipments: activeShipments,
      totalQuotes: 12, // Keep demo value for quotes
      totalSpent: totalSpent,
      deliveredPackages: deliveredPackages
    };

    // Use real shipment data or fallback to demo data
    if (userShipments.length > 0) {
      this.recentShipments = userShipments.slice(0, 5).map((shipment: any) => ({
        id: shipment.id,
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        origin: 'Pickup Location', // Could be enhanced with real addresses
        destination: 'Delivery Location',
        date: new Date(shipment.paymentDate)
      }));
    } else {
      // Fallback demo data
      this.recentShipments = [
        {
          id: 1,
          trackingNumber: 'SG123456789',
          status: 'In Transit',
          origin: 'New York, NY',
          destination: 'Los Angeles, CA',
          date: new Date('2024-01-15')
        },
        {
          id: 2,
          trackingNumber: 'SG987654321',
          status: 'Delivered',
          origin: 'Chicago, IL',
          destination: 'Miami, FL',
          date: new Date('2024-01-12')
        }
      ];
    }

    this.savedQuotes = [
      {
        id: 1,
        quoteNumber: 'QT001',
        price: 125.50,
        service: 'FedEx Ground',
        route: 'Dallas, TX → Houston, TX',
        validUntil: new Date('2024-01-25')
      },
      {
        id: 2,
        quoteNumber: 'QT002',
        price: 89.25,
        service: 'UPS Standard',
        route: 'Phoenix, AZ → Denver, CO',
        validUntil: new Date('2024-01-22')
      }
    ];

    // Generate activity from real data
    const activities: Activity[] = [];

    // Add shipment activities
    userShipments.slice(0, 3).forEach((shipment: any) => {
      activities.push({
        id: shipment.id,
        type: 'shipment',
        title: `Shipment ${shipment.status}`,
        description: `${shipment.trackingNumber} - ${shipment.service}`,
        timestamp: new Date(shipment.paymentDate)
      });
    });

    // Add payment activities
    userPayments.slice(0, 2).forEach((payment: any) => {
      activities.push({
        id: payment.id,
        type: 'payment',
        title: 'Payment Processed',
        description: `$${payment.amount.toFixed(2)} payment completed - ${payment.description}`,
        timestamp: new Date(payment.date)
      });
    });

    // Sort by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    this.recentActivity = activities.length > 0 ? activities.slice(0, 5) : [
      {
        id: 1,
        type: 'quote',
        title: 'Welcome to SonGo!',
        description: 'Start by creating your first quote',
        timestamp: new Date()
      }
    ];
  }

  trackShipment(trackingNumber: string) {
    this.router.navigate(['/tracking'], { queryParams: { number: trackingNumber } });
  }

  shipQuote(quote: Quote) {
    // Navigate to shipment create page with quote data
    this.router.navigate(['/shipment-create'], {
      queryParams: { quoteId: quote.id },
      state: quote
    });
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'shipment': return 'local_shipping';
      case 'quote': return 'description';
      case 'payment': return 'payment';
      case 'delivery': return 'done';
      default: return 'info';
    }
  }
}

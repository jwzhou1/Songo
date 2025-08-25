import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <div class="app-container">
      <!-- Navigation Header -->
      <mat-toolbar color="primary" class="navbar-custom">
        <div class="container-fluid d-flex justify-content-between align-items-center">
          <!-- Logo -->
          <div class="navbar-brand d-flex align-items-center">
            <mat-icon class="me-2">local_shipping</mat-icon>
            <span class="fw-bold fs-4">SonGo</span>
          </div>

          <!-- Navigation Links -->
          <div class="d-none d-md-flex align-items-center">
            <a routerLink="/home" 
               routerLinkActive="active" 
               class="nav-link text-white me-3">Home</a>
            <a routerLink="/quote" 
               routerLinkActive="active" 
               class="nav-link text-white me-3">Get Quote</a>
            <a routerLink="/track" 
               routerLinkActive="active" 
               class="nav-link text-white me-3">Track</a>
            <a routerLink="/dashboard" 
               routerLinkActive="active" 
               class="nav-link text-white me-3">Dashboard</a>
          </div>

          <!-- User Menu -->
          <div class="d-flex align-items-center">
            <button mat-button [matMenuTriggerFor]="userMenu" class="text-white">
              <mat-icon>account_circle</mat-icon>
              <span class="ms-1 d-none d-sm-inline">Account</span>
            </button>
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item routerLink="/login">
                <mat-icon>login</mat-icon>
                <span>Login</span>
              </button>
              <button mat-menu-item routerLink="/register">
                <mat-icon>person_add</mat-icon>
                <span>Register</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item routerLink="/dashboard">
                <mat-icon>dashboard</mat-icon>
                <span>Dashboard</span>
              </button>
            </mat-menu>
          </div>
        </div>
      </mat-toolbar>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="footer-custom mt-auto">
        <div class="container-fluid">
          <div class="row">
            <div class="col-md-6">
              <p class="mb-0">&copy; 2024 SonGo Shipping Platform. All rights reserved.</p>
            </div>
            <div class="col-md-6 text-md-end">
              <p class="mb-0">Your Shipping Made Simple</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .main-content {
      flex: 1;
      padding-top: 0;
    }

    .nav-link {
      text-decoration: none;
      transition: opacity 0.2s ease-in-out;
    }

    .nav-link:hover {
      opacity: 0.8;
    }

    .nav-link.active {
      font-weight: 500;
      border-bottom: 2px solid white;
    }

    .footer-custom {
      background-color: #343a40;
      color: white;
      padding: 20px 0;
    }

    @media (max-width: 768px) {
      .navbar-brand span {
        font-size: 1.2rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'SonGo - Your Shipping Made Simple';
}

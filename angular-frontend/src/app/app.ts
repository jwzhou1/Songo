import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { NotificationsComponent } from './components/notifications/notifications';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    CommonModule,
    NotificationsComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('SonGo Enterprise Shipping');
  isLoggedIn = false;
  currentUser: User | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkAuthStatus();

    // Listen for storage changes (login/logout from other tabs)
    window.addEventListener('storage', () => {
      this.checkAuthStatus();
    });
  }

  checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        this.currentUser = JSON.parse(userData);
        this.isLoggedIn = true;
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.logout();
      }
    } else {
      this.isLoggedIn = false;
      this.currentUser = null;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedIn = false;
    this.currentUser = null;
    this.router.navigate(['/']);
  }
}

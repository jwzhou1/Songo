import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.authService.currentUserValue;
    
    if (currentUser && this.authService.isAuthenticated()) {
      // Check if route requires admin role
      if (route.data?.['roles'] && route.data['roles'].includes('ADMIN')) {
        if (this.authService.isAdmin()) {
          return true;
        } else {
          // User is not admin, redirect to dashboard
          this.router.navigate(['/dashboard']);
          return false;
        }
      }
      
      // User is authenticated
      return true;
    }

    // User is not logged in, redirect to login page with return url
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}

import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'get-quote',
    loadComponent: () => import('./components/quote/get-quote/get-quote.component').then(m => m.GetQuoteComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'quotes',
    loadComponent: () => import('./components/quote/quote-list/quote-list.component').then(m => m.QuoteListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'quotes/:id',
    loadComponent: () => import('./components/quote/quote-detail/quote-detail.component').then(m => m.QuoteDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'tracking',
    loadComponent: () => import('./components/tracking/tracking.component').then(m => m.TrackingComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];

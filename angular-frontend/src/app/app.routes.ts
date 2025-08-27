import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'get-quote',
    loadComponent: () => import('./components/get-quote/get-quote').then(m => m.GetQuoteComponent)
  },
  {
    path: 'tracking',
    loadComponent: () => import('./components/tracking/tracking').then(m => m.TrackingComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent)
  },
  {
    path: 'payment',
    loadComponent: () => import('./components/payment/payment').then(m => m.PaymentComponent)
  },
  {
    path: 'shipment-create',
    loadComponent: () => import('./components/shipment-create/shipment-create').then(m => m.ShipmentCreateComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

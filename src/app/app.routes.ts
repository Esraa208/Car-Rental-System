import { Routes } from '@angular/router';
import { adminGuard, customerGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/layout/layout').then(m => m.Layout),
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', loadComponent: () => import('./features/admin/users/list/list').then(m => m.List) },
      { path: 'cars', loadComponent: () => import('./features/admin/cars/list/list').then(m => m.List) },
      { path: 'orders', loadComponent: () => import('./features/admin/orders/list/list').then(m => m.List) },
    ]
  },
  {
    path: '',
    canActivate: [customerGuard],
    loadComponent: () => import('./features/customer/layout/layout').then(m => m.Layout),
    children: [
      { path: 'cars', loadComponent: () => import('./features/customer/cars/list/list').then(m => m.List) },
      { path: 'orders', loadComponent: () => import('./features/customer/orders/list/list').then(m => m.List) },
      { path: 'installments', loadComponent: () => import('./features/customer/installments/installments').then(m => m.Installments) }
    ]
  },
  { path: '**', redirectTo: 'login' }
];

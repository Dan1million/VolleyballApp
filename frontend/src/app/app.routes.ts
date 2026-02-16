import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./pages/account/account.component').then((m) => m.AccountComponent),
    canActivate: [authGuard],
  },
  {
    path: 'events',
    loadComponent: () =>
      import('./pages/event-list/event-list.component').then((m) => m.EventListComponent),
  },
  {
    path: 'events/create',
    loadComponent: () =>
      import('./pages/create-event/create-event.component').then((m) => m.CreateEventComponent),
    canActivate: [authGuard],
  },
  {
    path: 'events/:id',
    loadComponent: () =>
      import('./pages/event-detail/event-detail.component').then((m) => m.EventDetailComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

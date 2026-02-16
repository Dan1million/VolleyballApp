import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    AsyncPipe,
  ],
  template: `
    <mat-toolbar color="primary" class="navbar">
      <a routerLink="/" class="brand">
        <mat-icon>sports_volleyball</mat-icon>
        <span class="brand-text">VolleyApp</span>
      </a>

      <span class="spacer"></span>

      @if (auth.currentUser$ | async; as user) {
        <a mat-button routerLink="/events" routerLinkActive="active-link">
          <mat-icon>event</mat-icon>
          Events
        </a>
        <a mat-button routerLink="/events/create" routerLinkActive="active-link">
          <mat-icon>add_circle</mat-icon>
          Create Event
        </a>

        <button mat-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
          {{ user.firstName }}
        </button>
        <mat-menu #userMenu="matMenu">
          <a mat-menu-item routerLink="/account">
            <mat-icon>person</mat-icon>
            My Account
          </a>
          <button mat-menu-item (click)="onLogout()">
            <mat-icon>logout</mat-icon>
            Sign Out
          </button>
        </mat-menu>
      } @else {
        <a mat-button routerLink="/login" routerLinkActive="active-link">Sign In</a>
        <a mat-raised-button routerLink="/register" routerLinkActive="active-link" color="accent">
          Sign Up
        </a>
      }
    </mat-toolbar>

    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: inherit;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .brand-text {
      font-family: 'Roboto', sans-serif;
    }

    .spacer {
      flex: 1;
    }

    .active-link {
      background: rgba(255, 255, 255, 0.1);
    }

    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 16px;
    }
  `],
})
export class NavbarComponent {
  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  onLogout() {
    this.auth.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, AsyncPipe],
  template: `
    <div class="hero">
      <mat-icon class="hero-icon">sports_volleyball</mat-icon>
      <h1>Welcome to VolleyApp</h1>
      <p class="subtitle">Find and join volleyball events near you</p>

      <div class="hero-actions">
        @if (auth.currentUser$ | async) {
          <a mat-raised-button color="primary" routerLink="/events" class="big-btn">
            <mat-icon>search</mat-icon>
            Browse Events
          </a>
          <a mat-raised-button routerLink="/events/create" class="big-btn">
            <mat-icon>add_circle</mat-icon>
            Create Event
          </a>
        } @else {
          <a mat-raised-button color="primary" routerLink="/register" class="big-btn">
            <mat-icon>person_add</mat-icon>
            Get Started
          </a>
          <a mat-raised-button routerLink="/login" class="big-btn">
            <mat-icon>login</mat-icon>
            Sign In
          </a>
        }
      </div>
    </div>

    <div class="features">
      <mat-card>
        <mat-card-content class="feature">
          <mat-icon>search</mat-icon>
          <h3>Find Events</h3>
          <p>Search for volleyball events near you by location and date</p>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content class="feature">
          <mat-icon>add_circle</mat-icon>
          <h3>Create Events</h3>
          <p>Organize your own games at your favorite courts and locations</p>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content class="feature">
          <mat-icon>group</mat-icon>
          <h3>Join Games</h3>
          <p>Sign up for events and connect with other volleyball players</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .hero {
      text-align: center;
      padding: 64px 16px;
    }

    .hero-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #FF8F00;
    }

    .hero h1 {
      font-size: 2.5rem;
      margin: 16px 0 8px;
    }

    .subtitle {
      font-size: 1.25rem;
      color: #666;
      margin-bottom: 32px;
    }

    .hero-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .big-btn {
      height: 48px;
      font-size: 16px;
      padding: 0 32px;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-top: 32px;
    }

    .feature {
      text-align: center;
      padding: 24px 16px;
    }

    .feature mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #00897B;
      margin-bottom: 12px;
    }

    .feature h3 {
      margin: 8px 0;
    }

    .feature p {
      color: #666;
    }
  `],
})
export class HomeComponent {
  constructor(public auth: AuthService) {}
}

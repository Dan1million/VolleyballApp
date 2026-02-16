import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { VolleyballEvent } from '../../models/event.model';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatListModule,
    MatSnackBarModule,
    DatePipe,
    TitleCasePipe,
  ],
  template: `
    <div class="page-container">
      @if (loading) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (!event) {
        <mat-card class="not-found">
          <mat-icon>error_outline</mat-icon>
          <h2>Event Not Found</h2>
          <p>This event doesn't exist or has been removed.</p>
          <a mat-raised-button routerLink="/events" color="primary">Browse Events</a>
        </mat-card>
      } @else {
        <a mat-button routerLink="/events" class="back-link">
          <mat-icon>arrow_back</mat-icon>
          Back to Events
        </a>

        <div class="event-layout">
          <!-- Main info -->
          <mat-card class="event-main">
            <mat-card-header>
              <mat-icon mat-card-avatar class="event-icon">
                @if (event.is_indoor) {
                  fitness_center
                } @else {
                  beach_access
                }
              </mat-icon>
              <mat-card-title>{{ event.title }}</mat-card-title>
              <mat-card-subtitle>
                Created by {{ event.creator_first_name }} {{ event.creator_last_name }}
                on {{ event.created_at | date: 'mediumDate' }}
              </mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              @if (event.description) {
                <p class="description">{{ event.description }}</p>
              }

              <mat-divider></mat-divider>

              <div class="details-grid">
                <div class="detail-item">
                  <mat-icon>event</mat-icon>
                  <div>
                    <span class="label">Date & Time</span>
                    <span class="value">{{ event.event_date | date: 'EEEE, MMMM d, y' }}</span>
                    <span class="value">{{ event.event_date | date: 'h:mm a' }}</span>
                  </div>
                </div>

                <div class="detail-item">
                  <mat-icon>location_on</mat-icon>
                  <div>
                    <span class="label">Location</span>
                    <span class="value">{{ event.location_name }}</span>
                    <span class="value sub">{{ event.location_address }}</span>
                    <span class="value sub">{{ event.location_city }}, {{ event.location_state }}</span>
                  </div>
                </div>

                <div class="detail-item">
                  <mat-icon>sports_volleyball</mat-icon>
                  <div>
                    <span class="label">Court</span>
                    <span class="value">{{ event.court_name }}</span>
                    <span class="value sub">{{ event.surface_type | titlecase }} — {{ event.court_type | titlecase }}</span>
                  </div>
                </div>

                <div class="detail-item">
                  <mat-icon>group</mat-icon>
                  <div>
                    <span class="label">Players</span>
                    <span class="value">{{ (event.signupCount ?? event.signup_count) || 0 }} / {{ event.max_players }} spots filled</span>
                  </div>
                </div>
              </div>

              <div class="chips-section">
                <mat-chip-set>
                  <mat-chip>{{ event.skill_level | titlecase }} Level</mat-chip>
                  <mat-chip>{{ event.surface_type | titlecase }}</mat-chip>
                  @if (event.is_indoor) {
                    <mat-chip highlighted>Indoor</mat-chip>
                  } @else {
                    <mat-chip>Outdoor</mat-chip>
                  }
                </mat-chip-set>
              </div>
            </mat-card-content>

            <mat-card-actions>
              @if (isOrganizer) {
                <button mat-raised-button color="warn" (click)="cancelEvent()" [disabled]="actionLoading">
                  <mat-icon>delete</mat-icon>
                  Cancel Event
                </button>
              } @else if (isSignedUp) {
                <button mat-raised-button color="warn" (click)="cancelSignup()" [disabled]="actionLoading">
                  <mat-icon>remove_circle</mat-icon>
                  Cancel Signup
                </button>
              } @else if (isFull) {
                <button mat-raised-button disabled>
                  <mat-icon>block</mat-icon>
                  Event Full
                </button>
              } @else {
                <button mat-raised-button color="primary" (click)="signUp()" [disabled]="actionLoading">
                  <mat-icon>how_to_reg</mat-icon>
                  Sign Up for This Event
                </button>
              }
            </mat-card-actions>
          </mat-card>

          <!-- Signups sidebar -->
          <mat-card class="signups-card">
            <mat-card-header>
              <mat-card-title>Signed Up Players</mat-card-title>
              <mat-card-subtitle>{{ (event.signupCount ?? event.signup_count) || 0 }} of {{ event.max_players }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              @if (event.signups && event.signups.length > 0) {
                <mat-list>
                  @for (signup of event.signups; track signup.id) {
                    <mat-list-item>
                      <mat-icon matListItemIcon>person</mat-icon>
                      <span matListItemTitle>{{ signup.first_name }} {{ signup.last_name }}</span>
                      <span matListItemLine>Joined {{ signup.signed_up_at | date: 'short' }}</span>
                    </mat-list-item>
                  }
                </mat-list>
              } @else {
                <p class="no-signups">No players signed up yet. Be the first!</p>
              }
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1000px;
      margin: 0 auto;
    }

    .back-link {
      margin-bottom: 16px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .not-found {
      text-align: center;
      padding: 48px;
    }

    .not-found mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }

    .event-layout {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }

    @media (max-width: 768px) {
      .event-layout {
        grid-template-columns: 1fr;
      }
    }

    .event-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #FF8F00;
    }

    .description {
      font-size: 16px;
      line-height: 1.6;
      color: #444;
      margin: 16px 0;
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 20px;
    }

    @media (max-width: 600px) {
      .details-grid {
        grid-template-columns: 1fr;
      }
    }

    .detail-item {
      display: flex;
      gap: 12px;
    }

    .detail-item mat-icon {
      color: #00897B;
      margin-top: 2px;
    }

    .detail-item .label {
      display: block;
      font-size: 12px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .detail-item .value {
      display: block;
      font-size: 14px;
      font-weight: 500;
    }

    .detail-item .value.sub {
      font-weight: 400;
      color: #666;
    }

    .chips-section {
      margin-top: 20px;
    }

    mat-card-actions {
      padding: 16px !important;
    }

    .signups-card {
      align-self: start;
    }

    .no-signups {
      color: #888;
      text-align: center;
      padding: 16px;
    }

    mat-divider {
      margin: 16px 0;
    }
  `],
})
export class EventDetailComponent implements OnInit {
  event: VolleyballEvent | null = null;
  loading = true;
  actionLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvent(parseInt(id));
    }
  }

  get isOrganizer(): boolean {
    if (!this.event || !this.authService.currentUser) return false;
    return this.event.creator_id === this.authService.currentUser.id;
  }

  get isSignedUp(): boolean {
    if (!this.event?.signups || !this.authService.currentUser) return false;
    return this.event.signups.some((s) => s.user_id === this.authService.currentUser!.id);
  }

  get isFull(): boolean {
    return ((this.event?.signupCount ?? this.event?.signup_count) || 0) >= (this.event?.max_players || 0);
  }

  loadEvent(id: number) {
    this.loading = true;
    this.eventService.getEvent(id).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  signUp() {
    if (!this.event) return;

    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.actionLoading = true;
    this.eventService.signUp(this.event.id).subscribe({
      next: () => {
        this.snackBar.open('You\'re signed up! See you there! 🏐', 'Close', { duration: 3000 });
        this.loadEvent(this.event!.id);
        this.actionLoading = false;
      },
      error: (err) => {
        this.actionLoading = false;
        this.snackBar.open(err.error?.error || 'Failed to sign up.', 'Close', { duration: 3000 });
      },
    });
  }

  cancelEvent() {
    if (!this.event) return;
    if (!confirm('Are you sure you want to cancel this event? This action cannot be undone.')) return;

    this.actionLoading = true;
    this.eventService.cancelEvent(this.event.id).subscribe({
      next: () => {
        this.snackBar.open('Event cancelled.', 'Close', { duration: 3000 });
        this.router.navigate(['/events']);
      },
      error: (err) => {
        this.actionLoading = false;
        this.snackBar.open(err.error?.error || 'Failed to cancel event.', 'Close', { duration: 3000 });
      },
    });
  }

  cancelSignup() {
    if (!this.event) return;

    this.actionLoading = true;
    this.eventService.cancelSignup(this.event.id).subscribe({
      next: () => {
        this.snackBar.open('Signup cancelled.', 'Close', { duration: 3000 });
        this.loadEvent(this.event!.id);
        this.actionLoading = false;
      },
      error: (err) => {
        this.actionLoading = false;
        this.snackBar.open(err.error?.error || 'Failed to cancel signup.', 'Close', {
          duration: 3000,
        });
      },
    });
  }
}

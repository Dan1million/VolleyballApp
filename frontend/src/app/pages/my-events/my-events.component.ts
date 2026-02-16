import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { EventService } from '../../services/event.service';
import { VolleyballEvent } from '../../models/event.model';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    DatePipe,
    TitleCasePipe,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>My Events</h1>
        <a mat-raised-button color="primary" routerLink="/events/create">
          <mat-icon>add</mat-icon>
          Create Event
        </a>
      </div>

      @if (loading) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
        </div>
      } @else {
        <mat-tab-group>
          <mat-tab label="Upcoming ({{ upcomingEvents.length }})">
            @if (upcomingEvents.length === 0) {
              <mat-card class="empty-state">
                <mat-icon>event_busy</mat-icon>
                <h3>No upcoming events</h3>
                <p>Browse events to join one, or create your own!</p>
                <div class="empty-actions">
                  <a mat-raised-button routerLink="/events">Browse Events</a>
                  <a mat-raised-button color="primary" routerLink="/events/create">Create Event</a>
                </div>
              </mat-card>
            } @else {
              <div class="events-grid">
                @for (event of upcomingEvents; track event.id) {
                  <mat-card class="event-card" [routerLink]="['/events', event.id]" tabindex="0">
                    <mat-card-header>
                      <mat-icon mat-card-avatar class="event-type-icon">
                        @if (event.is_indoor) {
                          fitness_center
                        } @else {
                          beach_access
                        }
                      </mat-icon>
                      <mat-card-title>{{ event.title }}</mat-card-title>
                      <mat-card-subtitle>
                        {{ event.event_date | date: 'EEEE, MMM d, y - h:mm a' }}
                      </mat-card-subtitle>
                    </mat-card-header>

                    <mat-card-content>
                      <div class="event-details">
                        <div class="detail">
                          <mat-icon>location_on</mat-icon>
                          <span>{{ event.location_name }} — {{ event.court_name }}</span>
                        </div>
                        <div class="detail">
                          <mat-icon>place</mat-icon>
                          <span>{{ event.location_city }}, {{ event.location_state }}</span>
                        </div>
                        <div class="detail">
                          <mat-icon>group</mat-icon>
                          <span>{{ event.signup_count || 0 }} / {{ event.max_players }} players</span>
                        </div>
                      </div>

                      <div class="event-chips">
                        <mat-chip-set>
                          <mat-chip>{{ event.skill_level | titlecase }}</mat-chip>
                          @if (event.is_organizer) {
                            <mat-chip highlighted>Organizer</mat-chip>
                          } @else {
                            <mat-chip>Signed Up</mat-chip>
                          }
                        </mat-chip-set>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            }
          </mat-tab>

          <mat-tab label="Past ({{ pastEvents.length }})">
            @if (pastEvents.length === 0) {
              <mat-card class="empty-state">
                <mat-icon>history</mat-icon>
                <h3>No past events</h3>
                <p>Your completed events will show up here.</p>
              </mat-card>
            } @else {
              <div class="events-grid">
                @for (event of pastEvents; track event.id) {
                  <mat-card class="event-card past" [routerLink]="['/events', event.id]" tabindex="0">
                    <mat-card-header>
                      <mat-icon mat-card-avatar class="event-type-icon">
                        @if (event.is_indoor) {
                          fitness_center
                        } @else {
                          beach_access
                        }
                      </mat-icon>
                      <mat-card-title>{{ event.title }}</mat-card-title>
                      <mat-card-subtitle>
                        {{ event.event_date | date: 'EEEE, MMM d, y - h:mm a' }}
                      </mat-card-subtitle>
                    </mat-card-header>

                    <mat-card-content>
                      <div class="event-details">
                        <div class="detail">
                          <mat-icon>location_on</mat-icon>
                          <span>{{ event.location_name }} — {{ event.court_name }}</span>
                        </div>
                        <div class="detail">
                          <mat-icon>group</mat-icon>
                          <span>{{ event.signup_count || 0 }} / {{ event.max_players }} players</span>
                        </div>
                      </div>

                      <div class="event-chips">
                        <mat-chip-set>
                          <mat-chip>{{ event.skill_level | titlecase }}</mat-chip>
                          @if (event.is_organizer) {
                            <mat-chip highlighted>Organizer</mat-chip>
                          } @else {
                            <mat-chip>Signed Up</mat-chip>
                          }
                        </mat-chip-set>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            }
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1000px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-header h1 {
      margin: 0;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      margin-top: 16px;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }

    .empty-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-top: 16px;
    }

    .events-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 16px;
      padding: 16px 0;
    }

    @media (max-width: 600px) {
      .events-grid {
        grid-template-columns: 1fr;
      }
    }

    .event-card {
      cursor: pointer;
      transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
      border: 1px solid #CFD8DC;
    }

    .event-card:hover {
      box-shadow: 0 4px 16px rgba(0, 137, 123, 0.15);
      border-color: #4DB6AC;
      transform: translateY(-2px);
    }

    .event-card.past {
      opacity: 0.7;
    }

    .event-type-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #FF8F00;
    }

    .event-details {
      margin-top: 8px;
    }

    .detail {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      font-size: 14px;
      color: #555;
    }

    .detail mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #00897B;
    }

    .event-chips {
      margin-top: 12px;
    }
  `],
})
export class MyEventsComponent implements OnInit {
  allEvents: VolleyballEvent[] = [];
  loading = true;

  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.loadMyEvents();
  }

  get upcomingEvents(): VolleyballEvent[] {
    const now = new Date();
    return this.allEvents.filter(e => new Date(e.event_date) >= now);
  }

  get pastEvents(): VolleyballEvent[] {
    const now = new Date();
    return this.allEvents.filter(e => new Date(e.event_date) < now);
  }

  loadMyEvents() {
    this.loading = true;
    this.eventService.getMyEvents().subscribe({
      next: (res) => {
        this.allEvents = res.events;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}

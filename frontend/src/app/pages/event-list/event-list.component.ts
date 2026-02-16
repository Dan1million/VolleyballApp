import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSliderModule } from '@angular/material/slider';
import { DatePipe, TitleCasePipe, DecimalPipe } from '@angular/common';
import { EventService } from '../../services/event.service';
import { VolleyballEvent, EventSearchParams } from '../../models/event.model';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSliderModule,
    DatePipe,
    TitleCasePipe,
    DecimalPipe,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Find Events</h1>
        <a mat-raised-button color="primary" routerLink="/events/create">
          <mat-icon>add</mat-icon>
          Create Event
        </a>
      </div>

      <!-- Search Filters -->
      <mat-card class="filter-card">
        <mat-card-content>
          <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="filter-form">
            <div class="filter-row">
              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Sort By</mat-label>
                <mat-select formControlName="sortBy">
                  <mat-option value="date">Event Date</mat-option>
                  <mat-option value="created">Recently Created</mat-option>
                  <mat-option value="distance" [disabled]="!hasLocation">Distance</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Search Radius (miles)</mat-label>
                <input matInput type="number" formControlName="radiusMiles" min="1" max="500" />
              </mat-form-field>

              <div class="filter-actions">
                <button mat-stroked-button type="button" (click)="useMyLocation()" [disabled]="gettingLocation">
                  <mat-icon>my_location</mat-icon>
                  @if (gettingLocation) {
                    Getting location...
                  } @else if (hasLocation) {
                    Location set ✓
                  } @else {
                    Use My Location
                  }
                </button>
                <button mat-raised-button color="primary" type="submit">
                  <mat-icon>search</mat-icon>
                  Search
                </button>
              </div>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Results -->
      @if (loading) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (events.length === 0) {
        <mat-card class="empty-state">
          <mat-icon>event_busy</mat-icon>
          <h3>No events found</h3>
          <p>Try adjusting your search or create a new event!</p>
          <a mat-raised-button color="primary" routerLink="/events/create">Create Event</a>
        </mat-card>
      } @else {
        <div class="events-grid">
          @for (event of events; track event.id) {
            <mat-card class="event-card" [routerLink]="['/events', event.id]" tabindex="0">
              <mat-card-header>
                <mat-icon mat-card-avatar class="event-type-icon" [class]="event.court_type">
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
                  <div class="detail">
                    <mat-icon>person</mat-icon>
                    <span>Created by {{ event.creator_first_name }} {{ event.creator_last_name }}</span>
                  </div>
                  @if (event.distance_miles !== undefined && event.distance_miles !== null) {
                    <div class="detail">
                      <mat-icon>near_me</mat-icon>
                      <span>{{ event.distance_miles | number: '1.1-1' }} miles away</span>
                    </div>
                  }
                </div>

                <div class="event-chips">
                  <mat-chip-set>
                    <mat-chip>{{ event.skill_level | titlecase }}</mat-chip>
                    <mat-chip>{{ event.surface_type | titlecase }}</mat-chip>
                    @if (event.is_indoor) {
                      <mat-chip>Indoor</mat-chip>
                    } @else {
                      <mat-chip>Outdoor</mat-chip>
                    }
                  </mat-chip-set>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>

        <mat-paginator
          [length]="totalEvents"
          [pageSize]="pageSize"
          [pageIndex]="currentPage - 1"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPageChange($event)"
          showFirstLastButtons
        ></mat-paginator>
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

    .filter-card {
      margin-bottom: 24px;
    }

    .filter-form .filter-row {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .filter-field {
      min-width: 180px;
    }

    .filter-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }

    .events-grid {
      display: grid;
      gap: 16px;
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

    .event-type-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .event-type-icon.beach {
      color: #FF8F00;
    }

    .event-type-icon.indoor {
      color: #00897B;
    }

    .event-type-icon.outdoor {
      color: #43A047;
    }

    .event-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 12px;
    }

    .detail {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #555;
      font-size: 14px;
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

    mat-paginator {
      margin-top: 16px;
    }
  `],
})
export class EventListComponent implements OnInit {
  events: VolleyballEvent[] = [];
  loading = true;
  totalEvents = 0;
  currentPage = 1;
  pageSize = 20;
  hasLocation = false;
  gettingLocation = false;

  searchForm: FormGroup;

  private userLatitude?: number;
  private userLongitude?: number;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      sortBy: ['date'],
      radiusMiles: [50],
    });
  }

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.loading = true;
    const formValue = this.searchForm.value;

    const params: EventSearchParams = {
      sortBy: formValue.sortBy,
      page: this.currentPage,
      limit: this.pageSize,
    };

    if (this.hasLocation && this.userLatitude && this.userLongitude) {
      params.latitude = this.userLatitude;
      params.longitude = this.userLongitude;
      params.radiusMiles = formValue.radiusMiles;
    }

    this.eventService.searchEvents(params).subscribe({
      next: (response) => {
        this.events = response.events;
        this.totalEvents = response.pagination.total;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadEvents();
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadEvents();
  }

  useMyLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    this.gettingLocation = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.userLatitude = position.coords.latitude;
        this.userLongitude = position.coords.longitude;
        this.hasLocation = true;
        this.gettingLocation = false;
        this.searchForm.patchValue({ sortBy: 'distance' });
        this.onSearch();
      },
      (error) => {
        this.gettingLocation = false;
        alert('Unable to get your location. Please allow location access.');
        console.error('Geolocation error:', error);
      }
    );
  }
}

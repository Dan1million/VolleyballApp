import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { LocationService } from '../../services/location.service';
import { EventService } from '../../services/event.service';
import { Location, Court } from '../../models/location.model';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule,
    TitleCasePipe,
  ],
  template: `
    <div class="page-container">
      <h1>Create Event</h1>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="eventForm" (ngSubmit)="onSubmit()">
            <!-- Location & Court -->
            <h3>Location & Court</h3>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Location</mat-label>
              <mat-select formControlName="locationId" (selectionChange)="onLocationChange($event.value)">
                @for (loc of locations; track loc.id) {
                  <mat-option [value]="loc.id">
                    {{ loc.name }} — {{ loc.city }}, {{ loc.state }}
                  </mat-option>
                }
              </mat-select>
              @if (eventForm.get('locationId')?.hasError('required') && eventForm.get('locationId')?.touched) {
                <mat-error>Please select a location</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Court</mat-label>
              <mat-select formControlName="courtId">
                @for (court of courts; track court.id) {
                  <mat-option [value]="court.id">
                    {{ court.name }} ({{ court.surface_type | titlecase }}, {{ court.court_type | titlecase }})
                  </mat-option>
                }
              </mat-select>
              @if (eventForm.get('courtId')?.hasError('required') && eventForm.get('courtId')?.touched) {
                <mat-error>Please select a court</mat-error>
              }
            </mat-form-field>

            <!-- Event Details -->
            <h3>Event Details</h3>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Event Title</mat-label>
              <input matInput formControlName="title" placeholder="e.g., Saturday Morning Pickup" />
              @if (eventForm.get('title')?.hasError('required') && eventForm.get('title')?.touched) {
                <mat-error>Title is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3"
                placeholder="Tell players what to expect..."></textarea>
            </mat-form-field>

            <div class="row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Event Date</mat-label>
                <input matInput [matDatepicker]="datePicker" formControlName="eventDate" />
                <mat-datepicker-toggle matIconSuffix [for]="datePicker"></mat-datepicker-toggle>
                <mat-datepicker #datePicker></mat-datepicker>
                @if (eventForm.get('eventDate')?.hasError('required') && eventForm.get('eventDate')?.touched) {
                  <mat-error>Date is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Event Time</mat-label>
                <input matInput type="time" formControlName="eventTime" />
                @if (eventForm.get('eventTime')?.hasError('required') && eventForm.get('eventTime')?.touched) {
                  <mat-error>Time is required</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Max Players</mat-label>
                <input matInput type="number" formControlName="maxPlayers" min="2" max="100" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Skill Level</mat-label>
                <mat-select formControlName="skillLevel">
                  <mat-option value="all">All Levels</mat-option>
                  <mat-option value="beginner">Beginner</mat-option>
                  <mat-option value="intermediate">Intermediate</mat-option>
                  <mat-option value="advanced">Advanced</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-button type="button" (click)="onCancel()">Cancel</button>
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="eventForm.invalid || submitting"
              >
                @if (submitting) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  Create Event
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 700px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 24px;
    }

    h3 {
      margin-top: 24px;
      margin-bottom: 12px;
      color: #444;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
    }

    .row {
      display: flex;
      gap: 16px;
    }

    @media (max-width: 600px) {
      .row {
        flex-direction: column;
        gap: 0;
      }
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
    }
  `],
})
export class CreateEventComponent implements OnInit {
  eventForm: FormGroup;
  locations: Location[] = [];
  courts: Court[] = [];
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private eventService: EventService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.eventForm = this.fb.group({
      locationId: ['', Validators.required],
      courtId: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      eventDate: ['', Validators.required],
      eventTime: ['', Validators.required],
      maxPlayers: [12],
      skillLevel: ['all'],
    });
  }

  ngOnInit() {
    this.locationService.getLocations().subscribe({
      next: (locations) => (this.locations = locations),
      error: () => this.snackBar.open('Failed to load locations.', 'Close', { duration: 3000 }),
    });
  }

  onLocationChange(locationId: number) {
    this.courts = [];
    this.eventForm.patchValue({ courtId: '' });

    this.locationService.getCourts(locationId).subscribe({
      next: (courts) => (this.courts = courts),
      error: () => this.snackBar.open('Failed to load courts.', 'Close', { duration: 3000 }),
    });
  }

  onSubmit() {
    if (this.eventForm.invalid) return;

    this.submitting = true;
    const formValue = this.eventForm.value;

    // Combine date and time
    const date = new Date(formValue.eventDate);
    const [hours, minutes] = formValue.eventTime.split(':');
    date.setHours(parseInt(hours), parseInt(minutes));

    this.eventService
      .createEvent({
        courtId: formValue.courtId,
        title: formValue.title,
        description: formValue.description,
        eventDate: date.toISOString(),
        maxPlayers: formValue.maxPlayers,
        skillLevel: formValue.skillLevel,
      })
      .subscribe({
        next: (event) => {
          this.snackBar.open('Event created successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/events', event.id]);
        },
        error: (err) => {
          this.submitting = false;
          this.snackBar.open(err.error?.error || 'Failed to create event.', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  onCancel() {
    this.router.navigate(['/events']);
  }
}

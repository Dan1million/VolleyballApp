import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { DatePipe } from '@angular/common';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    DatePipe,
  ],
  template: `
    <div class="page-container">
      <h1>My Account</h1>

      @if (loading) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (user) {
        <div class="account-grid">
          <!-- Account Summary Card -->
          <mat-card class="summary-card">
            <mat-card-header>
              <mat-icon mat-card-avatar class="avatar-icon">account_circle</mat-icon>
              <mat-card-title>{{ user.firstName }} {{ user.lastName }}</mat-card-title>
              <mat-card-subtitle>{{ user.email }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <mat-divider></mat-divider>
              <div class="info-grid">
                <div class="info-item">
                  <mat-icon>cake</mat-icon>
                  <div>
                    <span class="label">Date of Birth</span>
                    <span class="value">{{ user.dateOfBirth ? (user.dateOfBirth | date: 'mediumDate') : 'Not set' }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <mat-icon>calendar_today</mat-icon>
                  <div>
                    <span class="label">Member Since</span>
                    <span class="value">{{ user.createdAt | date: 'mediumDate' }}</span>
                  </div>
                </div>
                @if (user.dateOfBirth) {
                  <div class="info-item">
                    <mat-icon>person</mat-icon>
                    <div>
                      <span class="label">Age</span>
                      <span class="value">{{ calculateAge(user.dateOfBirth) }} years old</span>
                    </div>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Edit Profile Card -->
          <mat-card class="edit-card">
            <mat-card-header>
              <mat-card-title>Edit Profile</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="profileForm" (ngSubmit)="onSave()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>First Name</mat-label>
                  <input matInput formControlName="firstName" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Last Name</mat-label>
                  <input matInput formControlName="lastName" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Date of Birth</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="dateOfBirth" />
                  <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                </mat-form-field>

                <button
                  mat-raised-button
                  color="primary"
                  type="submit"
                  [disabled]="saving || profileForm.pristine"
                >
                  @if (saving) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    Save Changes
                  }
                </button>
              </form>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 900px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 24px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .account-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    @media (max-width: 768px) {
      .account-grid {
        grid-template-columns: 1fr;
      }
    }

    .summary-card .avatar-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #00897B;
    }

    .info-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .info-item mat-icon {
      color: #666;
    }

    .info-item .label {
      display: block;
      font-size: 12px;
      color: #666;
    }

    .info-item .value {
      display: block;
      font-size: 14px;
      font-weight: 500;
    }

    .edit-card form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 16px;
    }

    .full-width {
      width: 100%;
    }

    mat-divider {
      margin: 16px 0;
    }
  `],
})
export class AccountComponent implements OnInit {
  user: User | null = null;
  profileForm: FormGroup;
  loading = true;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      dateOfBirth: [''],
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load profile.', 'Close', { duration: 3000 });
      },
    });
  }

  onSave() {
    this.saving = true;
    const formValue = this.profileForm.value;
    const data = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      dateOfBirth: formValue.dateOfBirth
        ? new Date(formValue.dateOfBirth).toISOString().split('T')[0]
        : undefined,
    };

    this.userService.updateProfile(data).subscribe({
      next: (user) => {
        this.user = user;
        this.saving = false;
        this.profileForm.markAsPristine();
        this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Failed to update profile.', 'Close', { duration: 3000 });
      },
    });
  }

  calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
}

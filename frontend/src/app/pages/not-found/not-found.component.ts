import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="not-found-container">
      <mat-icon class="error-icon">error_outline</mat-icon>
      <h1>Uh Oh.</h1>
      <p>
        It looks like this page does not exist. If you think it should please email
        <a href="mailto:help@volleyball.app">help&#64;volleyball.app</a> to get help.
      </p>
      <a mat-raised-button color="primary" routerLink="/">
        <mat-icon>home</mat-icon>
        Back to Home
      </a>
    </div>
  `,
  styles: [`
    .not-found-container {
      text-align: center;
      padding: 80px 24px;
      max-width: 600px;
      margin: 0 auto;
    }

    .error-icon {
      font-size: 96px;
      width: 96px;
      height: 96px;
      color: #ccc;
    }

    h1 {
      font-size: 36px;
      margin: 16px 0 8px;
    }

    p {
      font-size: 18px;
      color: #555;
      line-height: 1.6;
      margin-bottom: 32px;
    }

    a:not([mat-raised-button]) {
      color: #00897B;
      text-decoration: none;
    }

    a:not([mat-raised-button]):hover {
      text-decoration: underline;
    }
  `],
})
export class NotFoundComponent {}

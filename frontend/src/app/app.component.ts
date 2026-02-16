import { Component } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent],
  template: `<app-navbar />`,
  styles: [],
})
export class AppComponent {}

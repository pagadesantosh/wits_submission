import { Component } from '@angular/core';
import { UserAvailabilityComponent } from './features/user-availability/user-availability.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UserAvailabilityComponent],
  template: `<app-user-availability />`,
})
export class AppComponent {}

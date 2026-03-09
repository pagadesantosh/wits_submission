import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserAvailabilityComponent } from '../user-availability/user-availability.component';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, UserAvailabilityComponent],
  templateUrl: './registration.component.html',
})
export class RegistrationComponent {
  readonly registeredUsername = signal<string | null>(null);

  onUsernameRegistered(username: string): void {
    this.registeredUsername.set(username);
  }
}

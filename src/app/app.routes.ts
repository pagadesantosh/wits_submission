import { Routes } from '@angular/router';
import { UserAvailabilityComponent } from './features/user-availability/user-availability.component';
import { RegistrationComponent } from './features/registration/registration.component';

export const routes: Routes = [
  { path: '', component: UserAvailabilityComponent },
  { path: 'register', component: RegistrationComponent },
  { path: '**', redirectTo: '' },
];

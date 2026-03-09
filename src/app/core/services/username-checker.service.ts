import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';

export interface AvailabilityResult {
  username: string;
  available: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsernameCheckerService {
  private readonly takenUsernames = new Set([
    'admin',
    'john_doe',
    'superuser',
    'test',
    'angular_dev',
    'root',
    'guest',
  ]);

  checkAvailability(username: string): Observable<AvailabilityResult> {
    const latency = this.randomLatency();

    // simulate occasional network failure
    if (Math.random() < 0.1) {
      return of(null).pipe(
        delay(latency),
        switchMap(() =>
          throwError(() => new Error('Simulated network timeout'))
        )
      );
    }

    const available = !this.takenUsernames.has(username.toLowerCase().trim());
    return of({ username, available }).pipe(delay(latency));
  }

  private randomLatency(): number {
    return Math.floor(Math.random() * 400) + 400;
  }
}

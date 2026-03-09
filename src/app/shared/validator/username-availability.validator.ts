import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { UsernameCheckerService } from '../../core/services/username-checker.service';

// factory so we can pass the service in (DI doesn't work in plain functions)
export function usernameAvailabilityValidator(
  service: UsernameCheckerService,
  debounceMs = 400
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value: string = (control.value ?? '').trim();

    // let sync validators handle short values first
    if (value.length < 3) {
      return of(null);
    }

    return timer(debounceMs).pipe(
      switchMap(() => service.checkAvailability(value)),
      map(result => (result.available ? null : { usernameTaken: { value } })),
      catchError(() => of({ networkError: true }))
    );
  };
}

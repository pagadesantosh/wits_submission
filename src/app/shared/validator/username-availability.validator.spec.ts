import { fakeAsync, tick } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { UsernameCheckerService } from '../../core/services/username-checker.service';
import { usernameAvailabilityValidator } from './username-availability.validator';

describe('usernameAvailabilityValidator', () => {
  let mockService: jasmine.SpyObj<UsernameCheckerService>;
  let control: FormControl;

  beforeEach(() => {
    mockService = jasmine.createSpyObj('UsernameCheckerService', ['checkAvailability']);
    control = new FormControl('');
  });

  it('returns null synchronously for short values without waiting', fakeAsync(() => {
    control.setValue('ab');
    const validator = usernameAvailabilityValidator(mockService, 400);
    let result: any;
    (validator(control) as any).subscribe((v: any) => (result = v));
    tick(0);
    expect(result).toBeNull();
    expect(mockService.checkAvailability).not.toHaveBeenCalled();
  }));

  it('sets null errors when username is available', fakeAsync(() => {
    mockService.checkAvailability.and.returnValue(
      of({ username: 'free_user', available: true }).pipe(delay(500))
    );
    const validator = usernameAvailabilityValidator(mockService, 400);
    let result: any;
    (validator(control) as any).subscribe((v: any) => (result = v));
    control.setValue('free_user');
    tick(900);
    expect(result).toBeNull();
  }));

  it('sets { usernameTaken } error when username is taken', fakeAsync(() => {
    mockService.checkAvailability.and.returnValue(
      of({ username: 'admin', available: false }).pipe(delay(500))
    );
    const validator = usernameAvailabilityValidator(mockService, 400);
    let result: any;
    control.setValue('admin');
    (validator(control) as any).subscribe((v: any) => (result = v));
    tick(900);
    expect(result).toEqual({ usernameTaken: { value: 'admin' } });
  }));

  it('sets { networkError } error on service failure', fakeAsync(() => {
    mockService.checkAvailability.and.returnValue(
      throwError(() => new Error('Network timeout'))
    );
    const validator = usernameAvailabilityValidator(mockService, 400);
    let result: any;
    control.setValue('some_user');
    (validator(control) as any).subscribe((v: any) => (result = v));
    tick(400);
    expect(result).toEqual({ networkError: true });
  }));
});

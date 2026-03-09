import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UsernameCheckerService } from './username-checker.service';
import { firstValueFrom } from 'rxjs';

describe('UsernameCheckerService', () => {
  let service: UsernameCheckerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsernameCheckerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return available=false for taken usernames', async () => {
    spyOn(Math, 'random').and.returnValue(0.5);
    const result = await firstValueFrom(service.checkAvailability('admin'));
    expect(result.available).toBeFalse();
  });

  it('should return available=true for free usernames', async () => {
    spyOn(Math, 'random').and.returnValue(0.5);
    const result = await firstValueFrom(service.checkAvailability('new_user_xyz'));
    expect(result.available).toBeTrue();
  });

  it('should be case-insensitive', async () => {
    spyOn(Math, 'random').and.returnValue(0.5);
    const result = await firstValueFrom(service.checkAvailability('ADMIN'));
    expect(result.available).toBeFalse();
  });

  it('should throw when the simulated network error fires', fakeAsync(async () => {
    spyOn(Math, 'random').and.returnValue(0.05);
    let errorThrown = false;

    service.checkAvailability('any_user').subscribe({
      error: () => (errorThrown = true),
    });

    tick(900);
    expect(errorThrown).toBeTrue();
  }));
});

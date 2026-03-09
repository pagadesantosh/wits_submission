import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { UsernameCheckerService } from '../../core/services/username-checker.service';
import { usernameAvailabilityValidator } from '../../shared/validator/username-availability.validator';

export type CheckStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

@Component({
  selector: 'app-user-availability',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-availability.component.html',
  styleUrls: ['./user-availability.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvailabilityComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly checkerService = inject(UsernameCheckerService);
  private readonly destroy$ = new Subject<void>();

  readonly embedded = input(false);
  readonly usernameRegistered = output<string>();

  readonly checkStatus = signal<CheckStatus>('idle');
  readonly submittedPayload = signal<string | null>(null);
  readonly isSubmitting = signal(false);

  readonly statusLabel = computed<string>(() => {
    const map: Record<CheckStatus, string> = {
      idle: '',
      checking: 'Checking...',
      available: '✓ Available',
      taken: '✗ Already taken',
      error: '⚠ Try again',
    };
    return map[this.checkStatus()];
  });

  readonly form = this.fb.group({
    username: [
      '',
      {
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(/^[a-zA-Z0-9_]+$/),
        ],
        asyncValidators: [
          usernameAvailabilityValidator(this.checkerService, 400),
        ],
        updateOn: 'change',
      },
    ],
  });

  get usernameCtrl(): AbstractControl {
    return this.form.controls['username'];
  }

  ngOnInit(): void {
    this.usernameCtrl.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        if (this.usernameCtrl.value?.trim().length < 3) {
          this.checkStatus.set('idle');
          return;
        }

        if (status === 'PENDING') {
          this.checkStatus.set('checking');
          return;
        }

        if (status === 'VALID') {
          this.checkStatus.set('available');
          return;
        }

        if (status === 'INVALID') {
          const errors = this.usernameCtrl.errors ?? {};
          if (errors['usernameTaken']) {
            this.checkStatus.set('taken');
          } else if (errors['networkError']) {
            this.checkStatus.set('error');
          } else {
            this.checkStatus.set('idle');
          }
        }
      });

    this.usernameCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(val => {
        if (!val || val.trim().length < 3) {
          this.checkStatus.set('idle');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.form.invalid || this.checkStatus() !== 'available') return;

    this.isSubmitting.set(true);

    const payload = {
      username: this.usernameCtrl.value?.trim(),
      submittedAt: new Date().toISOString(),
      status: 'registered',
    };

    // simulate POST /users
    setTimeout(() => {
      this.submittedPayload.set(JSON.stringify(payload, null, 2));
      this.isSubmitting.set(false);
      this.usernameRegistered.emit(payload.username);
    }, 600);
  }

  onReset(): void {
    this.form.reset();
    this.checkStatus.set('idle');
    this.submittedPayload.set(null);
  }
}

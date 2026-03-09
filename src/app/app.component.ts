import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand navbar-light bg-white border-bottom px-4">
      <span class="navbar-brand fw-bold mb-0">Wits</span>
      <ul class="navbar-nav gap-3">
        <li class="nav-item">
          <a class="nav-link" routerLink="/" routerLinkActive="fw-semibold text-primary" [routerLinkActiveOptions]="{ exact: true }">
            Username Check
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/register" routerLinkActive="fw-semibold text-primary">
            Register
          </a>
        </li>
      </ul>
    </nav>
    <router-outlet />
  `,
})
export class AppComponent {}

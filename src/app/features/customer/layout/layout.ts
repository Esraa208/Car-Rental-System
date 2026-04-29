import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
import { ThemeToggle } from '../../../shared/components/theme-toggle/theme-toggle';
import { LangToggle } from '../../../shared/components/lang-toggle/lang-toggle';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { PageTitleService } from '../../../core/services/page-title-service';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggle, LangToggle, TranslatePipe],
  template: `
    <div class="customer-layout">
      <header class="topbar">
        <div class="flex items-center gap-4">
          <a routerLink="/" class="topbar-brand">
            <svg class="logo" viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.29 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01Z"/></svg>
            <span class="hide-mobile">{{ 'app.name' | translate }}</span>
          </a>
          <nav class="hide-mobile flex gap-2 ms-4">
            <a routerLink="/cars" routerLinkActive="active" class="nav-tab">{{ 'nav.myCars' | translate }}</a>
            <a routerLink="/orders" routerLinkActive="active" class="nav-tab">{{ 'nav.myOrders' | translate }}</a>
            <a routerLink="/installments" routerLinkActive="active" class="nav-tab">{{ 'nav.installments' | translate }}</a>
          </nav>
        </div>

        <div class="topbar-controls">
          <app-theme-toggle />
          <app-lang-toggle />
          <button class="btn btn-ghost btn-sm hide-mobile" (click)="auth.logout()">{{ 'nav.logout' | translate }}</button>
          <button class="btn btn-ghost btn-icon show-mobile" (click)="menuOpen = !menuOpen">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </header>

      @if (menuOpen) {
        <nav class="mobile-nav-panel">
          <a routerLink="/cars" routerLinkActive="active" class="nav-tab" (click)="menuOpen = false">{{ 'nav.myCars' | translate }}</a>
          <a routerLink="/orders" routerLinkActive="active" class="nav-tab" (click)="menuOpen = false">{{ 'nav.myOrders' | translate }}</a>
          <a routerLink="/installments" routerLinkActive="active" class="nav-tab" (click)="menuOpen = false">{{ 'nav.installments' | translate }}</a>
          <hr class="divider">
          <button class="btn btn-ghost btn-sm w-full justify-start" (click)="auth.logout(); menuOpen = false">
             {{ 'nav.logout' | translate }}
          </button>
        </nav>
      }

      <main class="page-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .customer-layout { min-height: 100vh; display: flex; flex-direction: column; background: var(--bg); }
    .show-mobile { display: none; }
    .logo { width: 1.5rem; height: 1.5rem; }
    @media (max-width: 768px) {
      .show-mobile { display: flex !important; }
      .hide-mobile { display: none !important; }
    }
  `]
})
export class Layout {
  auth = inject(AuthService);
  titleService = inject(PageTitleService);
  menuOpen = false;
}

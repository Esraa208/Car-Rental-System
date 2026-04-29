import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
import { ThemeToggle } from '../../../shared/components/theme-toggle/theme-toggle';
import { LangToggle } from '../../../shared/components/lang-toggle/lang-toggle';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

import { PageTitleService } from '../../../core/services/page-title-service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggle, LangToggle, TranslatePipe],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout implements OnDestroy {
  auth = inject(AuthService);
  titleService = inject(PageTitleService);
  sidebarOpen = signal(true);

  // FIXED: store reference so we can remove it in ngOnDestroy
  private resizeHandler = () => {
    if (this.sidebarOpen() && window.innerWidth <= 1024) {
      this.sidebarOpen.set(false);
    }
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.sidebarOpen.set(window.innerWidth > 1024);
      window.addEventListener('resize', this.resizeHandler);
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }

  toggleSidebar() { this.sidebarOpen.update(v => !v); }

  isDesktop() { 
    if (typeof window === 'undefined') return true;
    return window.innerWidth > 1024; 
  }

  closeSidebarOnMobile() {
    if (!this.isDesktop()) {
      this.sidebarOpen.set(false);
    }
  }
}

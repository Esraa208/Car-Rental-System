import { Injectable, signal, effect, computed } from '@angular/core';

export type Theme = 'light' | 'dark';
export type Lang = 'en' | 'ar';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private _theme = signal<Theme>(typeof localStorage !== 'undefined' ? (localStorage.getItem('theme') as Theme) ?? 'light' : 'light');
  private _lang = signal<Lang>(typeof localStorage !== 'undefined' ? (localStorage.getItem('lang') as Lang) ?? 'en' : 'en');
 
  readonly theme = this._theme.asReadonly();
  readonly lang = this._lang.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');
  readonly isRtl = computed(() => this._lang() === 'ar');
 
  constructor() {
    if (typeof document === 'undefined') return;

    effect(() => {
      const theme = this._theme();
      document.documentElement.setAttribute('data-theme', theme);
      if (typeof localStorage !== 'undefined') localStorage.setItem('theme', theme);
    });
 
    effect(() => {
      const lang = this._lang();
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      if (typeof localStorage !== 'undefined') localStorage.setItem('lang', lang);
    });
 
    // Init on startup
    document.documentElement.setAttribute('data-theme', this._theme());
    document.documentElement.setAttribute('lang', this._lang());
    document.documentElement.setAttribute('dir', this._lang() === 'ar' ? 'rtl' : 'ltr');
  }
 
  toggleTheme() {
    this._theme.update((t: Theme) => t === 'light' ? 'dark' : 'light');
  }
 
  setLang(lang: Lang) {
    this._lang.set(lang);
  }
 
  toggleLang() {
    this._lang.update((l: Lang) => l === 'en' ? 'ar' : 'en');
  }
}
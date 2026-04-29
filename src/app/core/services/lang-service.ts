import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ThemeService } from './theme-service';

@Injectable({ providedIn: 'root' })
export class LangService {
  private http = inject(HttpClient);
  private themeService = inject(ThemeService);

  private translations = signal<Record<string, Record<string, any>>>({});
  private loaded = signal<Set<string>>(new Set());

  constructor() {
    // Preload both languages for instant switching
    this.loadLang('en');
    this.loadLang('ar');
  }

  /** Translate a dot-notation key like 'auth.login' */
  t(key: any, params?: Record<string, any>): string {
    if (!key || typeof key !== 'string') return '';

    const lang = this.themeService.lang();
    const dict = this.translations()[lang];
    
    if (!dict) {
      // Still return key if dict not loaded yet
      return key;
    }
    
    let val = this.resolve(dict, key);
    if (val === undefined) return key;
    
    if (params) {
      Object.entries(params).forEach(([pk, pv]) => {
        val = (val as string).split(`{{${pk}}}`).join(String(pv));
      });
    }
    return val as string;
  }

  /** Load a language JSON file */
  private loadLang(lang: string) {
    if (this.loaded().has(lang)) return;
    this.loaded.update(s => { const n = new Set(s); n.add(lang); return n; });

    fetch(`/assets/i18n/${lang}.json`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        this.translations.update(t => ({ ...t, [lang]: data }));
      })
      .catch(err => {
        console.error(`[LangService] Failed to load translations for "${lang}":`, err);
      });
  }

  /** Resolve a nested key like 'auth.login' from { auth: { login: '...' } } */
  private resolve(obj: any, path: string): string | undefined {
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current == null || typeof current !== 'object') return undefined;
      current = current[part];
    }
    return typeof current === 'string' ? current : undefined;
  }
}

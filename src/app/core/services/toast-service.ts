import { Injectable, inject, signal } from '@angular/core';
import { LangService } from './lang-service';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private lang = inject(LangService);
  toasts = signal<Toast[]>([]);
  private nextId = 0;

  show(message: string, type: ToastType = 'success', duration = 3000, params?: Record<string, any>) {
    const id = this.nextId++;
    const translatedMessage = this.lang.t(message, params);
    const toast: Toast = { id, message: translatedMessage, type };
    this.toasts.update(t => [...t, toast]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(message: string, params?: Record<string, any>) { this.show(message, 'success', 3000, params); }
  error(message: string, params?: Record<string, any>) { this.show(message, 'error', 5000, params); }
  info(message: string, params?: Record<string, any>) { this.show(message, 'info', 3000, params); }
  warning(message: string, params?: Record<string, any>) { this.show(message, 'warning', 4000, params); }

  remove(id: number) {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }
}

import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PageTitleService {
  title = signal('');

  setTitle(title: string) {
    this.title.set(title);
  }
}

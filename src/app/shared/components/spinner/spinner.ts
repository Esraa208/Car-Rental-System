import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner" [class.spinner-sm]="size() === 'sm'" [class.spinner-lg]="size() === 'lg'" [style.display]="inline() ? 'inline-block' : 'block'" [style.margin]="inline() ? '0' : 'auto'"></div>
  `
})
export class Spinner {
  size = input<'sm' | 'md' | 'lg'>('md');
  inline = input(false);
}

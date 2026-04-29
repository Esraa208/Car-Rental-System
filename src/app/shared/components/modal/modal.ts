import { Component, input, output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'modal.html',
  styleUrl: 'modal.scss',
})
export class Modal {
  open = input(false);
  title = input('');
  hideHeader = input(false);
  fullBleed = input(false);
  closed = output<void>();

  // FIXED: allow Escape key to close modal
  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.open()) {
      this.closed.emit();
    }
  }
}

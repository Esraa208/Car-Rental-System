import { Component, input } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: 'empty-state.html',
  styleUrl: 'empty-state.scss',
})
export class EmptyState {
  message = input<string>('');
}

import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme-service';

@Component({
  selector: 'app-lang-toggle',
  standalone: true,
  templateUrl: 'lang-toggle.html',
  styleUrl: 'lang-toggle.scss',
})
export class LangToggle {
  theme = inject(ThemeService);
}

import { Pipe, PipeTransform, inject } from '@angular/core';
import { LangService } from '../../core/services/lang-service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private lang = inject(LangService);

  transform(key: string, params?: Record<string, any>): string {
    return this.lang.t(key, params);
  }
}

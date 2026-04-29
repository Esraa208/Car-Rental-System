import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
import { LangService } from '../../../core/services/lang-service';
import { AppError } from '../../../core/models';
import { ThemeToggle } from '../../../shared/components/theme-toggle/theme-toggle';
import { LangToggle } from '../../../shared/components/lang-toggle/lang-toggle';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ThemeToggle, LangToggle, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  lang = inject(LangService);

  loading = signal(false);
  error = signal('');
  backendErrors = signal<Record<string, string[]>>({});
  role = signal<'admin' | 'customer'>('customer');

  setRole(r: 'admin' | 'customer') {
    this.role.set(r);
    this.error.set('');
    this.backendErrors.set({});
  }

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  get email() { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');
    this.backendErrors.set({});
    this.auth.login(this.form.value as any, this.role()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(this.role() === 'admin' ? ['/admin'] : ['/cars']);
      },
      error: (err: AppError) => {
        this.loading.set(false);
        this.error.set(err.message || this.lang.t('errors.generic'));
        if (err.errors) this.backendErrors.set(err.errors);
      }
    });
  }
}

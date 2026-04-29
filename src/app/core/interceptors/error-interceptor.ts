import { inject, Injector } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AppError } from '../models';
import { ToastService } from '../services/toast-service';
import { AuthService } from '../services/auth-service';


export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);
  const injector = inject(Injector);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const appError: AppError = {
        status: error.status,
        message: error.error?.message ?? error.message ?? 'An unexpected error occurred.',
        errors: error.error?.errors
      };
      const isHandlingUnauth = typeof window !== 'undefined' && (window as any).__unauth_handled;

      if (error.status === 401 && !isHandlingUnauth && !req.url.includes('/login')) {
        console.warn('[ErrorInterceptor] 401 Unauthorized - Redirecting to login. URL:', req.url);
        if (typeof window !== 'undefined') (window as any).__unauth_handled = true;
        
        // Use authService.logout() via injector to ensure signals and storage are BOTH cleared
        const authService = injector.get(AuthService);
        authService.logout();
      } else if (error.status === 403) {
        console.warn('[ErrorInterceptor] 403 Forbidden. URL:', req.url);
        router.navigate(['/unauthorized']);
      } else {
        console.error('[ErrorInterceptor] API Error:', appError.message, 'URL:', req.url);
        toast.error(appError.message);
      }

      return throwError(() => appError);
    })
  );
};

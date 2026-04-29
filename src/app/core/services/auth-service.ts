import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, EMPTY } from 'rxjs';
import { User, AuthResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
 
  private readonly TOKEN_KEY = 'car_rental_token';
  private readonly USER_KEY = 'car_rental_user';
 
  private _token = signal<string | null>(typeof localStorage !== 'undefined' ? localStorage.getItem(this.TOKEN_KEY) : null);
  private _user = signal<User | null>(typeof localStorage !== 'undefined' ? this.loadUser() : null);
 
  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._user()?.role === 'admin');
  readonly isCustomer = computed(() => this._user()?.role === 'customer');
 
  private loadUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  }
 
  login(credentials: { email: string; password: string }, role: 'admin' | 'customer' = 'customer') {
    const url = `${environment.apiBase}/${role}/login`;
    return this.http.post<AuthResponse>(url, credentials).pipe(
      tap(res => this.persist(res))
    );
  }
 
  register(payload: { name: string; email: string; password: string; password_confirmation: string; country?: string; phone?: string }, role: 'admin' | 'customer' = 'customer') {
    return this.http.post<AuthResponse>(`${environment.apiBase}/${role}/register`, payload).pipe(
      tap(res => this.persist(res))
    );
  }
 
  logout() {
    const u = this.user() || this.loadUser();
    const role = u?.role === 'admin' ? 'admin' : 'customer';
    this.http.post(`${environment.apiBase}/${role}/logout`, {}).pipe(
      catchError(() => EMPTY)
    ).subscribe();
    this.clear();
    this.router.navigate(['/login']);
  }
 
  me() {
    const u = this.user() || this.loadUser();
    const role = u?.role === 'admin' ? 'admin' : 'customer';
    return this.http.get<{ data: User }>(`${environment.apiBase}/${role}/me`).pipe(
      tap(res => {
        this._user.set(res.data);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.data));
      })
    );
  }
 
  private persist(res: AuthResponse) {
    this._token.set(res.token);
    this._user.set(res.user);
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    
    // Reset any previous auth error handling state
    if (typeof window !== 'undefined') {
       (window as any).__unauth_handled = false;
    }
  }
 
  private clear() {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}

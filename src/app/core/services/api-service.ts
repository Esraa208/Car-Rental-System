import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  User, Car, Order, Installment, 
  PaginatedResponse, ApiResponse, QueryParams 
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiBase;
 
  private buildParams(query: QueryParams = {}): HttpParams {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return params;
  }
 
  // ─── Admin: Users ─────────────────────────────────────────────────────────
  adminUsers(query?: QueryParams): Observable<PaginatedResponse<User>> {
    return this.http.get<PaginatedResponse<User>>(`${this.base}/admin/users`, { params: this.buildParams(query) });
  }
 
  adminUser(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.base}/admin/users/${id}`);
  }
 
  // ─── Admin: Cars ──────────────────────────────────────────────────────────
  adminCars(query?: QueryParams): Observable<PaginatedResponse<Car>> {
    return this.http.get<PaginatedResponse<Car>>(`${this.base}/admin/cars`, { params: this.buildParams(query) });
  }
 
  adminCar(id: number): Observable<ApiResponse<Car>> {
    return this.http.get<ApiResponse<Car>>(`${this.base}/admin/cars/${id}`);
  }
 
  adminCreateCar(payload: Partial<Car>): Observable<ApiResponse<Car>> {
    return this.http.post<ApiResponse<Car>>(`${this.base}/admin/cars`, payload);
  }
 
  adminUpdateCar(id: number, payload: Partial<Car>): Observable<ApiResponse<Car>> {
    return this.http.put<ApiResponse<Car>>(`${this.base}/admin/cars/${id}`, payload);
  }
 
  adminDeleteCar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/admin/cars/${id}`);
  }
 
  // ─── Admin: Orders ────────────────────────────────────────────────────────
  adminOrders(query?: QueryParams): Observable<PaginatedResponse<Order>> {
    return this.http.get<PaginatedResponse<Order>>(`${this.base}/admin/orders`, { params: this.buildParams(query) });
  }
 
  adminOrder(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.base}/admin/orders/${id}`);
  }
 
  adminUpdateOrder(id: number, payload: Partial<Order>): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(`${this.base}/admin/orders/${id}`, payload);
  }
 
  // ─── Customer: Cars ───────────────────────────────────────────────────────
  customerCars(query?: QueryParams): Observable<PaginatedResponse<Car>> {
    return this.http.get<PaginatedResponse<Car>>(`${this.base}/customer/cars`, { params: this.buildParams(query) });
  }
 
  customerCar(id: number): Observable<ApiResponse<Car>> {
    return this.http.get<ApiResponse<Car>>(`${this.base}/customer/cars/${id}`);
  }
 
  // ─── Customer: Orders ─────────────────────────────────────────────────────
  customerOrders(query?: QueryParams): Observable<PaginatedResponse<Order>> {
    return this.http.get<PaginatedResponse<Order>>(`${this.base}/customer/orders`, { params: this.buildParams(query) });
  }
 
  customerOrder(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.base}/customer/orders/${id}`);
  }
 
  customerCreateOrder(payload: Partial<Order>): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.base}/customer/orders`, payload);
  }
 
  // ─── Customer: Installments ───────────────────────────────────────────────
  customerInstallments(query?: QueryParams): Observable<PaginatedResponse<Installment>> {
    return this.http.get<PaginatedResponse<Installment>>(`${this.base}/customer/installments`, { params: this.buildParams(query) });
  }
 
  payInstallment(id: number): Observable<ApiResponse<Installment>> {
    return this.http.post<ApiResponse<Installment>>(`${this.base}/customer/installments/${id}/pay`, {});
  }
}

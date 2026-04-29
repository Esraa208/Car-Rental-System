export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  wallet: number;
  country?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Car {
  id: number;
  name?: string;
  brand: string;
  model: string;
  kilometers?: number;
  price_per_day: string | number;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: number;
  user_id: number;
  car_id: number;
  user?: User;
  car?: Car;
  delivery_date: string;
  receiving_date: string;
  days: number;
  total_price: string | number;
  points?: number;
  payment_type: 'cash' | 'visa' | 'tamara';
  order_type: 'full' | 'installments';
  payment_status: 'pending' | 'success' | 'failed' | 'partial';
  installments?: Installment[];
  created_at?: string;
}

export interface Installment {
  id: number;
  order_id: number;
  order?: Order;
  amount: number;
  due_date: string;
  paid_at?: string;
  status: 'pending' | 'success' | 'failed';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface QueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface AppError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}
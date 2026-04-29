import { Component, inject, signal, OnInit, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../core/services/api-service';
import { Car, AppError } from '../../../../core/models';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Modal } from '../../../../shared/components/modal/modal';
import { CarCard } from '../../../../shared/components/car-card/car-card';
import { ToastService } from '../../../../core/services/toast-service';

@Component({
  selector: 'app-customer-cars-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Spinner, EmptyState, TranslatePipe, Modal, CarCard],
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class List implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  cars = signal<Car[]>([]);
  loading = signal(true);
  
  // Filters
  search = signal('');
  brand = signal('');
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  
  meta = signal({ 
    current_page: 1, 
    last_page: 1, 
    per_page: 10, 
    total: 0, 
    from: 0, 
    to: 0 
  });

  // Modal & Booking
  selectedCar = signal<Car | null>(null);
  isModalOpen = signal(false);
  booking = signal(false);
  bookingError = signal('');
  bookingSuccess = signal(false);
  isLoadingDetails = signal(false);

  // Calculations
  calculatedDays = signal(0);
  totalPrice = signal(0);

  bookingForm = this.fb.group({
    delivery_date: ['', Validators.required],
    receiving_date: ['', Validators.required],
    payment_type: ['cash', Validators.required],
    order_type: ['full', Validators.required],
  });

  pageNumbers = computed(() => {
    const total = this.meta().last_page;
    const current = this.meta().current_page;
    const pages = [];
    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
      pages.push(i);
    }
    return pages;
  });

  private debounceTimer: any;

  constructor() {
    this.bookingForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.calculateTotal();
    });
  }

  ngOnInit() {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.search.set(params['search'] || '');
      this.brand.set(params['brand'] || '');
      this.minPrice.set(params['min_price'] ? Number(params['min_price']) : null);
      this.maxPrice.set(params['max_price'] ? Number(params['max_price']) : null);
      this.loadData(params);
    });
  }

  loadData(params: any = {}) {
    this.loading.set(true);
    const query = {
      per_page: params.per_page || 10,
      page: params.page || 1,
      search: params.search || '',
      brand: params.brand || '',
      min_price: params.min_price || '',
      max_price: params.max_price || '',
    };

    this.api.customerCars(query).subscribe({
      next: (res: any) => {
        let items = [];
        let metaInfo = res.meta || res;

        if (res.data && Array.isArray(res.data)) {
          items = res.data;
        } else if (res.data?.data && Array.isArray(res.data.data)) {
          items = res.data.data;
          metaInfo = res.data;
        } else if (Array.isArray(res)) {
          items = res;
        }

        this.cars.set(items);
        this.meta.set({
          current_page: metaInfo?.current_page || 1,
          last_page: metaInfo?.last_page || 1,
          per_page: Number(metaInfo?.per_page) || 10,
          total: metaInfo?.total || items.length,
          from: metaInfo?.from || 0,
          to: metaInfo?.to || 0
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private calculateTotal() {
    const { delivery_date, receiving_date } = this.bookingForm.value;
    const car = this.selectedCar();

    if (delivery_date && receiving_date && car) {
      const start = new Date(delivery_date);
      const end = new Date(receiving_date);
      
      if (end > start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        this.calculatedDays.set(diffDays);
        this.totalPrice.set(diffDays * Number(car.price_per_day));
      } else {
        this.calculatedDays.set(0);
        this.totalPrice.set(0);
      }
    } else {
      this.calculatedDays.set(0);
      this.totalPrice.set(0);
    }
  }

  onSearch(value: string) {
    this.search.set(value);
    this.debounce(() => this.updateQuery({ search: value, page: 1 }));
  }

  onBrand(value: string) {
    this.brand.set(value);
    this.debounce(() => this.updateQuery({ brand: value, page: 1 }));
  }

  onMinPrice(value: number) {
    this.minPrice.set(value);
    this.debounce(() => this.updateQuery({ min_price: value, page: 1 }));
  }

  onMaxPrice(value: number) {
    this.maxPrice.set(value);
    this.debounce(() => this.updateQuery({ max_price: value, page: 1 }));
  }

  onPageChange(page: number) {
    this.updateQuery({ page });
  }

  onPerPageChange(per_page: number) {
    this.updateQuery({ per_page, page: 1 });
  }

  viewCar(car: Car) {
    this.selectedCar.set(car); // Optimistic immediate show
    this.isModalOpen.set(true);
    this.bookingError.set('');
    this.bookingSuccess.set(false);
    this.calculatedDays.set(0);
    this.totalPrice.set(0);
    this.bookingForm.reset({
      payment_type: 'cash',
      order_type: 'full'
    });
    
    this.isLoadingDetails.set(true);
    this.api.customerCar(car.id).subscribe({
      next: (res: any) => {
        this.selectedCar.set(res.data || res);
        this.isLoadingDetails.set(false);
      },
      error: () => {
        this.isLoadingDetails.set(false);
      }
    });
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedCar.set(null);
  }

  submitBooking() {
    if (this.bookingForm.invalid || this.calculatedDays() <= 0) return;
    const car = this.selectedCar();
    if (!car) return;

    this.booking.set(true);
    this.bookingError.set('');

    const payload = { car_id: car.id, ...this.bookingForm.value };
    this.api.customerCreateOrder(payload as any).subscribe({
      next: (res) => {
        this.booking.set(false);
        this.toast.success('orders.created');
        this.closeModal();
        this.router.navigate(['/orders']);
      },
      error: (err: AppError) => {
        this.booking.set(false);
        this.toast.error(err.message || 'Booking failed');
      }
    });
  }

  private updateQuery(params: any) {
    this.router.navigate([], {
      queryParams: params,
      queryParamsHandling: 'merge'
    });
  }

  private debounce(fn: Function) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(fn, 400);
  }
}

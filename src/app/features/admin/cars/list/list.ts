import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../core/services/api-service';
import { LangService } from '../../../../core/services/lang-service';
import { PageTitleService } from '../../../../core/services/page-title-service';
import { Car, PaginatedResponse } from '../../../../core/models';
import { DataTable, TableColumn } from '../../../../shared/components/data-table/data-table';
import { Modal } from '../../../../shared/components/modal/modal';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../../core/services/toast-service';
import { Spinner } from '../../../../shared/components/spinner/spinner';

@Component({
  selector: 'app-admin-cars-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DataTable, Modal, TranslatePipe, Spinner],
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class List implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  lang = inject(LangService);
  private titleService = inject(PageTitleService);
  private destroyRef = inject(DestroyRef);

  cars = signal<Car[]>([]);
  loading = signal(true);
  brandFilter = signal('');
  minPriceFilter = signal<number | null>(null);
  maxPriceFilter = signal<number | null>(null);
  selectedCar = signal<Car | null>(null);
  meta = signal({ current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 });
  
  // Modals
  showDeleteModal = signal(false);
  deleteTargetId = signal<number | null>(null);
  deleting = signal(false);

  showFormModal = signal(false);
  isEdit = signal(false);
  saving = signal(false);
  error = signal('');
  editCarId = signal<number | null>(null);
  loadingDetails = signal(false);

  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  form = this.fb.group({
    name: ['', Validators.required],
    brand: ['', Validators.required],
    model: ['', Validators.required],
    kilometers: [0, [Validators.required, Validators.min(0)]],
    price_per_day: [0, [Validators.required, Validators.min(1)]],
  });

  columns: TableColumn[] = [
    { key: 'id', label: 'common.id' },
    { key: 'name', label: 'cars.name' },
    { key: 'brand', label: 'cars.brand' },
    { key: 'model', label: 'cars.model' },
    { key: 'kilometers', label: 'cars.kilometers' },
    { key: 'price_per_day', label: 'cars.pricePerDay', type: 'currency' },
  ];

  ngOnInit() {
    this.titleService.setTitle('cars.title');
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.brandFilter.set(params['brand'] || '');
      this.minPriceFilter.set(params['min_price'] ? Number(params['min_price']) : null);
      this.maxPriceFilter.set(params['max_price'] ? Number(params['max_price']) : null);
      this.loadData(params);
    });
  }

  loadData(params: any = {}) {
    this.loading.set(true);
    this.api.adminCars(params).subscribe({
      next: (res: any) => {
        let items = [];
        let metaInfo = { current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 };
        
        const raw = res.data?.data || res.data || res;
        items = Array.isArray(raw) ? raw : [];
        
        const rawMeta = res.meta || (Array.isArray(res) ? {} : res);
        metaInfo = {
          current_page: Number(rawMeta?.current_page) || 1,
          last_page: Number(rawMeta?.last_page) || 1,
          per_page: Number(rawMeta?.per_page) || 10,
          total: Number(rawMeta?.total) || items.length,
          from: Number(rawMeta?.from) || 0,
          to: Number(rawMeta?.to) || 0
        };

        this.cars.set(items);
        this.meta.set(metaInfo);
        this.loading.set(false);
      },
      error: () => {
        this.meta.set({ current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 });
        this.loading.set(false);
      }
    });
  }

  onQuery(params: Record<string, any>) {
    // Handled by route subscription
  }

  onBrandFilter(brand: string) {
    this.brandFilter.set(brand);
    this.router.navigate([], { queryParams: { brand, page: 1 }, queryParamsHandling: 'merge' });
  }

  onMinPriceFilter(min_price: number | null) {
    this.minPriceFilter.set(min_price);
    this.router.navigate([], { queryParams: { min_price, page: 1 }, queryParamsHandling: 'merge' });
  }

  onMaxPriceFilter(max_price: number | null) {
    this.maxPriceFilter.set(max_price);
    this.router.navigate([], { queryParams: { max_price, page: 1 }, queryParamsHandling: 'merge' });
  }

  // Modals & Form
  openAddModal() {
    this.isEdit.set(false);
    this.editCarId.set(null);
    this.form.reset({ name: '', brand: '', model: '', kilometers: 0, price_per_day: 0 });
    this.error.set('');
    this.showFormModal.set(true);
  }

  openEditModal(car: Car) {
    this.isEdit.set(true);
    this.editCarId.set(car.id);
    this.error.set('');
    this.showFormModal.set(true);
    this.loadingDetails.set(true);

    this.api.adminCar(car.id).subscribe({
      next: (res: any) => {
        const carData = res.data || res;
        this.form.patchValue(carData as any);
        this.loadingDetails.set(false);
      },
      error: () => {
        this.loadingDetails.set(false);
        this.closeFormModal();
      }
    });
  }

  closeFormModal() {
    this.showFormModal.set(false);
  }

  submitForm() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.error.set('');

    const payload = this.form.getRawValue() as any;
    const req = this.isEdit()
      ? this.api.adminUpdateCar(this.editCarId()!, payload)
      : this.api.adminCreateCar(payload);

    req.subscribe({
      next: (res: any) => {
        this.saving.set(false);
        const savedCar = res?.data || res;
        
        if (savedCar && typeof savedCar === 'object' && savedCar.id) {
          if (this.isEdit()) {
            this.cars.update(cars => cars.map(c => c.id === savedCar.id ? { ...c, ...savedCar } : c));
            this.toast.success('cars.updateSuccess');
          } else {
            this.cars.update(cars => [savedCar, ...cars]);
            this.meta.update(m => ({ ...m, total: m.total + 1 }));
            this.toast.success('cars.addSuccess');
          }
          this.closeFormModal();
        } else {
          console.error('[AdminCars] Invalid response format:', res);
          this.toast.error('common.error');
          this.saving.set(false);
        }
      },
      error: (err: any) => {
        this.saving.set(false);
        this.toast.error(err.message || 'common.error');
      }
    });
  }

  askDelete(car: Car) {
    this.deleteTargetId.set(car.id);
    this.showDeleteModal.set(true);
  }

  confirmDelete() {
    const id = this.deleteTargetId();
    if (!id) return;
    this.deleting.set(true);
    this.api.adminDeleteCar(id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
        this.cars.update(cars => cars.filter(c => c.id !== id));
        this.meta.update(m => ({ ...m, total: Math.max(0, m.total - 1) }));
        this.toast.success('cars.deleteSuccess');
      },
      error: (err: any) => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
        // Error toast is already handled by interceptor, but we can add a specific one if needed
      }
    });
  }

  onView(car: Car) {
    this.selectedCar.set(car);
    this.loadingDetails.set(true);
    this.isEdit.set(false); // To reuse the loading logic correctly if needed

    this.api.adminCar(car.id).subscribe({
      next: (res: any) => {
        const carData = res.data || res;
        this.selectedCar.set(carData);
        this.loadingDetails.set(false);
      },
      error: () => {
        this.loadingDetails.set(false);
      }
    });
  }
}

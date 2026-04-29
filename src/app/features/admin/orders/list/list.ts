import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../core/services/api-service';
import { Order } from '../../../../core/models';
import { DataTable, TableColumn } from '../../../../shared/components/data-table/data-table';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

import { Modal } from '../../../../shared/components/modal/modal';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { PageTitleService } from '../../../../core/services/page-title-service';
import { ToastService } from '../../../../core/services/toast-service';

@Component({
  selector: 'app-admin-orders-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTable, Modal, Spinner, TranslatePipe],
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class List implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private titleService = inject(PageTitleService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  orders = signal<any[]>([]);
  loading = signal(true);
  statusFilter = signal('');
  typeFilter = signal('');
  userIdFilter = signal('');
  carIdFilter = signal('');
  orderTypeFilter = signal('');
  meta = signal({ current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 });

  // Modal
  selectedOrder = signal<Order | null>(null);
  updatingStatus = signal(false);
  loadingDetails = signal(false);
  newStatus = 'pending';

  columns: TableColumn[] = [
    { key: 'id', label: 'common.id' },
    { key: 'user_name', label: 'orders.customer' },
    { key: 'car_name', label: 'orders.car' },
    { key: 'days', label: 'orders.days' },
    { key: 'total_price', label: 'orders.totalPrice', type: 'currency' },
    { key: 'order_type', label: 'orders.orderType', type: 'badge', badgePrefix: 'orders' },
    { key: 'payment_type', label: 'orders.paymentType', type: 'badge', badgePrefix: 'orders' },
    { key: 'payment_status', label: 'orders.paymentStatus', type: 'badge', badgePrefix: 'orders' },
  ];

  ngOnInit() {
    this.titleService.setTitle('orders.title');
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      // Sync signals with query params
      if (params['payment_status']) this.statusFilter.set(params['payment_status']);
      if (params['payment_type']) this.typeFilter.set(params['payment_type']);
      if (params['user_id']) this.userIdFilter.set(params['user_id']);
      if (params['car_id']) this.carIdFilter.set(params['car_id']);
      if (params['order_type']) this.orderTypeFilter.set(params['order_type']);
      
      this.loadData(params);
    });
  }

  loadData(params: any = {}) {
    this.loading.set(true);
    this.api.adminOrders(params).subscribe({
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

        this.orders.set(items.map((o: any) => ({
          ...o,
          user_name: o.user?.name ?? '—',
          car_name: o.car ? `${o.car.brand} ${o.car.name || ''}` : '—',
        })));
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

  onStatusFilter(status: string) {
    this.statusFilter.set(status);
    this.router.navigate([], { queryParams: { payment_status: status, page: 1 }, queryParamsHandling: 'merge' });
  }

  onTypeFilter(type: string) {
    this.typeFilter.set(type);
    this.router.navigate([], { queryParams: { payment_type: type, page: 1 }, queryParamsHandling: 'merge' });
  }

  onOrderTypeFilter(order_type: string) {
    this.orderTypeFilter.set(order_type);
    this.router.navigate([], { queryParams: { order_type, page: 1 }, queryParamsHandling: 'merge' });
  }

  onUserIdFilter(user_id: string) {
    this.userIdFilter.set(user_id);
    this.router.navigate([], { queryParams: { user_id, page: 1 }, queryParamsHandling: 'merge' });
  }

  onCarIdFilter(car_id: string) {
    this.carIdFilter.set(car_id);
    this.router.navigate([], { queryParams: { car_id, page: 1 }, queryParamsHandling: 'merge' });
  }

  onView(order: any) {
    this.loadingDetails.set(true);
    this.selectedOrder.set(order);
    this.api.adminOrder(order.id).subscribe({
      next: (res: any) => {
        const fullOrder = res.data || res;
        this.selectedOrder.set(fullOrder);
        this.newStatus = fullOrder.payment_status;
        this.loadingDetails.set(false);
      },
      error: () => this.loadingDetails.set(false)
    });
  }

  onCloseModal() {
    this.selectedOrder.set(null);
    this.loadingDetails.set(false);
  }

  updateStatus() {
    const o = this.selectedOrder();
    if (!o) return;
    
    this.updatingStatus.set(true);
    this.api.adminUpdateOrder(o.id, { payment_status: this.newStatus as any }).subscribe({
      next: (res: any) => {
        this.updatingStatus.set(false);
        const updated = res.data || res;
        const updatedId = updated.id || o.id;
        
        this.orders.update(list => list.map(item => 
          Number(item.id) === Number(updatedId) 
            ? { ...item, ...updated, user_name: item.user_name, car_name: item.car_name } 
            : item
        ));
        
        this.toast.success('orders.updateSuccess');
        this.onCloseModal();
      },
      error: (err) => {
        this.updatingStatus.set(false);
        this.toast.error('common.error');
        console.error('Update failed', err);
      }
    });
  }
}

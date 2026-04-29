import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api-service';
import { Order } from '../../../../core/models';
import { DataTable, TableColumn } from '../../../../shared/components/data-table/data-table';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Modal } from '../../../../shared/components/modal/modal';
import { Spinner } from '../../../../shared/components/spinner/spinner';

@Component({
  selector: 'app-customer-orders-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTable, TranslatePipe, Modal, Spinner],
  providers: [DatePipe, DecimalPipe],
  templateUrl: './list.html',
  styleUrls: ['./list.scss']
})
export class List implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  orders = signal<any[]>([]);
  loading = signal(true);
  meta = signal({ current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 });

  // Modal State
  isModalOpen = signal(false);
  selectedOrder = signal<Order | null>(null);
  loadingDetail = signal(false);

  columns: TableColumn[] = [
    { key: 'id', label: 'common.id' },
    { key: 'car_name', label: 'orders.car' },
    { key: 'days', label: 'orders.days' },
    { key: 'total_price', label: 'orders.totalPrice', type: 'currency' },
    { key: 'payment_type', label: 'orders.paymentType', type: 'badge', badgePrefix: 'orders' },
    { key: 'payment_status', label: 'orders.paymentStatus', type: 'badge', badgePrefix: 'orders' },
    { key: 'created_at', label: 'common.createdAt', type: 'date' },
  ];

  ngOnInit() {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.loadData(params);
    });
  }

  loadData(params: any = {}) {
    this.loading.set(true);
    this.api.customerOrders(params).subscribe({
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
          car_name: o.car?.brand ? `${o.car.brand} ${o.car.name || ''}` : (o.car?.name ?? '—') 
        })));
        this.meta.set(metaInfo);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onView(row: any) {
    this.isModalOpen.set(true);
    this.loadingDetail.set(true);
    // Set a partial order with just the ID so the header doesn't show #null
    this.selectedOrder.set({ id: row.id } as any);

    this.api.customerOrder(row.id).subscribe({
      next: (res: any) => {
        // Handle both { data: Order } and Order response shapes
        const orderData = res.data || res;
        this.selectedOrder.set(orderData);
        this.loadingDetail.set(false);
      },
      error: () => {
        this.loadingDetail.set(false);
        this.isModalOpen.set(false);
        this.selectedOrder.set(null);
      }
    });
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedOrder.set(null);
  }

  onQuery(params: any) {
    // Handled via subscription
  }
}

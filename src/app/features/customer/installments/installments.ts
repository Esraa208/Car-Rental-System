import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api-service';
import { Installment } from '../../../core/models';
import { DataTable, TableColumn } from '../../../shared/components/data-table/data-table';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-customer-installments',
  standalone: true,
  imports: [CommonModule, DataTable, TranslatePipe],
  templateUrl: './installments.html',
  styleUrls: ['./installments.scss']
})
export class Installments implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  installments = signal<Installment[]>([]);
  loading = signal(true);
  meta = signal({ current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 });
  payingId = signal<number | null>(null);

  columns: TableColumn[] = [
    { key: 'id', label: 'common.id' },
    { key: 'order_id', label: 'installments.order' },
    { key: 'amount', label: 'installments.amount', type: 'currency' },
    { key: 'due_date', label: 'installments.dueDate', type: 'date' },
    { key: 'status', label: 'installments.status', type: 'badge', badgePrefix: 'orders' },
    { key: 'paid_at', label: 'installments.paidAt', type: 'date' },
  ];

  ngOnInit() {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.loadData(params);
    });
  }

  loadData(params: any = {}) {
    this.loading.set(true);
    this.api.customerInstallments(params).subscribe({
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

        this.installments.set(items);
        this.meta.set(metaInfo);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  pay(inst: Installment) {
    if (this.payingId()) return;
    
    this.payingId.set(inst.id);
    this.api.payInstallment(inst.id).subscribe({
      next: (res: any) => {
        this.payingId.set(null);
        // Reload data to reflect changes
        this.loadData();
      },
      error: () => {
        this.payingId.set(null);
      }
    });
  }

  onQuery(params: any) {
    // Handled by queryParams subscription
  }
}

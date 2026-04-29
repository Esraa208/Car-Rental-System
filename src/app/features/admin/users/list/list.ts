import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../core/services/api-service';
import { LangService } from '../../../../core/services/lang-service';
import { PageTitleService } from '../../../../core/services/page-title-service';
import { User } from '../../../../core/models';
import { DataTable, TableColumn } from '../../../../shared/components/data-table/data-table';
import { Modal } from '../../../../shared/components/modal/modal';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Spinner } from '../../../../shared/components/spinner/spinner';

@Component({
  selector: 'app-admin-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTable, Modal, TranslatePipe, Spinner],
  templateUrl: "./list.html",
  styleUrl: "./list.scss"
})
export class List implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private titleService = inject(PageTitleService);
  lang = inject(LangService);
  private destroyRef = inject(DestroyRef);

  users = signal<User[]>([]);
  selectedUser = signal<User | null>(null);
  loading = signal(true);
  loadingDetails = signal(false);
  roleFilter = signal('');
  countryFilter = signal('');
  meta = signal({ current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 });

  columns: TableColumn[] = [
    { key: 'id', label: 'common.id' },
    { key: 'name', label: 'users.name' },
    { key: 'email', label: 'users.email' },
    { key: 'role', label: 'users.role', type: 'badge', badgePrefix: 'users', badgeMap: { admin: 'danger', customer: 'primary' } },
    { key: 'country', label: 'users.country' },
    { key: 'created_at', label: 'users.createdAt', type: 'date' },
  ];

  ngOnInit() {
    this.titleService.setTitle('users.title');
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.roleFilter.set(params['role'] || '');
      this.countryFilter.set(params['country'] || '');
      this.loadData(params);
    });
  }

  loadData(params: any = {}) {
    this.loading.set(true);
    this.api.adminUsers(params).subscribe({
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

        this.users.set(items);
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

  onRoleFilter(role: string) {
    this.roleFilter.set(role);
    this.router.navigate([], { queryParams: { role, page: 1 }, queryParamsHandling: 'merge' });
  }

  onCountryFilter(country: string) {
    this.countryFilter.set(country);
    this.router.navigate([], { queryParams: { country, page: 1 }, queryParamsHandling: 'merge' });
  }

  onView(user: User) {
    this.selectedUser.set(user);
    this.loadingDetails.set(true);
    this.api.adminUser(user.id).subscribe({
      next: (res: any) => {
        this.selectedUser.set(res.data || res);
        this.loadingDetails.set(false);
      },
      error: () => {
        this.loadingDetails.set(false);
      }
    });
  }
}

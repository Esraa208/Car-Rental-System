import { Component, input, output, signal, computed, OnInit, inject, OnDestroy, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Spinner } from '../spinner/spinner';
import { EmptyState } from '../empty-state/empty-state';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'currency' | 'badge';
  badgeMap?: Record<string, string>;
  badgePrefix?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, Spinner, EmptyState, TranslatePipe],
  templateUrl: 'data-table.html',
  styleUrl: 'data-table.scss',
})
export class DataTable implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private search$ = new Subject<string>();

  @ContentChild('actions') actionsTemplate?: TemplateRef<any>;
  defaultActions?: TemplateRef<any>;

  columns = input<TableColumn[]>([]);
  rows = input<any[]>([]);
  loading = input(false);
  hasActions = input(true);
  showSearch = input(true);
  showToolbar = input(true);
  meta = input<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  }>({ current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 });

  queryChanged = output<Record<string, any>>();
  rowClicked = output<any>();

  searchValue = signal('');

  pageNumbers = computed(() => {
    const meta = this.meta();
    const pages: number[] = [];
    const current = Number(meta.current_page) || 1;
    const last = Number(meta.last_page) || 1;
    const start = Math.max(1, current - 2);
    const end = Math.min(last, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  trackByFn(row: any): any {
    return row.id ?? row;
  }

  ngOnInit() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['search']) this.searchValue.set(params['search']);
    });

    this.search$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(search => {
      this.emitQuery({ search, page: 1 });
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(value: string) {
    this.searchValue.set(value);
    this.search$.next(value);
  }

  onPageChange(page: number) {
    this.emitQuery({ page });
  }

  onPerPageChange(perPage: any) {
    this.emitQuery({ per_page: Number(perPage), page: 1 });
  }

  private emitQuery(partial: Record<string, any>) {
    const current = this.route.snapshot.queryParams;
    const merged = { ...current, ...partial };
    this.router.navigate([], { queryParams: merged, queryParamsHandling: 'merge' });
    this.queryChanged.emit(merged);
  }
}

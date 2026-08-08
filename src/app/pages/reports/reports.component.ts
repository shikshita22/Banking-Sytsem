import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { StoreService } from '../../core/services/store.service';
import { UtilsService } from '../../core/services/utils.service';
import { Account, Transaction, User } from '../../core/models/bank.models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-enter" *ngIf="user">
      <div class="page-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Bank-wide transaction summaries and customer growth metrics</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" (click)="exportPDF()">
            <span class="material-icons-round">print</span> Print Report
          </button>
        </div>
      </div>

      <div class="stats-grid stagger-in mb-xl">
        <div class="card hover-lift">
          <div class="stat-card">
            <div class="card-icon primary"><span class="material-icons-round">account_balance_wallet</span></div>
            <div class="stat-info">
              <div class="stat-label">Total Deposits Managed</div>
              <div class="stat-value">{{ formatCurrency(totalDeposits) }}</div>
            </div>
          </div>
        </div>
        <div class="card hover-lift">
          <div class="stat-card">
            <div class="card-icon success"><span class="material-icons-round">swap_horiz</span></div>
            <div class="stat-info">
              <div class="stat-label">Total Transaction Volume</div>
              <div class="stat-value">{{ formatCurrency(totalTxnVolume) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>System Transaction Summary</h3>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Type</th>
                <th>Total Count</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of summaryRows">
                <td class="font-semibold">{{ row.category.replace('_', ' ') }}</td>
                <td><span class="badge" [ngClass]="'badge-' + getStatusBadgeClass(row.type)">{{ row.type }}</span></td>
                <td>{{ row.count }}</td>
                <td class="font-semibold" [ngClass]="row.type === 'CREDIT' ? 'text-success' : 'text-error'">
                  {{ formatCurrency(row.total) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  user: User | null = null;
  totalDeposits = 0;
  totalTxnVolume = 0;
  summaryRows: { category: string; type: string; count: number; total: number }[] = [];

  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private utilsService: UtilsService
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      const accounts = this.storeService.getAll<Account>('accounts');
      this.totalDeposits = accounts.reduce((s, a) => s + a.balance, 0);

      const txns = this.storeService.getAll<Transaction>('transactions');
      this.totalTxnVolume = txns.reduce((s, t) => s + t.amount, 0);

      const categories: Record<string, { category: string; type: string; count: number; total: number }> = {};
      txns.forEach(t => {
        const key = `${t.category}_${t.transactionType}`;
        if (!categories[key]) {
          categories[key] = { category: t.category, type: t.transactionType, count: 0, total: 0 };
        }
        categories[key].count++;
        categories[key].total += t.amount;
      });

      this.summaryRows = Object.values(categories);
    }
  }

  formatCurrency(amount: number): string {
    return this.utilsService.formatCurrency(amount);
  }

  getStatusBadgeClass(status: string): string {
    return this.utilsService.getStatusBadgeClass(status);
  }

  exportPDF() {
    this.utilsService.exportToPDF('System Reports & Analytics');
  }
}

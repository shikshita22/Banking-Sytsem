import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { StoreService } from '../../core/services/store.service';
import { UtilsService } from '../../core/services/utils.service';
import { Account, Transaction, User } from '../../core/models/bank.models';

@Component({
  selector: 'app-statement',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-enter" *ngIf="user">
      <div class="page-header">
        <div>
          <h1>Account Statement</h1>
          <p>View and export your transaction history</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" (click)="exportPDF()">
            <span class="material-icons-round">picture_as_pdf</span> Export PDF
          </button>
        </div>
      </div>

      <!-- Filters Card -->
      <div class="card mb-lg">
        <div class="filter-bar">
          <div class="form-group" style="margin-bottom:0;min-width:200px">
            <select class="form-select" name="selectedAccount" [(ngModel)]="selectedAccountId" (change)="loadTransactions()">
              <option *ngFor="let a of accounts" [value]="a.accountId">{{ a.accountType }} - {{ a.accountId }}</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <input type="date" class="form-input" name="dateFrom" [(ngModel)]="dateFrom" (change)="loadTransactions()" style="width:160px">
          </div>
          <span class="text-muted">to</span>
          <div class="form-group" style="margin-bottom:0">
            <input type="date" class="form-input" name="dateTo" [(ngModel)]="dateTo" (change)="loadTransactions()" style="width:160px">
          </div>
          <div class="form-group" style="margin-bottom:0;min-width:140px">
            <select class="form-select" name="type" [(ngModel)]="typeFilter" (change)="loadTransactions()">
              <option value="">All Types</option>
              <option value="CREDIT">Credit</option>
              <option value="DEBIT">Debit</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0;min-width:160px">
            <select class="form-select" name="category" [(ngModel)]="categoryFilter" (change)="loadTransactions()">
              <option value="">All Categories</option>
              <option value="CASH_DEPOSIT">Cash Deposit</option>
              <option value="CHEQUE_DEPOSIT">Cheque Deposit</option>
              <option value="ONLINE_DEPOSIT">Online Deposit</option>
              <option value="CASH_WITHDRAWAL">Cash Withdrawal</option>
              <option value="ATM_WITHDRAWAL">ATM Withdrawal</option>
              <option value="ONLINE_WITHDRAWAL">Online Withdrawal</option>
              <option value="ONLINE_TRANSACTION">Online Transaction</option>
              <option value="OWN_TRANSFER">Own Transfer</option>
              <option value="SAME_BANK_TRANSFER">Same Bank Transfer</option>
              <option value="EMI">EMI</option>
              <option value="CARD_PAYMENT">Card Payment</option>
            </select>
          </div>
          <button class="btn btn-primary" (click)="loadTransactions()">
            <span class="material-icons-round">filter_list</span> Filter
          </button>
        </div>
      </div>

      <!-- Statement Table Card -->
      <div class="card">
        <div class="card-header">
          <h3>Transactions ({{ filteredTxns.length }})</h3>
          <div class="flex gap-lg">
            <div class="text-sm"><span class="text-muted">Total Credit:</span> <span class="text-success font-semibold">{{ formatCurrency(totalCredit) }}</span></div>
            <div class="text-sm"><span class="text-muted">Total Debit:</span> <span class="text-error font-semibold">{{ formatCurrency(totalDebit) }}</span></div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Txn ID</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filteredTxns.length === 0">
                <td colspan="7" class="text-center p-xl">
                  <div class="empty-state">
                    <span class="material-icons-round">receipt_long</span>
                    <h3>No transactions found</h3>
                    <p class="text-muted text-sm">Try adjusting your filters</p>
                  </div>
                </td>
              </tr>
              <tr *ngFor="let t of filteredTxns">
                <td>{{ formatDate(t.date) }}</td>
                <td class="font-mono text-sm">{{ t.transactionId }}</td>
                <td>{{ t.description }}</td>
                <td><span class="text-xs">{{ t.category.replace('_', ' ') }}</span></td>
                <td><span class="badge" [ngClass]="'badge-' + getStatusBadgeClass(t.transactionType)">{{ t.transactionType }}</span></td>
                <td>
                  <span [ngClass]="t.transactionType === 'CREDIT' ? 'text-success' : 'text-error'" class="font-semibold">
                    {{ t.transactionType === 'CREDIT' ? '+' : '-' }}{{ formatCurrency(t.amount) }}
                  </span>
                </td>
                <td class="font-semibold">{{ formatCurrency(t.balance) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AccountStatementComponent implements OnInit {
  user: User | null = null;
  accounts: Account[] = [];
  selectedAccountId: string = '';

  dateFrom: string = '';
  dateTo: string = '';
  typeFilter: string = '';
  categoryFilter: string = '';

  filteredTxns: Transaction[] = [];
  totalCredit = 0;
  totalDebit = 0;

  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private utilsService: UtilsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.accounts = this.storeService.getAccountsByUser(this.user.userId).filter(a => a.status !== 'CLOSED');
      
      const d = new Date();
      d.setMonth(d.getMonth() - 3);
      this.dateFrom = d.toISOString().split('T')[0];
      this.dateTo = this.utilsService.todayISO();

      this.route.queryParams.subscribe(params => {
        const accParam = params['account'];
        if (accParam && this.accounts.some(a => a.accountId === accParam)) {
          this.selectedAccountId = accParam;
        } else if (this.accounts.length > 0) {
          this.selectedAccountId = this.accounts[0].accountId;
        }
        this.loadTransactions();
      });
    }
  }

  loadTransactions() {
    if (!this.selectedAccountId) return;
    let list = this.storeService.getTransactionsByAccount(this.selectedAccountId);

    if (this.dateFrom) list = list.filter(t => t.date >= this.dateFrom);
    if (this.dateTo) list = list.filter(t => t.date <= this.dateTo);
    if (this.typeFilter) list = list.filter(t => t.transactionType === this.typeFilter);
    if (this.categoryFilter) list = list.filter(t => t.category === this.categoryFilter);

    this.filteredTxns = list;
    this.totalCredit = list.filter(t => t.transactionType === 'CREDIT').reduce((s, t) => s + t.amount, 0);
    this.totalDebit = list.filter(t => t.transactionType === 'DEBIT').reduce((s, t) => s + t.amount, 0);
  }

  formatCurrency(amount: number): string {
    return this.utilsService.formatCurrency(amount);
  }

  formatDate(dateStr: string): string {
    return this.utilsService.formatDate(dateStr);
  }

  getStatusBadgeClass(status: string): string {
    return this.utilsService.getStatusBadgeClass(status);
  }

  exportPDF() {
    this.utilsService.exportToPDF('Account Statement');
  }
}

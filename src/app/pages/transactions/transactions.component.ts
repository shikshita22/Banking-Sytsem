import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { StoreService } from '../../core/services/store.service';
import { UtilsService } from '../../core/services/utils.service';
import { ToastService } from '../../core/services/toast.service';
import { Account, Transaction, User } from '../../core/models/bank.models';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-enter" *ngIf="user">
      <div class="page-header">
        <div>
          <h1>Deposit & Withdrawal</h1>
          <p>Post cash, cheque, online and ATM transactions with instant balance updates</p>
        </div>
      </div>

      <div class="dashboard-grid">
        <div>
          <div class="card mb-md">
            <div class="card-header"><h3>Transaction Type</h3></div>
            <div class="tabs">
              <button class="tab" [ngClass]="{ 'active': activeMode === 'deposit' }" (click)="setMode('deposit')">Deposit</button>
              <button class="tab" [ngClass]="{ 'active': activeMode === 'withdrawal' }" (click)="setMode('withdrawal')">Withdrawal</button>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3>{{ activeMode === 'deposit' ? 'Make a Deposit' : 'Make a Withdrawal' }}</h3>
            </div>

            <form (ngSubmit)="onSubmit()" autocomplete="off">
              <div class="form-group">
                <label class="form-label">Account <span class="text-danger">*</span></label>
                <select class="form-select" name="selectedAccount" [(ngModel)]="selectedAccountId" (change)="onAccountChange()" required>
                  <option *ngFor="let a of accounts" [value]="a.accountId">
                    {{ a.accountType === 'SAVINGS' ? 'Savings Account' : 'Current Account' }} - {{ a.accountId }} ({{ formatCurrency(a.availableBalance) }})
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Transaction Method <span class="text-danger">*</span></label>
                <select class="form-select" name="method" [(ngModel)]="selectedMethod" required>
                  <option value="">Select Transaction Method</option>
                  <option *ngFor="let m of getMethodOptions()" [value]="m.value">{{ m.label }}</option>
                </select>
              </div>

              <!-- Meta fields based on method -->
              <div *ngIf="selectedMethod === 'CHEQUE_DEPOSIT'" class="form-group">
                <label class="form-label">Cheque Number</label>
                <input type="text" class="form-control" name="chequeNumber" [(ngModel)]="chequeNumber" placeholder="Enter cheque number">
              </div>

              <div *ngIf="selectedMethod === 'ONLINE_DEPOSIT' || selectedMethod === 'ONLINE_WITHDRAWAL'" class="form-group">
                <label class="form-label">Online Reference Number</label>
                <input type="text" class="form-control" name="referenceNumber" [(ngModel)]="referenceNumber" placeholder="Enter UPI / reference number">
              </div>

              <div *ngIf="selectedMethod === 'ATM_WITHDRAWAL'" class="form-group">
                <label class="form-label">ATM Location</label>
                <input type="text" class="form-control" name="atmLocation" [(ngModel)]="atmLocation" placeholder="Enter ATM location">
              </div>

              <div class="form-group">
                <label class="form-label">Amount (₹) <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-icon"><span class="material-icons-round">currency_rupee</span></span>
                  <input type="number" class="form-control" name="amount" [(ngModel)]="amount" placeholder="Enter amount" min="1" step="0.01" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Remarks</label>
                <input type="text" class="form-control" name="remarks" [(ngModel)]="remarks" placeholder="Optional remarks">
              </div>

              <button type="submit" class="btn btn-primary btn-lg btn-block mt-lg" [disabled]="isSubmitting">
                <span class="material-icons-round" [ngClass]="{ 'spin': isSubmitting }">{{ isSubmitting ? 'sync' : (activeMode === 'deposit' ? 'add_card' : 'payments') }}</span>
                {{ isSubmitting ? 'Processing...' : (activeMode === 'deposit' ? 'Submit Deposit' : 'Submit Withdrawal') }}
              </button>
            </form>
          </div>
        </div>

        <div>
          <!-- Account Snapshot -->
          <div class="card mb-md">
            <div class="card-header"><h3>Account Snapshot</h3></div>
            <div *ngIf="currentAccount" class="grid grid-2 gap-md">
              <div class="card card-flat p-md">
                <div class="text-xs text-muted mb-xs">Account</div>
                <div class="font-semibold">{{ currentAccount.accountType }} - {{ currentAccount.accountId }}</div>
              </div>
              <div class="card card-flat p-md">
                <div class="text-xs text-muted mb-xs">Available Balance</div>
                <div class="font-semibold text-success">{{ formatCurrency(currentAccount.availableBalance) }}</div>
              </div>
              <div class="card card-flat p-md">
                <div class="text-xs text-muted mb-xs">Total Credits</div>
                <div class="font-semibold text-success">{{ formatCurrency(totalCredits) }}</div>
              </div>
              <div class="card card-flat p-md">
                <div class="text-xs text-muted mb-xs">Total Debits</div>
                <div class="font-semibold text-error">{{ formatCurrency(totalDebits) }}</div>
              </div>
            </div>
          </div>

          <!-- History -->
          <div class="card">
            <div class="card-header">
              <h3>Recent Debit/Credit History</h3>
              <a routerLink="/statement" class="btn btn-ghost btn-sm">Full Statement</a>
            </div>
            <div *ngIf="recentTxns.length === 0" class="empty-state">
              <span class="material-icons-round">receipt_long</span>
              <h3>No transactions yet</h3>
            </div>
            <div *ngFor="let t of recentTxns" class="list-item">
              <div class="card-icon" [ngClass]="getTxnIconInfo(t.category).class">
                <span class="material-icons-round">{{ getTxnIconInfo(t.category).icon }}</span>
              </div>
              <div class="list-item-content">
                <div class="list-item-title">{{ t.description }}</div>
                <div class="list-item-subtitle">{{ t.category.replace('_', ' ') }} · {{ formatDate(t.date) }}</div>
              </div>
              <div class="list-item-right">
                <div class="list-item-amount" [ngClass]="t.transactionType === 'CREDIT' ? 'credit' : 'debit'">
                  {{ t.transactionType === 'CREDIT' ? '+' : '-' }}{{ formatCurrency(t.amount) }}
                </div>
                <div class="list-item-date">{{ formatCurrency(t.balance) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TransactionsComponent implements OnInit {
  user: User | null = null;
  accounts: Account[] = [];
  selectedAccountId: string = '';
  currentAccount: Account | null = null;
  activeMode: 'deposit' | 'withdrawal' = 'deposit';

  selectedMethod: string = '';
  chequeNumber: string = '';
  referenceNumber: string = '';
  atmLocation: string = '';
  amount: number | null = null;
  remarks: string = '';
  isSubmitting = false;

  recentTxns: Transaction[] = [];
  totalCredits = 0;
  totalDebits = 0;

  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private utilsService: UtilsService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.accounts = this.storeService.getAccountsByUser(this.user.userId).filter(a => a.status === 'ACTIVE');
      if (this.accounts.length > 0) {
        this.selectedAccountId = this.accounts[0].accountId;
        this.onAccountChange();
      }
    }
  }

  setMode(mode: 'deposit' | 'withdrawal') {
    this.activeMode = mode;
    this.selectedMethod = '';
  }

  getMethodOptions() {
    return this.activeMode === 'deposit' ? [
      { value: 'CASH_DEPOSIT', label: 'Cash Deposit' },
      { value: 'CHEQUE_DEPOSIT', label: 'Cheque Deposit' },
      { value: 'ONLINE_DEPOSIT', label: 'Online Deposit' }
    ] : [
      { value: 'CASH_WITHDRAWAL', label: 'Cash Withdrawal' },
      { value: 'ONLINE_WITHDRAWAL', label: 'Online Withdrawal' },
      { value: 'ATM_WITHDRAWAL', label: 'ATM Transaction' }
    ];
  }

  onAccountChange() {
    this.currentAccount = this.accounts.find(a => a.accountId === this.selectedAccountId) || null;
    if (this.currentAccount) {
      const txns = this.storeService.getTransactionsByAccount(this.currentAccount.accountId);
      this.recentTxns = txns.slice(0, 10);
      this.totalCredits = txns.filter(t => t.transactionType === 'CREDIT').reduce((s, t) => s + t.amount, 0);
      this.totalDebits = txns.filter(t => t.transactionType === 'DEBIT').reduce((s, t) => s + t.amount, 0);
    }
  }

  async onSubmit() {
    if (!this.currentAccount || !this.amount || this.amount <= 0 || !this.selectedMethod) {
      this.toastService.error('Error', 'Please fill all required fields properly');
      return;
    }

    if (this.activeMode === 'withdrawal' && this.amount > this.currentAccount.availableBalance) {
      this.toastService.error('Insufficient Balance', `Available: ${this.formatCurrency(this.currentAccount.availableBalance)}`);
      return;
    }

    this.isSubmitting = true;
    await new Promise(r => setTimeout(r, 800));

    const nextBalance = this.activeMode === 'deposit'
      ? this.currentAccount.balance + this.amount
      : this.currentAccount.balance - this.amount;
    const nextAvailable = this.activeMode === 'deposit'
      ? this.currentAccount.availableBalance + this.amount
      : this.currentAccount.availableBalance - this.amount;

    this.storeService.updateAccount(this.currentAccount.accountId, {
      balance: nextBalance,
      availableBalance: nextAvailable
    });

    const txnId = this.utilsService.generateTransactionId(this.storeService);
    const desc = `${this.selectedMethod.replace('_', ' ')} ${this.remarks ? '- ' + this.remarks : ''}`;

    this.storeService.addTransaction({
      transactionId: txnId,
      accountId: this.currentAccount.accountId,
      transactionType: this.activeMode === 'deposit' ? 'CREDIT' : 'DEBIT',
      category: this.selectedMethod,
      amount: this.amount,
      balance: nextBalance,
      description: desc,
      referenceId: this.referenceNumber || 'REF' + Date.now(),
      date: this.utilsService.todayISO(),
      time: new Date().toTimeString().slice(0, 8),
      status: 'COMPLETED',
      toAccount: '',
      fromAccount: ''
    });

    this.toastService.success(
      this.activeMode === 'deposit' ? 'Deposit Successful' : 'Withdrawal Successful',
      `${this.formatCurrency(this.amount)} processed for ${this.currentAccount.accountId}`
    );

    this.isSubmitting = false;
    this.amount = null;
    this.remarks = '';
    this.chequeNumber = '';
    this.referenceNumber = '';
    this.atmLocation = '';
    this.onAccountChange();
  }

  formatCurrency(amount: number): string {
    return this.utilsService.formatCurrency(amount);
  }

  formatDate(dateStr: string): string {
    return this.utilsService.formatDate(dateStr);
  }

  getTxnIconInfo(category: string) {
    return this.utilsService.getTransactionIconInfo(category);
  }
}

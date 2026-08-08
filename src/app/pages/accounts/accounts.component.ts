import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { StoreService } from '../../core/services/store.service';
import { UtilsService } from '../../core/services/utils.service';
import { ToastService } from '../../core/services/toast.service';
import { ModalService } from '../../core/services/modal.service';
import { Account, Transaction, User } from '../../core/models/bank.models';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-enter" *ngIf="user">
      <div class="page-header">
        <div>
          <h1>Account Details</h1>
          <p>View and manage your bank accounts</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary" (click)="exportPDF()">
            <span class="material-icons-round">download</span> Download
          </button>
        </div>
      </div>

      <div *ngIf="accounts.length === 0" class="card">
        <div class="empty-state">
          <span class="material-icons-round">account_balance_wallet</span>
          <h3>No Accounts Found</h3>
          <p>You don't have any active accounts yet.</p>
        </div>
      </div>

      <ng-container *ngIf="selectedAccount">
        <!-- Account Tabs -->
        <div *ngIf="accounts.length > 1" class="tabs mb-xl">
          <button *ngFor="let a of accounts" class="tab" [ngClass]="{ 'active': a.accountId === selectedAccount.accountId }" (click)="selectAccount(a)">
            {{ a.accountType }} - {{ a.accountId }}
          </button>
        </div>

        <!-- Balance Header Card -->
        <div class="account-header-card">
          <div class="flex justify-between items-start" style="position:relative;z-index:1">
            <div>
              <div class="balance-label">{{ selectedAccount.accountType }} Account · {{ selectedAccount.accountId }}</div>
              <div class="balance-amount">{{ formatCurrency(selectedAccount.balance) }}</div>
              <div class="mt-sm" style="opacity:0.8;font-size:var(--font-sm)">
                Available: {{ formatCurrency(selectedAccount.availableBalance) }}
              </div>
            </div>
            <div>
              <span class="badge" [ngClass]="'badge-' + getStatusBadgeClass(selectedAccount.status)">{{ selectedAccount.status }}</span>
            </div>
          </div>
        </div>

        <!-- Account Info Grid -->
        <div class="account-info-grid">
          <div class="card">
            <div class="card-header"><h4>Account Information</h4></div>
            <div class="info-row"><span class="info-label">Account Number</span><span class="info-value font-semibold">{{ selectedAccount.accountId }}</span></div>
            <div class="info-row"><span class="info-label">IFSC Code</span><span class="info-value">{{ selectedAccount.ifsc }}</span></div>
            <div class="info-row"><span class="info-label">Branch</span><span class="info-value">{{ selectedAccount.branch }}</span></div>
            <div class="info-row"><span class="info-label">Account Type</span><span class="info-value">{{ selectedAccount.accountType }}</span></div>
          </div>
          <div class="card">
            <div class="card-header"><h4>Balance Details</h4></div>
            <div class="info-row"><span class="info-label">Current Balance</span><span class="info-value font-semibold">{{ formatCurrency(selectedAccount.balance) }}</span></div>
            <div class="info-row"><span class="info-label">Available Balance</span><span class="info-value">{{ formatCurrency(selectedAccount.availableBalance) }}</span></div>
            <div class="info-row"><span class="info-label">Min Balance</span><span class="info-value">{{ formatCurrency(selectedAccount.minBalance) }}</span></div>
            <div class="info-row"><span class="info-label">Status</span><span class="info-value"><span class="badge" [ngClass]="'badge-' + getStatusBadgeClass(selectedAccount.status)">{{ selectedAccount.status }}</span></span></div>
          </div>
          <div class="card">
            <div class="card-header"><h4>Other Details</h4></div>
            <div class="info-row"><span class="info-label">Opening Date</span><span class="info-value">{{ formatDate(selectedAccount.openingDate) }}</span></div>
            <div class="info-row"><span class="info-label">Nominee</span><span class="info-value">{{ selectedAccount.nominee || 'Not set' }}</span></div>
            <div class="info-row"><span class="info-label">Linked Cards</span><span class="info-value">{{ linkedCardCount }}</span></div>
            <div class="info-row"><span class="info-label">Account Holder</span><span class="info-value">{{ user.firstName }} {{ user.lastName }}</span></div>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="card">
          <div class="card-header">
            <h3>Recent Transactions</h3>
            <a [routerLink]="['/statement']" [queryParams]="{ account: selectedAccount.accountId }" class="btn btn-ghost btn-sm">View Full Statement</a>
          </div>
          <div *ngIf="recentTxns.length === 0" class="empty-state">
            <span class="material-icons-round">receipt_long</span>
            <h3>No transactions</h3>
          </div>
          <div *ngFor="let t of recentTxns" class="list-item">
            <div class="card-icon" [ngClass]="getTxnIconInfo(t.category).class">
              <span class="material-icons-round">{{ getTxnIconInfo(t.category).icon }}</span>
            </div>
            <div class="list-item-content">
              <div class="list-item-title">{{ t.description }}</div>
              <div class="list-item-subtitle">{{ t.transactionId }} · {{ formatDate(t.date) }}</div>
            </div>
            <div class="list-item-right">
              <div class="list-item-amount" [ngClass]="t.transactionType === 'CREDIT' ? 'credit' : 'debit'">
                {{ t.transactionType === 'CREDIT' ? '+' : '-' }}{{ formatCurrency(t.amount) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Account Actions -->
        <div class="card mt-md">
          <div class="card-header"><h3>Account Actions</h3></div>
          <div class="flex gap-md flex-wrap">
            <button class="btn btn-secondary" routerLink="/transfer">
              <span class="material-icons-round">swap_horiz</span> Transfer Funds
            </button>
            <button class="btn btn-secondary" [routerLink]="['/statement']" [queryParams]="{ account: selectedAccount.accountId }">
              <span class="material-icons-round">receipt_long</span> View Statement
            </button>
            <button *ngIf="selectedAccount.status === 'ACTIVE'" class="btn btn-danger" (click)="closeAccount(selectedAccount.accountId)">
              <span class="material-icons-round">cancel</span> Close Account
            </button>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class AccountDetailsComponent implements OnInit {
  user: User | null = null;
  accounts: Account[] = [];
  selectedAccount: Account | null = null;
  recentTxns: Transaction[] = [];
  linkedCardCount = 0;

  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private utilsService: UtilsService,
    private toastService: ToastService,
    private modalService: ModalService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.accounts = this.storeService.getAccountsByUser(this.user.userId);
      this.route.queryParams.subscribe(params => {
        const id = params['id'];
        if (id) {
          const found = this.accounts.find(a => a.accountId === id);
          this.selectAccount(found || this.accounts[0]);
        } else if (this.accounts.length > 0) {
          this.selectAccount(this.accounts[0]);
        }
      });
    }
  }

  selectAccount(acc: Account) {
    this.selectedAccount = acc;
    if (acc) {
      this.recentTxns = this.storeService.getTransactionsByAccount(acc.accountId).slice(0, 5);
      this.linkedCardCount = this.storeService.getCardsByAccount(acc.accountId).length;
    }
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

  getTxnIconInfo(category: string) {
    return this.utilsService.getTransactionIconInfo(category);
  }

  exportPDF() {
    this.utilsService.exportToPDF(`Account Details - ${this.selectedAccount?.accountId}`);
  }

  closeAccount(accountId: string) {
    if (!this.selectedAccount) return;
    if (this.selectedAccount.balance > 0) {
      this.toastService.warning('Cannot Close', 'Please withdraw or transfer all funds before closing the account.');
      return;
    }
    this.modalService.confirm(
      'Close Account',
      `Are you sure you want to close account ${accountId}?`,
      () => {
        this.storeService.updateAccount(accountId, { status: 'CLOSED' });
        this.toastService.success('Account Closed', `Account ${accountId} has been closed.`);
        if (this.user) {
          this.accounts = this.storeService.getAccountsByUser(this.user.userId);
          if (this.accounts.length > 0) this.selectAccount(this.accounts[0]);
        }
      },
      'danger'
    );
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { StoreService } from '../../core/services/store.service';
import { UtilsService } from '../../core/services/utils.service';
import { User, Account, Transaction, Loan, Card, Notification } from '../../core/models/bank.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-enter" *ngIf="user">
      <div class="page-header">
        <div>
          <h1>Welcome, {{ user.firstName }}! 👋</h1>
          <p>Here's your financial overview for today</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" routerLink="/transfer">
            <span class="material-icons-round">send</span> Transfer Money
          </button>
          <button class="btn btn-secondary" routerLink="/transactions">
            <span class="material-icons-round">payments</span> Deposit / Withdraw
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid stagger-in">
        <div class="card hover-lift">
          <div class="stat-card">
            <div class="card-icon primary"><span class="material-icons-round">account_balance_wallet</span></div>
            <div class="stat-info">
              <div class="stat-label">Total Balance</div>
              <div class="stat-value">{{ formatCurrency(totalBalance) }}</div>
              <div class="stat-change up">
                <span class="material-icons-round">trending_up</span> +{{ accounts.length }} account{{ accounts.length !== 1 ? 's' : '' }}
              </div>
            </div>
          </div>
        </div>
        <div class="card hover-lift">
          <div class="stat-card">
            <div class="card-icon success"><span class="material-icons-round">savings</span></div>
            <div class="stat-info">
              <div class="stat-label">Monthly Income</div>
              <div class="stat-value">{{ formatCurrency(monthlyIncome) }}</div>
              <div class="stat-change up">
                <span class="material-icons-round">trending_up</span> Credits this month
              </div>
            </div>
          </div>
        </div>
        <div class="card hover-lift">
          <div class="stat-card">
            <div class="card-icon warning"><span class="material-icons-round">event_repeat</span></div>
            <div class="stat-info">
              <div class="stat-label">EMI Due</div>
              <div class="stat-value">{{ formatCurrency(totalEMI) }}</div>
              <div class="stat-change" [ngClass]="totalEMI > 0 ? 'down' : 'up'">
                <span class="material-icons-round" *ngIf="totalEMI > 0">warning</span>
                {{ totalEMI > 0 ? activeLoans.length + ' active loan' + (activeLoans.length !== 1 ? 's' : '') : 'No active loans' }}
              </div>
            </div>
          </div>
        </div>
        <div class="card hover-lift">
          <div class="stat-card">
            <div class="card-icon error"><span class="material-icons-round">credit_card</span></div>
            <div class="stat-info">
              <div class="stat-label">Credit Card Due</div>
              <div class="stat-value">{{ formatCurrency(totalCreditDue) }}</div>
              <div class="stat-change" [ngClass]="totalCreditDue > 0 ? 'down' : 'up'">
                <span class="material-icons-round" *ngIf="totalCreditDue > 0">schedule</span>
                {{ totalCreditDue > 0 ? 'Payment pending' : 'All clear!' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card mb-xl">
        <div class="card-header"><h3>Quick Actions</h3></div>
        <div class="quick-actions-grid">
          <div class="card card-flat hover-lift quick-action" routerLink="/transfer" style="cursor:pointer">
            <div class="card-icon primary"><span class="material-icons-round">swap_horiz</span></div>
            <span>Transfer</span>
          </div>
          <div class="card card-flat hover-lift quick-action" routerLink="/transactions" style="cursor:pointer">
            <div class="card-icon success"><span class="material-icons-round">payments</span></div>
            <span>Deposit / Withdraw</span>
          </div>
          <div class="card card-flat hover-lift quick-action" routerLink="/loan-apply" style="cursor:pointer">
            <div class="card-icon success"><span class="material-icons-round">request_quote</span></div>
            <span>Apply Loan</span>
          </div>
          <div class="card card-flat hover-lift quick-action" routerLink="/statement" style="cursor:pointer">
            <div class="card-icon accent"><span class="material-icons-round">receipt_long</span></div>
            <span>Statement</span>
          </div>
          <div class="card card-flat hover-lift quick-action" routerLink="/debit-card" style="cursor:pointer">
            <div class="card-icon secondary"><span class="material-icons-round">credit_card</span></div>
            <span>Manage Cards</span>
          </div>
        </div>
      </div>

      <!-- Main Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Recent Transactions -->
        <div class="card">
          <div class="card-header">
            <h3>Recent Transactions</h3>
            <a routerLink="/statement" class="btn btn-ghost btn-sm">View All</a>
          </div>
          <div class="card-body">
            <div *ngIf="transactions.length === 0" class="empty-state">
              <span class="material-icons-round">receipt_long</span>
              <h3>No transactions yet</h3>
            </div>
            <div *ngFor="let t of transactions" class="list-item">
              <div class="card-icon" [ngClass]="getTxnIconClass(t.category)">
                <span class="material-icons-round">{{ getTxnIcon(t.category) }}</span>
              </div>
              <div class="list-item-content">
                <div class="list-item-title">{{ t.description }}</div>
                <div class="list-item-subtitle">{{ t.category.replace('_', ' ') }} · {{ t.accountId }}</div>
              </div>
              <div class="list-item-right">
                <div class="list-item-amount" [ngClass]="t.transactionType === 'CREDIT' ? 'credit' : 'debit'">
                  {{ t.transactionType === 'CREDIT' ? '+' : '-' }}{{ formatCurrency(t.amount) }}
                </div>
                <div class="list-item-date">{{ formatDate(t.date) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Accounts & Alerts Column -->
        <div>
          <!-- My Accounts -->
          <div class="card mb-md">
            <div class="card-header">
              <h3>My Accounts</h3>
            </div>
            <div *ngFor="let a of accounts" class="list-item" style="cursor:pointer" routerLink="/accounts">
              <div class="card-icon" [ngClass]="a.accountType === 'SAVINGS' ? 'primary' : 'secondary'">
                <span class="material-icons-round">{{ a.accountType === 'SAVINGS' ? 'savings' : 'business' }}</span>
              </div>
              <div class="list-item-content">
                <div class="list-item-title">{{ a.accountType }} Account</div>
                <div class="list-item-subtitle">{{ a.accountId }}</div>
              </div>
              <div class="list-item-right">
                <div class="list-item-amount">{{ formatCurrency(a.balance) }}</div>
              </div>
            </div>
          </div>

          <!-- Alerts -->
          <div *ngIf="notifications.length > 0" class="card">
            <div class="card-header">
              <h3>Alerts</h3>
              <span class="badge badge-error">{{ notifications.length }}</span>
            </div>
            <div *ngFor="let n of notifications.slice(0, 4)" class="list-item">
              <div class="card-icon" [ngClass]="n.type || 'info'" style="width:32px;height:32px;border-radius:50%">
                <span class="material-icons-round" style="font-size:16px">
                  {{ n.type === 'success' ? 'check' : n.type === 'error' ? 'priority_high' : n.type === 'warning' ? 'warning' : 'info' }}
                </span>
              </div>
              <div class="list-item-content">
                <div class="list-item-title text-sm">{{ n.title }}</div>
                <div class="list-item-subtitle">{{ getRelativeTime(n.timestamp) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Loans Overview -->
      <div class="dashboard-grid equal mt-md">
        <div class="card">
          <div class="card-header">
            <h3>Active Loans</h3>
            <a routerLink="/loan-status" class="btn btn-ghost btn-sm">View All</a>
          </div>
          <div *ngIf="loans.length === 0" class="empty-state">
            <span class="material-icons-round">money_off</span>
            <h3>No loans</h3>
            <p class="text-sm">You haven't applied for any loans yet</p>
          </div>
          <div *ngFor="let l of loans.slice(0, 4)" class="list-item">
            <div class="card-icon" [ngClass]="l.status === 'DISBURSED' ? 'success' : l.status === 'APPROVED' ? 'primary' : l.status === 'WAITING' ? 'warning' : 'error'">
              <span class="material-icons-round">real_estate_agent</span>
            </div>
            <div class="list-item-content">
              <div class="list-item-title">{{ l.loanType }} Loan</div>
              <div class="list-item-subtitle">{{ l.loanId }} · <span class="badge" [ngClass]="'badge-' + getStatusBadgeClass(l.status)">{{ l.status }}</span></div>
            </div>
            <div class="list-item-right">
              <div class="list-item-amount">{{ formatCurrency(l.amount) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  accounts: Account[] = [];
  transactions: Transaction[] = [];
  loans: Loan[] = [];
  cards: Card[] = [];
  notifications: Notification[] = [];

  totalBalance = 0;
  monthlyIncome = 0;
  totalEMI = 0;
  totalCreditDue = 0;
  activeLoans: Loan[] = [];

  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private utilsService: UtilsService
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      const userId = this.user.userId;
      this.accounts = this.storeService.getAccountsByUser(userId).filter(a => a.status === 'ACTIVE');
      this.totalBalance = this.accounts.reduce((s, a) => s + a.balance, 0);

      this.transactions = this.storeService.getTransactionsByUser(userId).slice(0, 8);
      this.loans = this.storeService.getLoansByUser(userId);
      this.cards = this.storeService.getCardsByUser(userId);
      this.notifications = this.storeService.getNotificationsByUser(userId).filter(n => !n.read);

      this.activeLoans = this.loans.filter(l => l.status === 'DISBURSED');
      const creditCards = this.cards.filter(c => c.cardType === 'CREDIT' && !c.isBlocked);

      this.totalEMI = this.activeLoans.reduce((s, l) => s + l.emiAmount, 0);
      this.totalCreditDue = creditCards.reduce((s, c) => s + c.outstandingBalance, 0);

      const now = new Date();
      this.monthlyIncome = this.transactions
        .filter(t => {
          const td = new Date(t.date);
          return td.getMonth() === now.getMonth() && td.getFullYear() === now.getFullYear() && t.transactionType === 'CREDIT';
        })
        .reduce((s, t) => s + t.amount, 0);
    }
  }

  formatCurrency(amount: number): string {
    return this.utilsService.formatCurrency(amount);
  }

  formatDate(dateStr: string): string {
    return this.utilsService.formatDate(dateStr);
  }

  getRelativeTime(timestamp: string): string {
    return this.utilsService.getRelativeTime(timestamp);
  }

  getStatusBadgeClass(status: string): string {
    return this.utilsService.getStatusBadgeClass(status);
  }

  getTxnIconInfo(category: string) {
    return this.utilsService.getTransactionIconInfo(category);
  }

  getTxnIcon(category: string): string {
    return this.utilsService.getTransactionIconInfo(category).icon;
  }

  getTxnIconClass(category: string): string {
    return this.utilsService.getTransactionIconInfo(category).class;
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { StoreService } from '../../core/services/store.service';
import { UtilsService } from '../../core/services/utils.service';
import { Account, AuditLog, Loan, User } from '../../core/models/bank.models';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-enter" *ngIf="user">
      <div class="page-header">
        <div>
          <h1>Staff Dashboard</h1>
          <p>Bank administration overview and pending approvals</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" routerLink="/account-approval">
            <span class="material-icons-round">approval</span> Pending Approvals ({{ pendingAccounts.length + pendingLoans.length }})
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid stagger-in mb-xl">
        <div class="card hover-lift">
          <div class="stat-card">
            <div class="card-icon primary"><span class="material-icons-round">people</span></div>
            <div class="stat-info">
              <div class="stat-label">Total Customers</div>
              <div class="stat-value">{{ totalCustomers }}</div>
            </div>
          </div>
        </div>
        <div class="card hover-lift">
          <div class="stat-card">
            <div class="card-icon success"><span class="material-icons-round">account_balance</span></div>
            <div class="stat-info">
              <div class="stat-label">Active Accounts</div>
              <div class="stat-value">{{ totalActiveAccounts }}</div>
            </div>
          </div>
        </div>
        <div class="card hover-lift">
          <div class="stat-card">
            <div class="card-icon warning"><span class="material-icons-round">pending_actions</span></div>
            <div class="stat-info">
              <div class="stat-label">Pending Approvals</div>
              <div class="stat-value">{{ pendingAccounts.length + pendingLoans.length }}</div>
            </div>
          </div>
        </div>
        <div class="card hover-lift">
          <div class="stat-card">
            <div class="card-icon error"><span class="material-icons-round">real_estate_agent</span></div>
            <div class="stat-info">
              <div class="stat-label">Disbursed Loans</div>
              <div class="stat-value">{{ formatCurrency(totalDisbursedLoans) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Pending Approvals -->
        <div class="card">
          <div class="card-header">
            <h3>Pending Approvals</h3>
            <a routerLink="/account-approval" class="btn btn-ghost btn-sm">View All</a>
          </div>
          <div *ngIf="pendingAccounts.length === 0 && pendingLoans.length === 0" class="empty-state">
            <span class="material-icons-round">check_circle</span>
            <h3>All Approvals Clear</h3>
            <p class="text-sm">No pending account or loan approvals</p>
          </div>

          <div *ngFor="let a of pendingAccounts" class="list-item">
            <div class="card-icon warning"><span class="material-icons-round">how_to_reg</span></div>
            <div class="list-item-content">
              <div class="list-item-title">Account Application - {{ a.accountId }}</div>
              <div class="list-item-subtitle">{{ a.accountType }} · Submitted {{ formatDate(a.openingDate) }}</div>
            </div>
            <div class="list-item-right">
              <a routerLink="/account-approval" class="btn btn-outline btn-sm">Review</a>
            </div>
          </div>

          <div *ngFor="let l of pendingLoans" class="list-item">
            <div class="card-icon warning"><span class="material-icons-round">request_quote</span></div>
            <div class="list-item-content">
              <div class="list-item-title">Loan Application - {{ l.loanId }}</div>
              <div class="list-item-subtitle">{{ l.loanType }} Loan · {{ formatCurrency(l.amount) }}</div>
            </div>
            <div class="list-item-right">
              <a routerLink="/account-approval" class="btn btn-outline btn-sm">Review</a>
            </div>
          </div>
        </div>

        <!-- System Audit Log -->
        <div class="card">
          <div class="card-header">
            <h3>Recent System Activity</h3>
            <a *ngIf="user?.role === 'ADMIN'" routerLink="/admin" class="btn btn-ghost btn-sm">Admin Panel</a>
          </div>
          <div *ngFor="let log of auditLogs.slice(0, 6)" class="list-item">
            <div class="card-icon info" style="width:32px;height:32px;border-radius:50%">
              <span class="material-icons-round" style="font-size:16px">history</span>
            </div>
            <div class="list-item-content">
              <div class="list-item-title text-sm">{{ log.action }} - {{ log.details }}</div>
              <div class="list-item-subtitle">{{ getRelativeTime(log.timestamp) }} by {{ log.userId }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StaffDashboardComponent implements OnInit {
  user: User | null = null;
  totalCustomers = 0;
  totalActiveAccounts = 0;
  totalDisbursedLoans = 0;

  pendingAccounts: Account[] = [];
  pendingLoans: Loan[] = [];
  auditLogs: AuditLog[] = [];

  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private utilsService: UtilsService
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      const allUsers = this.storeService.getAll<User>('users');
      this.totalCustomers = allUsers.filter(u => u.role === 'CUSTOMER').length;

      const allAccounts = this.storeService.getAll<Account>('accounts');
      this.totalActiveAccounts = allAccounts.filter(a => a.status === 'ACTIVE').length;
      this.pendingAccounts = allAccounts.filter(a => a.status === 'PENDING');

      const allLoans = this.storeService.getAll<Loan>('loans');
      this.totalDisbursedLoans = allLoans.filter(l => l.status === 'DISBURSED').reduce((s, l) => s + l.amount, 0);
      this.pendingLoans = allLoans.filter(l => l.status === 'WAITING' || l.status === 'PENDING');

      this.auditLogs = this.storeService.getAuditLogs();
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
}

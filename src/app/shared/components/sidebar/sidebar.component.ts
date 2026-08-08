import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { UtilsService } from '../../../core/services/utils.service';
import { SidebarService } from '../../../core/services/sidebar.service';
import { User, UserRole } from '../../../core/models/bank.models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [ngClass]="{ 'collapsed': isCollapsed }">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">
          <span class="material-icons-round">account_balance</span>
        </div>
        <span class="sidebar-logo-text">ILPBank</span>
        <button type="button" class="sidebar-toggle" (click)="toggleSidebar()" title="Toggle sidebar" aria-label="Toggle sidebar">
          <span class="material-icons-round">menu</span>
        </button>
      </div>

      <nav class="sidebar-nav">
        <!-- Customer Nav -->
        <ng-container *ngIf="role === 'CUSTOMER'">
          <div class="sidebar-section">
            <div class="sidebar-section-title">Main</div>
            <a class="nav-item" routerLink="/dashboard" routerLinkActive="active">
              <span class="material-icons-round">dashboard</span>
              <span>Dashboard</span>
            </a>
            <a class="nav-item" routerLink="/profile" routerLinkActive="active">
              <span class="material-icons-round">person</span>
              <span>My Profile</span>
            </a>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-title">Accounts</div>
            <a class="nav-item" routerLink="/accounts" routerLinkActive="active">
              <span class="material-icons-round">account_balance_wallet</span>
              <span>Account Details</span>
            </a>
            <a class="nav-item" routerLink="/statement" routerLinkActive="active">
              <span class="material-icons-round">receipt_long</span>
              <span>Statement</span>
            </a>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-title">Transactions</div>
            <a class="nav-item" routerLink="/transactions" routerLinkActive="active">
              <span class="material-icons-round">payments</span>
              <span>Deposit & Withdrawal</span>
            </a>
            <a class="nav-item" routerLink="/transfer" routerLinkActive="active">
              <span class="material-icons-round">swap_horiz</span>
              <span>Fund Transfer</span>
            </a>
            <a class="nav-item" routerLink="/scheduled" routerLinkActive="active">
              <span class="material-icons-round">schedule</span>
              <span>Scheduled Payments</span>
            </a>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-title">Cards</div>
            <a class="nav-item" routerLink="/debit-card" routerLinkActive="active">
              <span class="material-icons-round">credit_card</span>
              <span>Debit Cards</span>
            </a>
            <a class="nav-item" routerLink="/credit-card" routerLinkActive="active">
              <span class="material-icons-round">credit_score</span>
              <span>Credit Cards</span>
            </a>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-title">Loans</div>
            <a class="nav-item" routerLink="/loan-products" routerLinkActive="active">
              <span class="material-icons-round">real_estate_agent</span>
              <span>Loan Products</span>
            </a>
            <a class="nav-item" routerLink="/loan-apply" routerLinkActive="active">
              <span class="material-icons-round">post_add</span>
              <span>Apply for Loan</span>
            </a>
            <a class="nav-item" routerLink="/loan-status" routerLinkActive="active">
              <span class="material-icons-round">track_changes</span>
              <span>Loan Status</span>
            </a>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-title">Support</div>
            <a class="nav-item" routerLink="/help" routerLinkActive="active">
              <span class="material-icons-round">help_outline</span>
              <span>Help & Support</span>
            </a>
            <a class="nav-item" routerLink="/info" routerLinkActive="active">
              <span class="material-icons-round">info</span>
              <span>Information</span>
            </a>
          </div>
        </ng-container>

        <!-- Admin Nav -->
        <ng-container *ngIf="role === 'ADMIN'">
          <div class="sidebar-section">
            <div class="sidebar-section-title">Administration</div>
            <a class="nav-item" routerLink="/admin" routerLinkActive="active">
              <span class="material-icons-round">admin_panel_settings</span>
              <span>Admin Panel</span>
            </a>
            <a class="nav-item" routerLink="/staff-dashboard" routerLinkActive="active">
              <span class="material-icons-round">dashboard</span>
              <span>Staff Dashboard</span>
            </a>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-title">Management</div>
            <a class="nav-item" routerLink="/customer-mgmt" routerLinkActive="active">
              <span class="material-icons-round">people</span>
              <span>Customers</span>
            </a>
            <a class="nav-item" routerLink="/account-approval" routerLinkActive="active">
              <span class="material-icons-round">approval</span>
              <span>Account Approval</span>
            </a>
            <a class="nav-item" routerLink="/loan-status" routerLinkActive="active">
              <span class="material-icons-round">track_changes</span>
              <span>Loan Oversight</span>
            </a>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-title">System & Analytics</div>
            <a class="nav-item" routerLink="/reports" routerLinkActive="active">
              <span class="material-icons-round">analytics</span>
              <span>Reports</span>
            </a>
            <a class="nav-item" routerLink="/help" routerLinkActive="active">
              <span class="material-icons-round">help_outline</span>
              <span>Support Desk</span>
            </a>
            <a class="nav-item" routerLink="/profile" routerLinkActive="active">
              <span class="material-icons-round">person</span>
              <span>My Profile</span>
            </a>
          </div>
        </ng-container>

        <!-- Manager Nav -->
        <ng-container *ngIf="role === 'MANAGER'">
          <div class="sidebar-section">
            <div class="sidebar-section-title">Manager Panel</div>
            <a class="nav-item" routerLink="/staff-dashboard" routerLinkActive="active">
              <span class="material-icons-round">dashboard</span>
              <span>Manager Dashboard</span>
            </a>
            <a class="nav-item" routerLink="/admin" routerLinkActive="active">
              <span class="material-icons-round">admin_panel_settings</span>
              <span>Admin & Audit Trail</span>
            </a>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-title">Operations</div>
            <a class="nav-item" routerLink="/account-approval" routerLinkActive="active">
              <span class="material-icons-round">approval</span>
              <span>Account Approvals</span>
            </a>
            <a class="nav-item" routerLink="/loan-status" routerLinkActive="active">
              <span class="material-icons-round">rate_review</span>
              <span>Loan Reviews</span>
            </a>
            <a class="nav-item" routerLink="/customer-mgmt" routerLinkActive="active">
              <span class="material-icons-round">people</span>
              <span>Customer Directory</span>
            </a>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-title">Analytics & Support</div>
            <a class="nav-item" routerLink="/reports" routerLinkActive="active">
              <span class="material-icons-round">analytics</span>
              <span>Reports & Analytics</span>
            </a>
            <a class="nav-item" routerLink="/help" routerLinkActive="active">
              <span class="material-icons-round">support_agent</span>
              <span>Complaints & Support</span>
            </a>
            <a class="nav-item" routerLink="/profile" routerLinkActive="active">
              <span class="material-icons-round">person</span>
              <span>My Profile</span>
            </a>
          </div>
        </ng-container>

        <!-- Staff Nav -->
        <ng-container *ngIf="role === 'STAFF'">
          <div class="sidebar-section">
            <div class="sidebar-section-title">Branch Operations</div>
            <a class="nav-item" routerLink="/staff-dashboard" routerLinkActive="active">
              <span class="material-icons-round">dashboard</span>
              <span>Branch Dashboard</span>
            </a>
            <a class="nav-item" routerLink="/account-approval" routerLinkActive="active">
              <span class="material-icons-round">approval</span>
              <span>Account Approvals</span>
            </a>
            <a class="nav-item" routerLink="/customer-mgmt" routerLinkActive="active">
              <span class="material-icons-round">people</span>
              <span>Customer Management</span>
            </a>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-title">Service & Support</div>
            <a class="nav-item" routerLink="/help" routerLinkActive="active">
              <span class="material-icons-round">help_outline</span>
              <span>Customer Support</span>
            </a>
            <a class="nav-item" routerLink="/profile" routerLinkActive="active">
              <span class="material-icons-round">person</span>
              <span>My Profile</span>
            </a>
          </div>
        </ng-container>

        <!-- Loan Officer Nav -->
        <ng-container *ngIf="role === 'LOAN_OFFICER'">
          <div class="sidebar-section">
            <div class="sidebar-section-title">Credit Department</div>
            <a class="nav-item" routerLink="/loan-status" routerLinkActive="active">
              <span class="material-icons-round">assignment</span>
              <span>Loan Applications</span>
            </a>
            <a class="nav-item" routerLink="/loan-products" routerLinkActive="active">
              <span class="material-icons-round">real_estate_agent</span>
              <span>Loan Products</span>
            </a>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-title">User</div>
            <a class="nav-item" routerLink="/profile" routerLinkActive="active">
              <span class="material-icons-round">person</span>
              <span>My Profile</span>
            </a>
            <a class="nav-item" routerLink="/info" routerLinkActive="active">
              <span class="material-icons-round">info</span>
              <span>Information</span>
            </a>
          </div>
        </ng-container>

        <!-- CSR Nav -->
        <ng-container *ngIf="role === 'CSR'">
          <div class="sidebar-section">
            <div class="sidebar-section-title">Customer Service</div>
            <a class="nav-item" routerLink="/customer-mgmt" routerLinkActive="active">
              <span class="material-icons-round">search</span>
              <span>Customer Lookup</span>
            </a>
            <a class="nav-item" routerLink="/help" routerLinkActive="active">
              <span class="material-icons-round">confirmation_number</span>
              <span>Support Complaints</span>
            </a>
            <a class="nav-item" routerLink="/debit-card" routerLinkActive="active">
              <span class="material-icons-round">credit_card</span>
              <span>Card Operations</span>
            </a>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-title">User</div>
            <a class="nav-item" routerLink="/profile" routerLinkActive="active">
              <span class="material-icons-round">person</span>
              <span>My Profile</span>
            </a>
            <a class="nav-item" routerLink="/info" routerLinkActive="active">
              <span class="material-icons-round">info</span>
              <span>Information</span>
            </a>
          </div>
        </ng-container>
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-user" *ngIf="user">
          <div class="avatar sm">{{ initials }}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">{{ user.firstName }} {{ user.lastName }}</div>
            <div class="sidebar-user-role">{{ role }}</div>
          </div>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  user: User | null = null;
  role: UserRole | null = null;
  initials = '?';

  constructor(
    private authService: AuthService,
    private utilsService: UtilsService,
    private sidebarService: SidebarService
  ) {}

  ngOnInit() {
    this.sidebarService.collapsed$.subscribe(c => this.isCollapsed = c);
    this.user = this.authService.getCurrentUser();
    this.role = this.authService.getCurrentRole();
    if (this.user) {
      this.initials = this.utilsService.getInitials(`${this.user.firstName} ${this.user.lastName}`);
    }
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }
}

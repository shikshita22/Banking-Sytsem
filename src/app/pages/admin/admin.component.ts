import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { StoreService } from '../../core/services/store.service';
import { SeedService } from '../../core/services/seed.service';
import { UtilsService } from '../../core/services/utils.service';
import { ToastService } from '../../core/services/toast.service';
import { ModalService } from '../../core/services/modal.service';
import { AuditLog, User } from '../../core/models/bank.models';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-enter" *ngIf="user">
      <div class="page-header">
        <div>
          <h1>System Administration & Audit</h1>
          <p>System controls, internal staff directory, and audit log inspection</p>
        </div>
        <div class="page-actions" *ngIf="isAdmin">
          <button class="btn btn-secondary" (click)="reseedDatabase()">
            <span class="material-icons-round">refresh</span> Reseed Seed Data
          </button>
          <button class="btn btn-danger" (click)="clearDatabase()">
            <span class="material-icons-round">delete_forever</span> Clear Database
          </button>
        </div>
      </div>

      <!-- Staff Directory Card -->
      <div class="card mb-xl">
        <div class="card-header">
          <h3>Internal Staff Directory ({{ staffMembers.length }})</h3>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th *ngIf="isAdmin">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of staffMembers">
                <td class="font-mono text-sm font-semibold">{{ s.userId }}</td>
                <td class="font-semibold">{{ s.firstName }} {{ s.lastName }}</td>
                <td>{{ s.email }}</td>
                <td><span class="badge badge-info">{{ s.role }}</span></td>
                <td><span class="badge" [ngClass]="'badge-' + getStatusBadgeClass(s.status)">{{ s.status }}</span></td>
                <td>{{ formatDate(s.createdAt) }}</td>
                <td *ngIf="isAdmin">
                  <button *ngIf="s.userId !== user.userId && s.status === 'ACTIVE'" class="btn btn-danger btn-xs" (click)="revokeStaffAccess(s)" title="Revoke Access (Deactivate)">
                    <span class="material-icons-round text-xs">remove_circle</span> Revoke Access
                  </button>
                  <span *ngIf="s.userId === user.userId" class="text-xs text-muted font-italic">Current Admin</span>
                  <span *ngIf="s.status !== 'ACTIVE' && s.userId !== user.userId" class="text-xs text-muted">Inactive</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Audit Logs Card -->
      <div class="card mb-xl">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <h3>System Audit Logs ({{ filteredLogs.length }})</h3>
          <div class="form-group mb-0" style="width: 280px;">
            <input type="text" class="form-control form-control-sm" [(ngModel)]="logQuery" (input)="filterAuditLogs()" placeholder="Filter by User ID or Action...">
          </div>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>User ID</th>
                <th>Action</th>
                <th>Target</th>
                <th>Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filteredLogs.length === 0">
                <td colspan="6" class="text-center p-md text-muted">No audit logs found.</td>
              </tr>
              <tr *ngFor="let log of filteredLogs">
                <td class="font-mono text-sm">{{ log.id }}</td>
                <td class="font-mono text-sm font-semibold">{{ log.userId }}</td>
                <td><span class="badge badge-info">{{ log.action }}</span></td>
                <td class="font-mono text-sm">{{ log.target }}</td>
                <td>{{ log.details }}</td>
                <td class="text-sm text-muted">{{ formatDateTime(log.timestamp) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminPanelComponent implements OnInit {
  user: User | null = null;
  isAdmin = false;
  auditLogs: AuditLog[] = [];
  filteredLogs: AuditLog[] = [];
  staffMembers: User[] = [];
  logQuery = '';

  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private seedService: SeedService,
    private utilsService: UtilsService,
    private toastService: ToastService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.isAdmin = this.authService.isAdmin();
      this.loadData();
    }
  }

  loadData() {
    this.auditLogs = this.storeService.getAuditLogs();
    this.filterAuditLogs();

    const allUsers = this.storeService.getAll<User>('users');
    this.staffMembers = allUsers.filter(u => u.role !== 'CUSTOMER');
  }

  filterAuditLogs() {
    const q = this.logQuery.trim().toLowerCase();
    if (!q) {
      this.filteredLogs = [...this.auditLogs];
      return;
    }
    this.filteredLogs = this.auditLogs.filter(l =>
      l.id.toLowerCase().includes(q) ||
      l.userId.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q)
    );
  }

  formatDate(dateStr: string): string {
    return this.utilsService.formatDate(dateStr);
  }

  formatDateTime(dateStr: string): string {
    return this.utilsService.formatDateTime(dateStr);
  }

  getStatusBadgeClass(status: string): string {
    return this.utilsService.getStatusBadgeClass(status);
  }

  revokeStaffAccess(staff: User) {
    if (staff.userId === this.user?.userId) {
      this.toastService.error('Action Denied', 'Safety Guard: You cannot revoke your own admin access.');
      return;
    }

    this.modalService.confirm('Revoke Staff Access', `Are you sure you want to deactivate ${staff.firstName} ${staff.lastName} (${staff.userId})?`, () => {
      this.storeService.updateUser(staff.userId, { status: 'INACTIVE' });

      this.storeService.addAuditLog({
        id: this.utilsService.generateAuditId(this.storeService),
        userId: this.user?.userId || 'ADMIN',
        action: 'STAFF_REVOKED',
        target: staff.userId,
        details: `Revoked staff access for ${staff.userId} (${staff.role})`,
        timestamp: this.utilsService.nowISO()
      });

      this.toastService.success('Access Revoked', `Staff account ${staff.userId} has been set to INACTIVE.`);
      this.loadData();
    }, 'danger');
  }

  async reseedDatabase() {
    this.modalService.confirm('Reseed Data', 'This will reset the database to default seed data. Proceed?', async () => {
      this.storeService.clearAll();
      await this.seedService.loadSeedData();
      this.toastService.success('Database Reseeded', 'Default seed data has been reloaded');
      window.location.reload();
    });
  }

  clearDatabase() {
    this.modalService.confirm('Clear Database', 'Are you sure you want to clear all data? You will be logged out.', () => {
      this.storeService.clearAll();
      this.toastService.info('Cleared', 'Database cleared');
      this.authService.logout();
    }, 'danger');
  }
}


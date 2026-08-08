import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { StoreService } from '../../core/services/store.service';
import { UtilsService } from '../../core/services/utils.service';
import { ToastService } from '../../core/services/toast.service';
import { ModalService } from '../../core/services/modal.service';
import { Account, ScheduledPayment, User } from '../../core/models/bank.models';

@Component({
  selector: 'app-scheduled-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-enter" *ngIf="user">
      <div class="page-header">
        <div>
          <h1>Scheduled Payments</h1>
          <p>Set up and manage recurring automatic payments</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" (click)="openCreateModal()">
            <span class="material-icons-round">add</span> Schedule New Payment
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Scheduled Payments ({{ scheduled.length }})</h3>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Payee</th>
                <th>Account</th>
                <th>Amount</th>
                <th>Frequency</th>
                <th>Next Execution</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="scheduled.length === 0">
                <td colspan="7" class="text-center p-xl">
                  <div class="empty-state">
                    <span class="material-icons-round">schedule</span>
                    <h3>No scheduled payments</h3>
                    <p class="text-muted text-sm">Create a recurring payment for bills or transfers</p>
                  </div>
                </td>
              </tr>
              <tr *ngFor="let s of scheduled">
                <td class="font-semibold">{{ s.payeeName }}</td>
                <td>{{ s.accountId }}</td>
                <td class="font-semibold text-accent">{{ formatCurrency(s.amount) }}</td>
                <td><span class="badge badge-info">{{ s.frequency }}</span></td>
                <td>{{ formatDate(s.nextExecution) }}</td>
                <td><span class="badge" [ngClass]="'badge-' + getStatusBadgeClass(s.status)">{{ s.status }}</span></td>
                <td>
                  <button class="btn btn-ghost btn-sm text-error" (click)="deletePayment(s.id)">
                    <span class="material-icons-round">delete</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ScheduledPaymentsComponent implements OnInit {
  user: User | null = null;
  accounts: Account[] = [];
  scheduled: ScheduledPayment[] = [];

  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private utilsService: UtilsService,
    private toastService: ToastService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.accounts = this.storeService.getAccountsByUser(this.user.userId);
      this.loadScheduled();
    }
  }

  loadScheduled() {
    if (this.user) {
      this.scheduled = this.storeService.getScheduledByUser(this.user.userId);
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

  openCreateModal() {
    this.modalService.alert('Schedule Payment', 'Use the Fund Transfer tab to create scheduled transfers.');
  }

  deletePayment(id: string) {
    this.modalService.confirm('Cancel Scheduled Payment', 'Are you sure you want to cancel this scheduled payment?', () => {
      this.storeService.removeScheduledPayment(id);
      this.toastService.success('Cancelled', 'Scheduled payment has been removed');
      this.loadScheduled();
    }, 'danger');
  }
}

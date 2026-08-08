import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { StoreService } from '../../core/services/store.service';
import { UtilsService } from '../../core/services/utils.service';
import { ToastService } from '../../core/services/toast.service';
import { ModalService } from '../../core/services/modal.service';
import { Account, Loan, User } from '../../core/models/bank.models';

@Component({
  selector: 'app-account-approval',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-enter" *ngIf="user">
      <div class="page-header">
        <div>
          <h1>Account & Loan Approvals</h1>
          <p>Review pending customer registrations, account applications, and loan requests</p>
        </div>
      </div>

      <!-- Pending Accounts Card -->
      <div class="card mb-xl">
        <div class="card-header">
          <h3>Pending Account Approvals ({{ pendingAccounts.length }})</h3>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Account ID</th>
                <th>User ID</th>
                <th>Account Type</th>
                <th>Branch</th>
                <th>Applied Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="pendingAccounts.length === 0">
                <td colspan="6" class="text-center p-xl">
                  <div class="empty-state">
                    <span class="material-icons-round">check_circle</span>
                    <h3>No pending account approvals</h3>
                  </div>
                </td>
              </tr>
              <tr *ngFor="let a of pendingAccounts">
                <td class="font-mono text-sm font-semibold">{{ a.accountId }}</td>
                <td class="font-mono text-sm">{{ a.userId }}</td>
                <td>{{ a.accountType }}</td>
                <td>{{ a.branch }}</td>
                <td>{{ formatDate(a.openingDate) }}</td>
                <td>
                  <button class="btn btn-success btn-sm mr-xs" (click)="approveAccount(a)">Approve</button>
                  <button class="btn btn-danger btn-sm" (click)="rejectAccount(a)">Reject</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pending Loans Card -->
      <div class="card">
        <div class="card-header">
          <h3>Pending Loan Approvals ({{ pendingLoans.length }})</h3>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Loan ID</th>
                <th>User ID</th>
                <th>Loan Type</th>
                <th>Amount</th>
                <th>Tenure</th>
                <th>Applied Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="pendingLoans.length === 0">
                <td colspan="7" class="text-center p-xl">
                  <div class="empty-state">
                    <span class="material-icons-round">check_circle</span>
                    <h3>No pending loan approvals</h3>
                  </div>
                </td>
              </tr>
              <tr *ngFor="let l of pendingLoans">
                <td class="font-mono text-sm font-semibold">{{ l.loanId }}</td>
                <td class="font-mono text-sm">{{ l.userId }}</td>
                <td>{{ l.loanType }}</td>
                <td class="font-semibold">{{ formatCurrency(l.amount) }}</td>
                <td>{{ l.tenureMonths }} months</td>
                <td>{{ formatDate(l.appliedDate) }}</td>
                <td>
                  <button class="btn btn-success btn-sm mr-xs" (click)="approveLoan(l)">Approve & Disburse</button>
                  <button class="btn btn-danger btn-sm" (click)="rejectLoan(l)">Reject</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AccountApprovalComponent implements OnInit {
  user: User | null = null;
  pendingAccounts: Account[] = [];
  pendingLoans: Loan[] = [];

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
      this.loadPending();
    }
  }

  loadPending() {
    const accounts = this.storeService.getAll<Account>('accounts');
    this.pendingAccounts = accounts.filter(a => a.status === 'PENDING');

    const loans = this.storeService.getAll<Loan>('loans');
    this.pendingLoans = loans.filter(l => l.status === 'WAITING' || l.status === 'PENDING');
  }

  formatCurrency(amount: number): string {
    return this.utilsService.formatCurrency(amount);
  }

  formatDate(dateStr: string): string {
    return this.utilsService.formatDate(dateStr);
  }

  approveAccount(acc: Account) {
    this.modalService.confirm('Approve Account', `Approve account ${acc.accountId} for user ${acc.userId}?`, () => {
      this.storeService.updateAccount(acc.accountId, { status: 'ACTIVE', balance: 5000, availableBalance: 5000 });
      this.toastService.success('Approved!', `Account ${acc.accountId} is now ACTIVE with initial deposit`);
      this.loadPending();
    });
  }

  rejectAccount(acc: Account) {
    this.modalService.confirm('Reject Account', `Reject application for ${acc.accountId}?`, () => {
      this.storeService.updateAccount(acc.accountId, { status: 'REJECTED' });
      this.toastService.error('Rejected', `Account ${acc.accountId} application rejected`);
      this.loadPending();
    }, 'danger');
  }

  approveLoan(loan: Loan) {
    this.modalService.confirm('Approve & Disburse Loan', `Approve loan ${loan.loanId} of ${this.formatCurrency(loan.amount)}?`, () => {
      this.storeService.updateLoan(loan.loanId, {
        status: 'DISBURSED',
        disbursedDate: this.utilsService.todayISO()
      });

      // Credit disbursement account with fallback
      const acc = this.storeService.getAccountById(loan.accountId) ||
                  this.storeService.getAccountsByUser(loan.userId).find(a => a.status === 'ACTIVE');

      if (acc) {
        this.storeService.updateAccount(acc.accountId, {
          balance: acc.balance + loan.amount,
          availableBalance: acc.availableBalance + loan.amount
        });

        this.storeService.addTransaction({
          transactionId: this.utilsService.generateTransactionId(this.storeService),
          accountId: acc.accountId,
          transactionType: 'CREDIT',
          category: 'LOAN_DISBURSEMENT',
          amount: loan.amount,
          balance: acc.balance + loan.amount,
          description: `Loan Disbursement - ${loan.loanId} (${loan.loanType})`,
          referenceId: loan.loanId,
          date: this.utilsService.todayISO(),
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          status: 'SUCCESS',
          toAccount: acc.accountId,
          fromAccount: 'BANK_DISBURSEMENT'
        });
      }

      this.storeService.addNotification({
        id: 'N' + Date.now(),
        userId: loan.userId,
        title: 'Loan Approved & Disbursed!',
        message: `Your ${loan.loanType} loan application (${loan.loanId}) for ${this.formatCurrency(loan.amount)} has been approved and credited.`,
        type: 'success',
        timestamp: this.utilsService.nowISO(),
        read: false
      });

      this.storeService.addAuditLog({
        id: this.utilsService.generateAuditId(this.storeService),
        userId: this.user?.userId || 'SYSTEM',
        action: 'LOAN_APPROVED',
        target: loan.loanId,
        details: `Approved & disbursed ${loan.loanType} loan of ${loan.amount} for user ${loan.userId}`,
        timestamp: this.utilsService.nowISO()
      });

      this.toastService.success('Disbursed!', `Loan ${loan.loanId} approved and disbursed`);
      this.loadPending();
    });
  }

  rejectLoan(loan: Loan) {
    this.modalService.confirm('Reject Loan', `Reject loan application ${loan.loanId}?`, () => {
      this.storeService.updateLoan(loan.loanId, { status: 'REJECTED' });

      this.storeService.addNotification({
        id: 'N' + Date.now(),
        userId: loan.userId,
        title: 'Loan Application Status',
        message: `Your ${loan.loanType} loan application (${loan.loanId}) has been rejected.`,
        type: 'error',
        timestamp: this.utilsService.nowISO(),
        read: false
      });

      this.storeService.addAuditLog({
        id: this.utilsService.generateAuditId(this.storeService),
        userId: this.user?.userId || 'SYSTEM',
        action: 'LOAN_REJECTED',
        target: loan.loanId,
        details: `Rejected ${loan.loanType} loan application for user ${loan.userId}`,
        timestamp: this.utilsService.nowISO()
      });

      this.toastService.error('Rejected', `Loan application ${loan.loanId} rejected`);
      this.loadPending();
    }, 'danger');
  }
}

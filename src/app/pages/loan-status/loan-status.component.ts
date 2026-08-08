import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { StoreService } from '../../core/services/store.service';
import { UtilsService } from '../../core/services/utils.service';
import { ToastService } from '../../core/services/toast.service';
import { ModalService } from '../../core/services/modal.service';
import { Loan, User } from '../../core/models/bank.models';

@Component({
  selector: 'app-loan-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-enter" *ngIf="user">
      <div class="page-header">
        <div>
          <h1>{{ isCreditStaff ? 'Credit Department — Loan Management' : 'Loan Status & Tracking' }}</h1>
          <p>{{ isCreditStaff ? 'Review, evaluate credit applications, approve loans, and disburse funds' : 'Track your loan applications, approvals, and repayment schedules' }}</p>
        </div>
      </div>

      <!-- Credit Staff Overview Stats -->
      <div *ngIf="isCreditStaff" class="stats-grid stagger-in mb-xl">
        <div class="card hover-lift">
          <div class="stat-card">
            <div class="card-icon warning"><span class="material-icons-round">hourglass_empty</span></div>
            <div class="stat-info">
              <div class="stat-label">Pending Review</div>
              <div class="stat-value">{{ countByStatus('WAITING') + countByStatus('PENDING') }}</div>
            </div>
          </div>
        </div>
        <div class="card hover-lift">
          <div class="stat-card">
            <div class="card-icon info"><span class="material-icons-round">thumb_up</span></div>
            <div class="stat-info">
              <div class="stat-label">Approved (Awaiting Disbursement)</div>
              <div class="stat-value">{{ countByStatus('APPROVED') }}</div>
            </div>
          </div>
        </div>
        <div class="card hover-lift">
          <div class="stat-card">
            <div class="card-icon success"><span class="material-icons-round">monetization_on</span></div>
            <div class="stat-info">
              <div class="stat-label">Disbursed Loans</div>
              <div class="stat-value">{{ countByStatus('DISBURSED') }}</div>
            </div>
          </div>
        </div>
        <div class="card hover-lift">
          <div class="stat-card">
            <div class="card-icon primary"><span class="material-icons-round">account_balance</span></div>
            <div class="stat-info">
              <div class="stat-label">Total Disbursed Volume</div>
              <div class="stat-value">{{ formatCurrency(totalDisbursedVolume) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Loans Card -->
      <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <h3>{{ isCreditStaff ? 'Loan Applications Queue' : 'My Loans' }} ({{ filteredLoans.length }})</h3>

          <!-- Filter Tabs for Credit Staff -->
          <div *ngIf="isCreditStaff" class="button-group" style="display:flex; gap:6px;">
            <button class="btn btn-xs" [ngClass]="activeTab === 'ALL' ? 'btn-primary' : 'btn-outline'" (click)="setTab('ALL')">All</button>
            <button class="btn btn-xs" [ngClass]="activeTab === 'WAITING' ? 'btn-primary' : 'btn-outline'" (click)="setTab('WAITING')">Pending</button>
            <button class="btn btn-xs" [ngClass]="activeTab === 'APPROVED' ? 'btn-primary' : 'btn-outline'" (click)="setTab('APPROVED')">Approved</button>
            <button class="btn btn-xs" [ngClass]="activeTab === 'DISBURSED' ? 'btn-primary' : 'btn-outline'" (click)="setTab('DISBURSED')">Disbursed</button>
            <button class="btn btn-xs" [ngClass]="activeTab === 'REJECTED' ? 'btn-primary' : 'btn-outline'" (click)="setTab('REJECTED')">Rejected</button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Loan ID</th>
                <th *ngIf="isCreditStaff">Applicant</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Tenure</th>
                <th>Interest Rate</th>
                <th>EMI</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th *ngIf="isCreditStaff">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filteredLoans.length === 0">
                <td [attr.colspan]="isCreditStaff ? 10 : 8" class="text-center p-xl">
                  <div class="empty-state">
                    <span class="material-icons-round">track_changes</span>
                    <h3>No loans found</h3>
                    <p class="text-muted text-sm">{{ isCreditStaff ? 'No loan applications found for this filter' : 'You have not submitted any loan applications yet' }}</p>
                  </div>
                </td>
              </tr>
              <tr *ngFor="let l of filteredLoans">
                <td class="font-mono text-sm font-semibold">{{ l.loanId }}</td>
                <td *ngIf="isCreditStaff" class="font-mono text-sm">
                  <div>{{ getUserName(l.userId) }}</div>
                  <small class="text-muted">{{ l.userId }}</small>
                </td>
                <td>{{ l.loanType }}</td>
                <td class="font-semibold">{{ formatCurrency(l.amount) }}</td>
                <td>{{ l.tenureMonths }} months</td>
                <td>{{ l.interestRate }}%</td>
                <td class="font-semibold text-accent">{{ formatCurrency(l.emiAmount) }}</td>
                <td><span class="badge" [ngClass]="'badge-' + getStatusBadgeClass(l.status)">{{ l.status }}</span></td>
                <td>{{ formatDate(l.appliedDate) }}</td>
                <td *ngIf="isCreditStaff">
                  <div style="display:flex; gap:6px;">
                    <!-- Pending state actions -->
                    <ng-container *ngIf="l.status === 'WAITING' || l.status === 'PENDING'">
                      <button class="btn btn-success btn-xs" (click)="approveLoan(l)" title="Approve Loan Application">Approve</button>
                      <button class="btn btn-danger btn-xs" (click)="rejectLoan(l)" title="Reject Loan Application">Reject</button>
                    </ng-container>

                    <!-- Approved state actions -->
                    <ng-container *ngIf="l.status === 'APPROVED'">
                      <button class="btn btn-primary btn-xs" (click)="disburseLoan(l)" title="Disburse Funds to Applicant Account">Disburse Funds</button>
                    </ng-container>

                    <!-- Disbursed / Rejected info badge -->
                    <span *ngIf="l.status === 'DISBURSED'" class="text-xs text-success font-semibold">Disbursed on {{ formatDate(l.disbursedDate || '') }}</span>
                    <span *ngIf="l.status === 'REJECTED'" class="text-xs text-danger">Rejected</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class LoanStatusComponent implements OnInit {
  user: User | null = null;
  allLoans: Loan[] = [];
  filteredLoans: Loan[] = [];
  isCreditStaff = false;
  activeTab = 'ALL';
  totalDisbursedVolume = 0;

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
      this.isCreditStaff = this.authService.isLoanOfficer() || this.authService.isManager() || this.authService.isAdmin();
      this.loadLoans();
    }
  }

  loadLoans() {
    if (this.isCreditStaff) {
      this.allLoans = this.storeService.getAll<Loan>('loans');
    } else if (this.user) {
      this.allLoans = this.storeService.getLoansByUser(this.user.userId);
    }
    this.totalDisbursedVolume = this.allLoans
      .filter(l => l.status === 'DISBURSED')
      .reduce((sum, l) => sum + l.amount, 0);

    this.applyFilter();
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.applyFilter();
  }

  applyFilter() {
    if (this.activeTab === 'ALL') {
      this.filteredLoans = [...this.allLoans];
    } else if (this.activeTab === 'WAITING') {
      this.filteredLoans = this.allLoans.filter(l => l.status === 'WAITING' || l.status === 'PENDING');
    } else {
      this.filteredLoans = this.allLoans.filter(l => l.status === this.activeTab);
    }
  }

  countByStatus(status: string): number {
    if (status === 'WAITING') {
      return this.allLoans.filter(l => l.status === 'WAITING' || l.status === 'PENDING').length;
    }
    return this.allLoans.filter(l => l.status === status).length;
  }

  getUserName(userId: string): string {
    const u = this.storeService.getUserById(userId);
    return u ? `${u.firstName} ${u.lastName}` : userId;
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

  approveLoan(loan: Loan) {
    this.modalService.confirm('Approve Loan Application', `Approve loan application ${loan.loanId} of ${this.formatCurrency(loan.amount)} for applicant ${this.getUserName(loan.userId)}?`, () => {
      this.storeService.updateLoan(loan.loanId, {
        status: 'APPROVED'
      });

      this.storeService.addNotification({
        id: 'N' + Date.now(),
        userId: loan.userId,
        title: 'Loan Approved!',
        message: `Your ${loan.loanType} loan application (${loan.loanId}) for ${this.formatCurrency(loan.amount)} has been APPROVED. Funds will be disbursed shortly.`,
        type: 'success',
        timestamp: this.utilsService.nowISO(),
        read: false
      });

      this.storeService.addAuditLog({
        id: this.utilsService.generateAuditId(this.storeService),
        userId: this.user?.userId || 'SYSTEM',
        action: 'LOAN_APPROVED',
        target: loan.loanId,
        details: `Approved ${loan.loanType} loan of ${loan.amount} for user ${loan.userId}`,
        timestamp: this.utilsService.nowISO()
      });

      this.toastService.success('Approved!', `Loan ${loan.loanId} approved. It is now ready for disbursement.`);
      this.loadLoans();
    });
  }

  rejectLoan(loan: Loan) {
    this.modalService.confirm('Reject Loan Application', `Reject loan application ${loan.loanId} for user ${loan.userId}?`, () => {
      this.storeService.updateLoan(loan.loanId, { status: 'REJECTED' });

      this.storeService.addNotification({
        id: 'N' + Date.now(),
        userId: loan.userId,
        title: 'Loan Application Status',
        message: `Your ${loan.loanType} loan application (${loan.loanId}) has been rejected after credit review.`,
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

      this.toastService.error('Rejected', `Loan ${loan.loanId} application rejected.`);
      this.loadLoans();
    }, 'danger');
  }

  disburseLoan(loan: Loan) {
    this.modalService.confirm('Disburse Loan Funds', `Disburse principal amount of ${this.formatCurrency(loan.amount)} directly to applicant's account (${loan.accountId})?`, () => {
      // 1. Update loan status
      this.storeService.updateLoan(loan.loanId, {
        status: 'DISBURSED',
        disbursedDate: this.utilsService.todayISO()
      });

      // 2. Credit applicant account balance
      const account = this.storeService.getAccountById(loan.accountId);
      if (account) {
        this.storeService.updateAccount(account.accountId, {
          balance: account.balance + loan.amount,
          availableBalance: account.availableBalance + loan.amount
        });

        // 3. Record LOAN_DISBURSEMENT transaction
        this.storeService.addTransaction({
          transactionId: this.utilsService.generateTransactionId(this.storeService),
          accountId: account.accountId,
          transactionType: 'CREDIT',
          category: 'LOAN_DISBURSEMENT',
          amount: loan.amount,
          balance: account.balance + loan.amount,
          description: `Loan Disbursement - ${loan.loanId} (${loan.loanType})`,
          referenceId: loan.loanId,
          date: this.utilsService.todayISO(),
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          status: 'SUCCESS',
          toAccount: account.accountId,
          fromAccount: 'BANK_DISBURSEMENT'
        });
      }

      // 4. Send customer notification
      this.storeService.addNotification({
        id: 'N' + Date.now(),
        userId: loan.userId,
        title: 'Loan Disbursed!',
        message: `Amount of ${this.formatCurrency(loan.amount)} for loan ${loan.loanId} has been credited to your account ${loan.accountId}.`,
        type: 'success',
        timestamp: this.utilsService.nowISO(),
        read: false
      });

      // 5. Add audit log
      this.storeService.addAuditLog({
        id: this.utilsService.generateAuditId(this.storeService),
        userId: this.user?.userId || 'SYSTEM',
        action: 'LOAN_DISBURSED',
        target: loan.loanId,
        details: `Disbursed ${loan.amount} for loan ${loan.loanId} to account ${loan.accountId}`,
        timestamp: this.utilsService.nowISO()
      });

      this.toastService.success('Disbursed!', `Loan ${loan.loanId} funds credited to account ${loan.accountId}.`);
      this.loadLoans();
    });
  }
}


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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filteredLoans.length === 0">
                <td [attr.colspan]="isCreditStaff ? 10 : 9" class="text-center p-xl">
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
                <td>
                  <div style="display:flex; gap:6px; align-items:center;">
                    <!-- Credit staff actions -->
                    <ng-container *ngIf="isCreditStaff">
                      <ng-container *ngIf="l.status === 'WAITING' || l.status === 'PENDING'">
                        <button class="btn btn-success btn-xs" (click)="approveLoan(l)" title="Approve Loan Application">Approve</button>
                        <button class="btn btn-danger btn-xs" (click)="rejectLoan(l)" title="Reject Loan Application">Reject</button>
                      </ng-container>

                      <ng-container *ngIf="l.status === 'APPROVED'">
                        <button class="btn btn-primary btn-xs" (click)="disburseLoan(l)" title="Disburse Funds to Applicant Account">Disburse Funds</button>
                      </ng-container>

                      <span *ngIf="l.status === 'DISBURSED'" class="text-xs text-success font-semibold">Disbursed on {{ formatDate(l.disbursedDate || '') }}</span>
                      <span *ngIf="l.status === 'REJECTED'" class="text-xs text-danger">Rejected</span>
                    </ng-container>

                    <!-- Customer actions -->
                    <ng-container *ngIf="!isCreditStaff">
                      <button *ngIf="l.status === 'DISBURSED'" class="btn btn-success btn-xs" (click)="payEMI(l)" title="Pay Monthly EMI">Pay EMI</button>
                      <span *ngIf="l.status !== 'DISBURSED'" class="text-xs text-muted">-</span>
                    </ng-container>
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

  payEMI(loan: Loan) {
    if (!this.user) return;

    const userAccounts = this.storeService.getAccountsByUser(this.user.userId).filter(a => a.status === 'ACTIVE');
    let account = userAccounts.find(a => a.accountId === loan.accountId && a.availableBalance >= loan.emiAmount);
    if (!account) {
      account = userAccounts.find(a => a.availableBalance >= loan.emiAmount);
    }
    if (!account) {
      account = userAccounts.find(a => a.accountId === loan.accountId) || userAccounts[0];
    }

    if (!account) {
      this.toastService.error('Payment Failed', 'No active bank account found for EMI deduction.');
      return;
    }

    if (account.availableBalance < loan.emiAmount) {
      this.toastService.error('Insufficient Balance', `Account ${account.accountId} has available balance of ${this.formatCurrency(account.availableBalance)}, which is less than EMI amount ${this.formatCurrency(loan.emiAmount)}.`);
      return;
    }

    this.modalService.confirm(
      'Confirm Pay EMI',
      `Pay EMI amount of ${this.formatCurrency(loan.emiAmount)} for ${loan.loanType} Loan (${loan.loanId}) from account ${account.accountId}?`,
      () => {
        const emiAmt = loan.emiAmount;

        // 1. Deduct balance from account
        const newBalance = account.balance - emiAmt;
        const newAvailBalance = account.availableBalance - emiAmt;
        this.storeService.updateAccount(account.accountId, {
          balance: newBalance,
          availableBalance: newAvailBalance
        });

        // 2. Deduct remaining principal from loan
        const remainingAmount = Math.max(0, loan.amount - emiAmt);
        const isFullyPaid = remainingAmount === 0;
        const newLoanStatus = isFullyPaid ? 'CLOSED' : loan.status;

        let emiSchedule = (loan as any).emiSchedule || [];
        if (Array.isArray(emiSchedule) && emiSchedule.length > 0) {
          const nextUpcoming = emiSchedule.find((item: any) => item.status === 'UPCOMING');
          if (nextUpcoming) {
            nextUpcoming.status = 'PAID';
          }
        }

        this.storeService.updateLoan(loan.loanId, {
          amount: remainingAmount,
          status: newLoanStatus,
          emiSchedule: emiSchedule
        });

        // 3. Record DEBIT transaction
        const txnId = this.utilsService.generateTransactionId(this.storeService);
        this.storeService.addTransaction({
          transactionId: txnId,
          accountId: account.accountId,
          transactionType: 'DEBIT',
          category: 'EMI',
          amount: emiAmt,
          balance: newBalance,
          description: `EMI Payment - ${loan.loanType} Loan (${loan.loanId})`,
          referenceId: loan.loanId,
          date: this.utilsService.todayISO(),
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          status: 'COMPLETED',
          toAccount: 'BANK_LOAN_DEPT',
          fromAccount: account.accountId
        });

        // 4. Send notification
        this.storeService.addNotification({
          id: 'N' + Date.now(),
          userId: this.user!.userId,
          title: isFullyPaid ? 'Loan Paid Off!' : 'EMI Paid Successfully',
          message: isFullyPaid
            ? `Congratulations! Your ${loan.loanType} loan (${loan.loanId}) is now fully paid off!`
            : `EMI payment of ${this.formatCurrency(emiAmt)} for ${loan.loanType} loan (${loan.loanId}) completed successfully.`,
          type: 'success',
          timestamp: this.utilsService.nowISO(),
          read: false
        });

        // 5. Add audit log
        this.storeService.addAuditLog({
          id: this.utilsService.generateAuditId(this.storeService),
          userId: this.user!.userId,
          action: 'EMI_PAYMENT',
          target: loan.loanId,
          details: `Paid EMI ${emiAmt} for loan ${loan.loanId} from account ${account.accountId}`,
          timestamp: this.utilsService.nowISO()
        });

        this.toastService.success(
          'EMI Paid!',
          `Successfully deducted ${this.formatCurrency(emiAmt)} from account ${account.accountId} for Loan ${loan.loanId}.`
        );

        this.loadLoans();
      }
    );
  }
}


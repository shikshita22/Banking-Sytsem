import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { StoreService } from '../../core/services/store.service';
import { UtilsService } from '../../core/services/utils.service';
import { ToastService } from '../../core/services/toast.service';
import { Account, User } from '../../core/models/bank.models';

@Component({
  selector: 'app-loan-application',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-enter" *ngIf="user">
      <div class="page-header">
        <div>
          <h1>Loan Application</h1>
          <p>Submit your loan application online for fast processing</p>
        </div>
      </div>

      <div class="card" style="max-width: 650px; margin: 0 auto;">
        <div class="card-header"><h3>Apply for a Loan</h3></div>
        <form (ngSubmit)="onSubmit()" autocomplete="off">
          <div class="form-group">
            <label class="form-label">Disbursement Account <span class="text-danger">*</span></label>
            <select class="form-select" name="accountId" [(ngModel)]="accountId" required>
              <option value="" disabled>-- Select Disbursement Account --</option>
              <option *ngFor="let a of accounts" [value]="a.accountId">
                {{ a.accountType }} Account ({{ a.accountId }}) - Balance: {{ formatCurrency(a.balance) }} [{{ a.status }}]
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Loan Type <span class="text-danger">*</span></label>
            <select class="form-select" name="loanType" [(ngModel)]="loanType" (change)="onTypeChange()" required>
              <option value="PERSONAL">Personal Loan (10.5%)</option>
              <option value="HOME">Home Loan (8.5%)</option>
              <option value="VEHICLE">Vehicle Loan (9.0%)</option>
              <option value="EDUCATION">Education Loan (7.5%)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Required Amount (₹) <span class="text-danger">*</span></label>
            <div class="input-group">
              <span class="input-icon"><span class="material-icons-round">currency_rupee</span></span>
              <input type="number" class="form-control" name="amount" [(ngModel)]="amount" (input)="updateEMI()" min="10000" step="5000" required>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Tenure (Months) <span class="text-danger">*</span></label>
            <input type="number" class="form-control" name="tenureMonths" [(ngModel)]="tenureMonths" (input)="updateEMI()" min="6" max="360" required>
          </div>

          <div class="card card-flat p-md mb-lg">
            <div class="flex justify-between items-center">
              <span class="text-muted">Estimated Monthly EMI</span>
              <span class="font-bold text-accent" style="font-size: 1.4rem;">{{ formatCurrency(estimatedEMI) }}</span>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg btn-block" [disabled]="isSubmitting">
            <span class="material-icons-round" [ngClass]="{ 'spin': isSubmitting }">{{ isSubmitting ? 'sync' : 'send' }}</span>
            {{ isSubmitting ? 'Submitting Application...' : 'Submit Loan Application' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoanApplicationComponent implements OnInit {
  user: User | null = null;
  accounts: Account[] = [];

  accountId = '';
  loanType = 'PERSONAL';
  amount = 200000;
  tenureMonths = 24;
  interestRate = 10.5;
  estimatedEMI = 0;
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private utilsService: UtilsService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      // 1. Fetch active accounts for current user
      let userAccounts = this.storeService.getAccountsByUser(this.user.userId).filter(a => a.status === 'ACTIVE');

      // 2. Fallback: include pending/other non-rejected accounts for current user
      if (userAccounts.length === 0) {
        userAccounts = this.storeService.getAccountsByUser(this.user.userId).filter(a => a.status !== 'REJECTED');
      }

      // 3. Fallback for staff/admin testing or users without accounts: include system active accounts
      if (userAccounts.length === 0) {
        userAccounts = this.storeService.getAll<Account>('accounts').filter(a => a.status === 'ACTIVE');
      }

      this.accounts = userAccounts;
      if (this.accounts.length > 0) {
        this.accountId = this.accounts[0].accountId;
      }

      this.route.queryParams.subscribe(params => {
        if (params['type']) {
          this.loanType = params['type'];
          this.onTypeChange();
        }
      });
      this.updateEMI();
    }
  }

  onTypeChange() {
    const rateMap: Record<string, number> = {
      PERSONAL: 10.5,
      HOME: 8.5,
      VEHICLE: 9.0,
      EDUCATION: 7.5
    };
    this.interestRate = rateMap[this.loanType] || 10.5;
    this.updateEMI();
  }

  updateEMI() {
    if (this.amount > 0 && this.tenureMonths > 0) {
      this.estimatedEMI = this.utilsService.calculateEMI(this.amount, this.interestRate, this.tenureMonths);
    }
  }

  formatCurrency(amount: number): string {
    return this.utilsService.formatCurrency(amount);
  }

  async onSubmit() {
    if (!this.user || !this.accountId || !this.amount || !this.tenureMonths) {
      this.toastService.error('Error', 'Please complete all required fields');
      return;
    }

    this.isSubmitting = true;
    await new Promise(r => setTimeout(r, 1000));

    const loanId = this.utilsService.generateLoanId(this.storeService);
    this.storeService.addLoan({
      loanId,
      userId: this.user.userId,
      accountId: this.accountId,
      loanType: this.loanType,
      amount: this.amount,
      interestRate: this.interestRate,
      tenureMonths: this.tenureMonths,
      emiAmount: this.estimatedEMI,
      status: 'WAITING',
      appliedDate: this.utilsService.todayISO()
    });

    this.toastService.success('Loan Applied!', `Application ${loanId} submitted for review.`);
    this.isSubmitting = false;
    this.router.navigate(['/loan-status']);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { StoreService } from '../../core/services/store.service';
import { UtilsService } from '../../core/services/utils.service';
import { ToastService } from '../../core/services/toast.service';
import { Account, User } from '../../core/models/bank.models';

@Component({
  selector: 'app-fund-transfer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-enter" *ngIf="user">
      <div class="page-header">
        <div>
          <h1>Fund Transfer</h1>
          <p>Transfer money between accounts securely</p>
        </div>
      </div>

      <div class="tabs mb-xl">
        <button class="tab" [ngClass]="{ 'active': transferType === 'own' }" (click)="setTransferType('own')">Own Account</button>
        <button class="tab" [ngClass]="{ 'active': transferType === 'same' }" (click)="setTransferType('same')">Same Bank</button>
      </div>

      <div class="transfer-form-container">
        <div class="card">
          <!-- Step 1: Transfer Details -->
          <div *ngIf="step === 1">
            <div class="card-header"><h3>Transfer Details</h3></div>
            <form (ngSubmit)="onReview()" autocomplete="off">
              <div class="form-group">
                <label class="form-label">From Account Number <span class="text-danger">*</span></label>
                <select class="form-select" name="fromAccount" [(ngModel)]="fromAccountId" required>
                  <option *ngFor="let a of accounts" [value]="a.accountId">
                    {{ a.accountType }} - {{ a.accountId }} ({{ formatCurrency(a.availableBalance) }})
                  </option>
                </select>
              </div>

              <div class="transfer-arrow">
                <span class="material-icons-round">south</span>
              </div>

              <div *ngIf="transferType === 'own'" class="form-group">
                <label class="form-label">To Account Number <span class="text-danger">*</span></label>
                <select class="form-select" name="toAccountOwn" [(ngModel)]="toAccountId" required>
                  <option *ngFor="let a of accounts" [value]="a.accountId" [disabled]="a.accountId === fromAccountId">
                    {{ a.accountType }} - {{ a.accountId }} ({{ formatCurrency(a.availableBalance) }})
                  </option>
                </select>
              </div>

              <div *ngIf="transferType === 'same'">
                <div class="form-group">
                  <label class="form-label">Beneficiary Account Number <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" name="toAccountSame" [(ngModel)]="toAccountId" placeholder="e.g. ACCS000002" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Beneficiary Name <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" name="beneficiaryName" [(ngModel)]="beneficiaryName" placeholder="Enter beneficiary name" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Amount (₹) <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-icon"><span class="material-icons-round">currency_rupee</span></span>
                  <input type="number" class="form-control" name="amount" [(ngModel)]="amount" placeholder="Enter amount" min="1" step="0.01" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Remarks / Purpose</label>
                <input type="text" class="form-control" name="remarks" [(ngModel)]="remarks" placeholder="Optional remarks">
              </div>

              <button type="submit" class="btn btn-primary btn-lg btn-block mt-lg">
                <span class="material-icons-round">preview</span> Review Transfer
              </button>
            </form>
          </div>

          <!-- Step 2: Confirmation -->
          <div *ngIf="step === 2">
            <div class="card-header"><h3>Confirm Transfer</h3></div>
            <div class="transfer-summary">
              <div class="info-row"><span class="info-label">From</span><span class="info-value">{{ fromAccountId }}</span></div>
              <div class="info-row"><span class="info-label">To</span><span class="info-value">{{ toAccountId }}</span></div>
              <div class="info-row"><span class="info-label">Beneficiary</span><span class="info-value">{{ displayBeneficiaryName }}</span></div>
              <div class="info-row"><span class="info-label">Amount</span><span class="info-value text-accent font-bold" style="font-size:var(--font-xl)">{{ formatCurrency(amount || 0) }}</span></div>
              <div *ngIf="remarks" class="info-row"><span class="info-label">Remarks</span><span class="info-value">{{ remarks }}</span></div>
              <div class="info-row"><span class="info-label">Transfer Type</span><span class="info-value">{{ transferType === 'own' ? 'Own Account' : 'Same Bank' }}</span></div>
            </div>

            <div class="flex gap-md mt-xl">
              <button class="btn btn-secondary" (click)="step = 1">
                <span class="material-icons-round">arrow_back</span> Back
              </button>
              <button class="btn btn-success btn-lg flex-1" (click)="confirmTransfer()" [disabled]="isSubmitting">
                <span class="material-icons-round" [ngClass]="{ 'spin': isSubmitting }">{{ isSubmitting ? 'sync' : 'check_circle' }}</span>
                {{ isSubmitting ? 'Processing...' : 'Confirm & Transfer' }}
              </button>
            </div>
          </div>

          <!-- Step 3: Success -->
          <div *ngIf="step === 3">
            <div class="text-center p-xl">
              <div class="card-icon success" style="width:80px;height:80px;border-radius:50%;margin:0 auto var(--space-lg)">
                <span class="material-icons-round" style="font-size:40px">check_circle</span>
              </div>
              <h2 class="mb-md">Transfer Successful!</h2>
              <div class="card card-flat p-lg" style="max-width:400px;margin:0 auto">
                <div class="info-row"><span class="info-label">Transaction ID</span><span class="info-value font-semibold">{{ lastTxnId }}</span></div>
                <div class="info-row"><span class="info-label">Amount</span><span class="info-value text-success font-bold">{{ formatCurrency(amount || 0) }}</span></div>
                <div class="info-row"><span class="info-label">Date</span><span class="info-value">{{ formatDate(todayISO) }}</span></div>
                <div class="info-row"><span class="info-label">Status</span><span class="info-value"><span class="badge badge-success">COMPLETED</span></span></div>
              </div>
              <div class="flex gap-md justify-center mt-xl">
                <button class="btn btn-primary" (click)="resetForm()">
                  <span class="material-icons-round">add</span> New Transfer
                </button>
                <button class="btn btn-secondary" routerLink="/statement">
                  <span class="material-icons-round">receipt_long</span> View Statement
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FundTransferComponent implements OnInit {
  user: User | null = null;
  accounts: Account[] = [];

  transferType: 'own' | 'same' = 'own';
  step = 1;
  isSubmitting = false;

  fromAccountId = '';
  toAccountId = '';
  beneficiaryName = '';
  amount: number | null = null;
  remarks = '';

  displayBeneficiaryName = '';
  lastTxnId = '';
  todayISO = '';

  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private utilsService: UtilsService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.accounts = this.storeService.getAccountsByUser(this.user.userId).filter(a => a.status === 'ACTIVE');
      if (this.accounts.length > 0) {
        this.fromAccountId = this.accounts[0].accountId;
        if (this.accounts.length > 1) {
          this.toAccountId = this.accounts[1].accountId;
        }
      }
    }
  }

  setTransferType(type: 'own' | 'same') {
    this.transferType = type;
    this.toAccountId = '';
    if (type === 'own' && this.accounts.length > 1) {
      this.toAccountId = this.accounts.find(a => a.accountId !== this.fromAccountId)?.accountId || '';
    }
  }

  onReview() {
    if (!this.fromAccountId || !this.toAccountId || !this.amount || this.amount <= 0) {
      this.toastService.error('Error', 'Please fill all required transfer details');
      return;
    }

    const fromAcc = this.storeService.getAccountById(this.fromAccountId);
    if (!fromAcc) {
      this.toastService.error('Error', 'Source account not found');
      return;
    }

    if (this.fromAccountId === this.toAccountId) {
      this.toastService.error('Error', 'Cannot transfer to the same account');
      return;
    }

    if (this.amount > fromAcc.availableBalance) {
      this.toastService.error('Insufficient Balance', `Available: ${this.formatCurrency(fromAcc.availableBalance)}`);
      return;
    }

    if (this.transferType === 'same') {
      const toAcc = this.storeService.getAccountById(this.toAccountId);
      if (!toAcc) {
        this.toastService.error('Error', 'Beneficiary account not found in our bank');
        return;
      }
      this.displayBeneficiaryName = this.beneficiaryName || 'Beneficiary';
    } else {
      const toAcc = this.storeService.getAccountById(this.toAccountId);
      if (toAcc) {
        const u = this.storeService.getUserById(toAcc.userId);
        this.displayBeneficiaryName = u ? `${u.firstName} ${u.lastName}` : 'Self';
      }
    }

    this.step = 2;
  }

  async confirmTransfer() {
    if (!this.amount || !this.user) return;
    this.isSubmitting = true;
    await new Promise(r => setTimeout(r, 1200));

    const fromAcc = this.storeService.getAccountById(this.fromAccountId);
    const toAcc = this.storeService.getAccountById(this.toAccountId);
    if (!fromAcc) return;

    const txnId = this.utilsService.generateTransactionId(this.storeService);
    this.lastTxnId = txnId;
    this.todayISO = this.utilsService.todayISO();

    // Debit source
    this.storeService.updateAccount(this.fromAccountId, {
      balance: fromAcc.balance - this.amount,
      availableBalance: fromAcc.availableBalance - this.amount
    });

    this.storeService.addTransaction({
      transactionId: txnId,
      accountId: this.fromAccountId,
      transactionType: 'DEBIT',
      category: this.transferType === 'own' ? 'OWN_TRANSFER' : 'SAME_BANK_TRANSFER',
      amount: this.amount,
      balance: fromAcc.balance - this.amount,
      description: `Transfer to ${this.toAccountId} ${this.remarks ? '- ' + this.remarks : ''}`,
      referenceId: 'REF' + Date.now(),
      date: this.todayISO,
      time: new Date().toTimeString().slice(0, 8),
      status: 'COMPLETED',
      toAccount: this.toAccountId,
      fromAccount: this.fromAccountId
    });

    // Credit destination
    if (toAcc) {
      this.storeService.updateAccount(this.toAccountId, {
        balance: toAcc.balance + this.amount,
        availableBalance: toAcc.availableBalance + this.amount
      });
      const txnId2 = this.utilsService.generateTransactionId(this.storeService);
      this.storeService.addTransaction({
        transactionId: txnId2,
        accountId: this.toAccountId,
        transactionType: 'CREDIT',
        category: this.transferType === 'own' ? 'OWN_TRANSFER' : 'SAME_BANK_TRANSFER',
        amount: this.amount,
        balance: toAcc.balance + this.amount,
        description: `Received from ${this.fromAccountId} ${this.remarks ? '- ' + this.remarks : ''}`,
        referenceId: 'REF' + Date.now(),
        date: this.todayISO,
        time: new Date().toTimeString().slice(0, 8),
        status: 'COMPLETED',
        toAccount: this.toAccountId,
        fromAccount: this.fromAccountId
      });
    }

    this.isSubmitting = false;
    this.step = 3;
    this.toastService.success('Transfer Complete!', `₹${this.amount.toLocaleString()} transferred successfully`);
  }

  resetForm() {
    this.step = 1;
    this.amount = null;
    this.remarks = '';
    this.beneficiaryName = '';
  }

  formatCurrency(amount: number): string {
    return this.utilsService.formatCurrency(amount);
  }

  formatDate(dateStr: string): string {
    return this.utilsService.formatDate(dateStr);
  }
}

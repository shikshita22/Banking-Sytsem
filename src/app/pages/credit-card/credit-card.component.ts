import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { StoreService } from '../../core/services/store.service';
import { UtilsService } from '../../core/services/utils.service';
import { ToastService } from '../../core/services/toast.service';
import { ModalService } from '../../core/services/modal.service';
import { Card, User } from '../../core/models/bank.models';

@Component({
  selector: 'app-credit-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-enter" *ngIf="user">
      <div class="page-header">
        <div>
          <h1>Credit Cards</h1>
          <p>View statements, pay bills, and manage credit card limits</p>
        </div>
      </div>

      <div *ngIf="creditCards.length === 0" class="card">
        <div class="empty-state">
          <span class="material-icons-round">credit_score</span>
          <h3>No Credit Cards Found</h3>
          <p>You don't have any credit cards issued yet.</p>
        </div>
      </div>

      <div class="grid grid-2 gap-lg mb-xl">
        <div *ngFor="let c of creditCards">
          <!-- Credit Card Visual -->
          <div class="bank-card credit-card mb-md" [ngClass]="{ 'blocked': c.isBlocked }">
            <div class="card-chip"></div>
            <div class="card-number">{{ maskCardNumber(c.cardNumber) }}</div>
            <div class="flex justify-between items-end">
              <div>
                <div class="card-holder-label">CARD HOLDER</div>
                <div class="card-holder-name">{{ user.firstName }} {{ user.lastName }}</div>
              </div>
              <div>
                <div class="card-holder-label">EXPIRES</div>
                <div class="card-expiry">{{ c.expiryDate }}</div>
              </div>
            </div>
          </div>

          <!-- Credit Card Details & Actions -->
          <div class="card p-md">
            <div class="flex justify-between items-center mb-md">
              <h4 class="mb-0">Credit Overview</h4>
              <span class="badge" [ngClass]="c.isBlocked ? 'badge-error' : 'badge-success'">{{ c.isBlocked ? 'BLOCKED' : 'ACTIVE' }}</span>
            </div>

            <div class="info-row"><span class="info-label">Credit Limit</span><span class="info-value font-semibold">{{ formatCurrency(c.creditLimit) }}</span></div>
            <div class="info-row"><span class="info-label">Outstanding Balance</span><span class="info-value text-error font-semibold">{{ formatCurrency(c.outstandingBalance) }}</span></div>
            <div class="info-row"><span class="info-label">Minimum Due</span><span class="info-value text-warning font-semibold">{{ formatCurrency(c.minimumDue) }}</span></div>
            <div class="info-row"><span class="info-label">Due Date</span><span class="info-value">{{ formatDate(c.dueDate) }}</span></div>

            <div class="flex gap-sm mt-md flex-wrap">
              <button *ngIf="c.outstandingBalance > 0" class="btn btn-primary btn-sm" (click)="payBill(c)">
                <span class="material-icons-round">payment</span> Pay Bill
              </button>
              <button class="btn btn-outline btn-sm" (click)="toggleBlock(c)">
                <span class="material-icons-round">{{ c.isBlocked ? 'lock_open' : 'block' }}</span> {{ c.isBlocked ? 'Unblock' : 'Block' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CreditCardComponent implements OnInit {
  user: User | null = null;
  creditCards: Card[] = [];

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
      this.creditCards = this.storeService.getCardsByUser(this.user.userId).filter(c => c.cardType === 'CREDIT');
    }
  }

  maskCardNumber(num: string): string {
    return this.utilsService.maskCardNumber(num);
  }

  formatCurrency(amount: number): string {
    return this.utilsService.formatCurrency(amount);
  }

  formatDate(dateStr: string): string {
    return this.utilsService.formatDate(dateStr);
  }

  payBill(card: Card) {
    this.modalService.confirm('Pay Credit Card Bill', `Pay outstanding bill of ${this.formatCurrency(card.outstandingBalance)} for card ending in ${card.cardNumber.slice(-4)}?`, () => {
      this.storeService.updateCard(card.cardId, { outstandingBalance: 0, minimumDue: 0 });
      this.toastService.success('Bill Paid', 'Credit card bill payment was successful!');
      if (this.user) {
        this.creditCards = this.storeService.getCardsByUser(this.user.userId).filter(c => c.cardType === 'CREDIT');
      }
    });
  }

  toggleBlock(card: Card) {
    const action = card.isBlocked ? 'Unblock' : 'Block';
    this.modalService.confirm(`${action} Credit Card`, `Are you sure you want to ${action.toLowerCase()} card ending in ${card.cardNumber.slice(-4)}?`, () => {
      this.storeService.updateCard(card.cardId, { isBlocked: !card.isBlocked });
      this.toastService.success(`Card ${action}ed`, `Credit card has been ${action.toLowerCase()}ed.`);
      if (this.user) {
        this.creditCards = this.storeService.getCardsByUser(this.user.userId).filter(c => c.cardType === 'CREDIT');
      }
    });
  }
}

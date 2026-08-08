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
  selector: 'app-debit-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-enter" *ngIf="user">
      <div class="page-header">
        <div>
          <h1>Debit Cards</h1>
          <p>Manage your active debit cards, PINs, and transaction limits</p>
        </div>
      </div>

      <div *ngIf="debitCards.length === 0" class="card">
        <div class="empty-state">
          <span class="material-icons-round">credit_card</span>
          <h3>No Debit Cards Found</h3>
          <p>You don't have any debit cards issued yet.</p>
        </div>
      </div>

      <div class="grid grid-2 gap-lg mb-xl">
        <div *ngFor="let c of debitCards">
          <!-- Card visual -->
          <div class="bank-card debit-card mb-md" [ngClass]="{ 'blocked': c.isBlocked }">
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

          <!-- Card Controls -->
          <div class="card p-md">
            <div class="flex justify-between items-center mb-md">
              <h4 class="mb-0">Card Controls</h4>
              <span class="badge" [ngClass]="c.isBlocked ? 'badge-error' : 'badge-success'">{{ c.isBlocked ? 'BLOCKED' : 'ACTIVE' }}</span>
            </div>

            <div class="info-row"><span class="info-label">Daily Limit</span><span class="info-value font-semibold">{{ formatCurrency(c.dailyLimit) }}</span></div>
            <div class="info-row"><span class="info-label">ATM Transactions</span><span class="info-value">{{ c.atmEnabled ? 'Enabled' : 'Disabled' }}</span></div>
            <div class="info-row"><span class="info-label">Online Payments</span><span class="info-value">{{ c.onlineEnabled ? 'Enabled' : 'Disabled' }}</span></div>

            <div class="flex gap-sm mt-md flex-wrap">
              <button class="btn btn-outline btn-sm" (click)="toggleBlock(c)">
                <span class="material-icons-round">{{ c.isBlocked ? 'lock_open' : 'block' }}</span> {{ c.isBlocked ? 'Unblock Card' : 'Block Card' }}
              </button>
              <button class="btn btn-outline btn-sm" (click)="changePIN(c)">
                <span class="material-icons-round">pin</span> Change PIN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DebitCardComponent implements OnInit {
  user: User | null = null;
  debitCards: Card[] = [];

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
      this.debitCards = this.storeService.getCardsByUser(this.user.userId).filter(c => c.cardType === 'DEBIT');
    }
  }

  maskCardNumber(num: string): string {
    return this.utilsService.maskCardNumber(num);
  }

  formatCurrency(amount: number): string {
    return this.utilsService.formatCurrency(amount);
  }

  toggleBlock(card: Card) {
    const action = card.isBlocked ? 'Unblock' : 'Block';
    this.modalService.confirm(`${action} Card`, `Are you sure you want to ${action.toLowerCase()} card ending in ${card.cardNumber.slice(-4)}?`, () => {
      this.storeService.updateCard(card.cardId, { isBlocked: !card.isBlocked });
      this.toastService.success(`Card ${action}ed`, `Debit card has been ${action.toLowerCase()}ed.`);
      if (this.user) {
        this.debitCards = this.storeService.getCardsByUser(this.user.userId).filter(c => c.cardType === 'DEBIT');
      }
    });
  }

  changePIN(card: Card) {
    this.modalService.alert('Change PIN', 'An OTP has been sent to your registered mobile number for PIN generation.');
  }
}

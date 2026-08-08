import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { StoreService } from '../../core/services/store.service';
import { UtilsService } from '../../core/services/utils.service';
import { ToastService } from '../../core/services/toast.service';
import { ModalService } from '../../core/services/modal.service';
import { Account, Card, User } from '../../core/models/bank.models';

@Component({
  selector: 'app-customer-mgmt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-enter" *ngIf="user">
      <div class="page-header">
        <div>
          <h1>Customer Management & Lookup</h1>
          <p>Search, inspect customer profiles, manage account status, and control cards</p>
        </div>
      </div>

      <div class="card mb-lg">
        <div class="filter-bar">
          <div class="form-group" style="margin-bottom:0;flex:1">
            <input type="text" class="form-input" name="search" [(ngModel)]="searchQuery" (input)="filterCustomers()" placeholder="Search by name, email, phone, or User ID...">
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Customers Directory ({{ filteredCustomers.length }})</h3>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filteredCustomers.length === 0">
                <td colspan="7" class="text-center p-xl">
                  <div class="empty-state">
                    <span class="material-icons-round">people</span>
                    <h3>No customers found</h3>
                  </div>
                </td>
              </tr>
              <tr *ngFor="let c of filteredCustomers">
                <td class="font-mono text-sm font-semibold">{{ c.userId }}</td>
                <td class="font-semibold">{{ c.firstName }} {{ c.lastName }}</td>
                <td>{{ c.email }}</td>
                <td>{{ c.phone }}</td>
                <td><span class="badge" [ngClass]="'badge-' + getStatusBadgeClass(c.status)">{{ c.status }}</span></td>
                <td>{{ formatDate(c.createdAt) }}</td>
                <td>
                  <div style="display:flex; gap:6px;">
                    <!-- Inspect Profile (All Staff/CSR/Manager/Admin) -->
                    <button class="btn btn-outline btn-xs" (click)="viewCustomerDetails(c)" title="View Customer Details">
                      <span class="material-icons-round text-xs">visibility</span> Details
                    </button>

                    <!-- Card Ops (CSR, Manager, Admin per CardAdminController) -->
                    <button *ngIf="canManageCards" class="btn btn-secondary btn-xs" (click)="manageCustomerCards(c)" title="Manage Customer Cards">
                      <span class="material-icons-round text-xs">credit_card</span> Cards
                    </button>

                    <!-- Freeze / Activate (Admin & Manager per StaffController @PreAuthorize) -->
                    <button *ngIf="canManageStatus" class="btn btn-xs" [ngClass]="c.status === 'ACTIVE' ? 'btn-danger' : 'btn-success'" (click)="toggleUserStatus(c)" title="Update Account Status">
                      <span class="material-icons-round text-xs">{{ c.status === 'ACTIVE' ? 'block' : 'check_circle' }}</span>
                      {{ c.status === 'ACTIVE' ? 'Freeze' : 'Activate' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Customer Detail Modal -->
      <div *ngIf="selectedCustomer" class="modal-backdrop fade-in" (click)="closeCustomerDetails()">
        <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 600px;">
          <div class="modal-header">
            <h3>Customer Profile — {{ selectedCustomer.firstName }} {{ selectedCustomer.lastName }} ({{ selectedCustomer.userId }})</h3>
            <button type="button" class="btn-icon" (click)="closeCustomerDetails()"><span class="material-icons-round">close</span></button>
          </div>
          <div class="modal-body">
            <div class="grid grid-2 gap-md mb-md">
              <div><strong>Email:</strong> {{ selectedCustomer.email }}</div>
              <div><strong>Phone:</strong> {{ selectedCustomer.phone }}</div>
              <div><strong>DOB:</strong> {{ formatDate(selectedCustomer.dateOfBirth) }}</div>
              <div><strong>Status:</strong> <span class="badge" [ngClass]="'badge-' + getStatusBadgeClass(selectedCustomer.status)">{{ selectedCustomer.status }}</span></div>
              <div><strong>PAN:</strong> {{ selectedCustomer.pan || 'N/A' }}</div>
              <div><strong>Aadhaar:</strong> {{ selectedCustomer.aadhaar || 'N/A' }}</div>
            </div>
            <div class="mb-md">
              <strong>Address:</strong> {{ selectedCustomer.address }}
            </div>

            <h4 class="font-semibold mb-xs">Linked Accounts ({{ selectedCustomerAccounts.length }})</h4>
            <div *ngFor="let acc of selectedCustomerAccounts" class="card p-sm mb-xs bg-surface" style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <span class="font-mono font-semibold">{{ acc.accountId }}</span> ({{ acc.accountType }})
                <div class="text-xs text-muted">IFSC: {{ acc.ifsc }} · {{ acc.branch }}</div>
              </div>
              <div class="font-semibold text-accent">{{ formatCurrency(acc.balance) }}</div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeCustomerDetails()">Close</button>
          </div>
        </div>
      </div>

      <!-- Customer Cards Modal for CSR / Admin / Manager -->
      <div *ngIf="selectedCustomerCards" class="modal-backdrop fade-in" (click)="closeCardsModal()">
        <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 650px;">
          <div class="modal-header">
            <h3>Card Operations — {{ targetCardCustomer?.firstName }} {{ targetCardCustomer?.lastName }}</h3>
            <button type="button" class="btn-icon" (click)="closeCardsModal()"><span class="material-icons-round">close</span></button>
          </div>
          <div class="modal-body">
            <div *ngIf="selectedCustomerCards.length === 0" class="empty-state p-md">
              <span class="material-icons-round">credit_card_off</span>
              <h4>No cards issued for this customer</h4>
            </div>
            <div *ngFor="let card of selectedCustomerCards" class="card p-md mb-sm" style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div class="font-mono font-semibold text-sm">{{ formatCardNumber(card.cardNumber) }}</div>
                <div class="text-xs text-muted">{{ card.cardType }} · Exp: {{ card.expiryDate }} · Account: {{ card.accountId }}</div>
                <div class="text-xs mt-xs">Status: <span class="badge" [ngClass]="'badge-' + getStatusBadgeClass(getCardStatus(card))">{{ getCardStatus(card) }}</span></div>
              </div>
              <div>
                <button class="btn btn-xs" [ngClass]="!card.isBlocked ? 'btn-danger' : 'btn-success'" (click)="toggleCardBlock(card)">
                  {{ !card.isBlocked ? 'Block Card' : 'Unblock Card' }}
                </button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeCardsModal()">Close</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CustomerMgmtComponent implements OnInit {
  user: User | null = null;
  customers: User[] = [];
  filteredCustomers: User[] = [];
  searchQuery = '';

  canManageStatus = false;
  canManageCards = false;

  selectedCustomer: User | null = null;
  selectedCustomerAccounts: Account[] = [];

  selectedCustomerCards: Card[] | null = null;
  targetCardCustomer: User | null = null;

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
      this.canManageStatus = this.authService.isAdmin() || this.authService.isManager();
      this.canManageCards = this.authService.isCsr() || this.authService.isManager() || this.authService.isAdmin();
      this.loadCustomers();
    }
  }

  loadCustomers() {
    this.customers = this.storeService.getAll<User>('users').filter(u => u.role === 'CUSTOMER');
    this.filterCustomers();
  }

  filterCustomers() {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredCustomers = [...this.customers];
      return;
    }
    this.filteredCustomers = this.customers.filter(c =>
      c.userId.toLowerCase().includes(q) ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  }

  formatDate(dateStr: string): string {
    return this.utilsService.formatDate(dateStr);
  }

  formatCurrency(amount: number): string {
    return this.utilsService.formatCurrency(amount);
  }

  formatCardNumber(num: string): string {
    return this.utilsService.formatCardNumber(num);
  }

  getStatusBadgeClass(status: string): string {
    return this.utilsService.getStatusBadgeClass(status);
  }

  getCardStatus(card: Card): string {
    return card.isBlocked ? 'BLOCKED' : 'ACTIVE';
  }

  viewCustomerDetails(cust: User) {
    this.selectedCustomer = cust;
    this.selectedCustomerAccounts = this.storeService.getAccountsByUser(cust.userId);
  }

  closeCustomerDetails() {
    this.selectedCustomer = null;
    this.selectedCustomerAccounts = [];
  }

  manageCustomerCards(cust: User) {
    this.targetCardCustomer = cust;
    const cards = this.storeService.getAll<Card>('cards');
    this.selectedCustomerCards = cards.filter(c => c.userId === cust.userId);
  }

  closeCardsModal() {
    this.selectedCustomerCards = null;
    this.targetCardCustomer = null;
  }

  toggleCardBlock(card: Card) {
    const isCurrentlyBlocked = card.isBlocked;
    const newBlockedState = !isCurrentlyBlocked;
    const actionLabel = newBlockedState ? 'BLOCKED' : 'ACTIVE';

    this.modalService.confirm('Card Status Change', `Are you sure you want to change status of card ${this.formatCardNumber(card.cardNumber)} to ${actionLabel}?`, () => {
      this.storeService.updateCard(card.cardId || card.cardNumber, { isBlocked: newBlockedState });

      this.storeService.addAuditLog({
        id: this.utilsService.generateAuditId(this.storeService),
        userId: this.user?.userId || 'SYSTEM',
        action: newBlockedState ? 'CARD_BLOCKED' : 'CARD_UNBLOCKED',
        target: card.cardNumber,
        details: `${newBlockedState ? 'Blocked' : 'Unblocked'} card for customer ${card.userId}`,
        timestamp: this.utilsService.nowISO()
      });

      this.toastService.success('Card Updated', `Card is now ${actionLabel}`);
      if (this.targetCardCustomer) {
        this.manageCustomerCards(this.targetCardCustomer);
      }
    });
  }

  toggleUserStatus(cust: User) {
    const newStatus = cust.status === 'ACTIVE' ? 'FROZEN' : 'ACTIVE';
    this.modalService.confirm('Change Customer Status', `Are you sure you want to change status of ${cust.firstName} ${cust.lastName} to ${newStatus}?`, () => {
      this.storeService.updateUser(cust.userId, { status: newStatus });

      this.storeService.addAuditLog({
        id: this.utilsService.generateAuditId(this.storeService),
        userId: this.user?.userId || 'SYSTEM',
        action: newStatus === 'FROZEN' ? 'USER_FROZEN' : 'USER_ACTIVATED',
        target: cust.userId,
        details: `Customer ${cust.userId} status updated to ${newStatus}`,
        timestamp: this.utilsService.nowISO()
      });

      this.toastService.success('Status Updated', `User ${cust.userId} is now ${newStatus}`);
      this.loadCustomers();
    });
  }
}


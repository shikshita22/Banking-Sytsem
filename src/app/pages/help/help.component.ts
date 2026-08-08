import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { StoreService } from '../../core/services/store.service';
import { UtilsService } from '../../core/services/utils.service';
import { ToastService } from '../../core/services/toast.service';
import { ModalService } from '../../core/services/modal.service';
import { Complaint, User } from '../../core/models/bank.models';

@Component({
  selector: 'app-help-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1>{{ isStaffRole ? 'Customer Support & Complaint Resolution' : 'Help & Support Center' }}</h1>
          <p>{{ isStaffRole ? 'Review, assign, and resolve customer support tickets and complaints' : 'Find answers to common questions or reach out to our 24/7 support team' }}</p>
        </div>
      </div>

      <!-- Customer View -->
      <ng-container *ngIf="!isStaffRole">
        <div class="grid grid-2 gap-lg mb-xl">
          <!-- FAQ Accordion -->
          <div class="card">
            <div class="card-header"><h3>Frequently Asked Questions</h3></div>
            <div class="faq-list">
              <div *ngFor="let faq of faqs; let i = index" class="card card-flat p-md mb-sm" (click)="toggleFaq(i)" style="cursor:pointer">
                <div class="flex justify-between items-center">
                  <h4 class="text-sm font-semibold mb-0">{{ faq.q }}</h4>
                  <span class="material-icons-round text-muted">{{ openFaqIndex === i ? 'expand_less' : 'expand_more' }}</span>
                </div>
                <p *ngIf="openFaqIndex === i" class="text-sm text-secondary mt-sm mb-0 fade-up">{{ faq.a }}</p>
              </div>
            </div>
          </div>

          <!-- Contact Support Form -->
          <div class="card">
            <div class="card-header"><h3>Submit a Complaint</h3></div>
            <form (ngSubmit)="onSubmitTicket()">
              <div class="form-group">
                <label class="form-label">Complaint Type</label>
                <select class="form-select" name="category" [(ngModel)]="complaintType" required>
                  <option value="ACCOUNT">Account Services</option>
                  <option value="CARDS">Cards & ATM</option>
                  <option value="TRANSFERS">Fund Transfer</option>
                  <option value="LOANS">Loan Dispute</option>
                  <option value="SECURITY">Security / Login</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Short Description</label>
                <input type="text" class="form-control" name="summary" [(ngModel)]="complaintSummary" placeholder="Briefly describe your complaint" required>
              </div>
              <div class="form-group">
                <label class="form-label">Additional Details</label>
                <textarea class="form-control" name="details" [(ngModel)]="complaintDescription" rows="4" placeholder="Add any extra information or references" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-block">
                <span class="material-icons-round">send</span> Submit Complaint
              </button>
            </form>
          </div>
        </div>

        <!-- Customer Complaints History -->
        <div class="card">
          <div class="card-header">
            <h3>My Support Complaints ({{ myComplaints.length }})</h3>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Category</th>
                  <th>Subject</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th>Resolution</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="myComplaints.length === 0">
                  <td colspan="6" class="text-center p-md text-muted">No complaints logged yet.</td>
                </tr>
                <tr *ngFor="let c of myComplaints">
                  <td class="font-mono text-sm font-semibold">{{ c.complaintId }}</td>
                  <td><span class="badge badge-outline">{{ c.category }}</span></td>
                  <td class="font-semibold">{{ c.subject }}</td>
                  <td>{{ formatDate(c.createdAt) }}</td>
                  <td><span class="badge" [ngClass]="'badge-' + getStatusBadgeClass(c.status)">{{ c.status }}</span></td>
                  <td class="text-sm text-secondary">{{ c.resolution || 'Pending review by support team' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>

      <!-- Staff / CSR / Manager / Admin View -->
      <ng-container *ngIf="isStaffRole">
        <div class="card mb-xl">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <h3>Support Tickets Queue ({{ filteredStaffComplaints.length }})</h3>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-xs" [ngClass]="complaintFilter === 'ALL' ? 'btn-primary' : 'btn-outline'" (click)="setFilter('ALL')">All</button>
              <button class="btn btn-xs" [ngClass]="complaintFilter === 'OPEN' ? 'btn-primary' : 'btn-outline'" (click)="setFilter('OPEN')">Open</button>
              <button class="btn btn-xs" [ngClass]="complaintFilter === 'RESOLVED' ? 'btn-primary' : 'btn-outline'" (click)="setFilter('RESOLVED')">Resolved</button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Customer</th>
                  <th>Category</th>
                  <th>Subject</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="filteredStaffComplaints.length === 0">
                  <td colspan="8" class="text-center p-xl">
                    <div class="empty-state">
                      <span class="material-icons-round">check_circle</span>
                      <h3>No complaints in queue</h3>
                    </div>
                  </td>
                </tr>
                <tr *ngFor="let c of filteredStaffComplaints">
                  <td class="font-mono text-sm font-semibold">{{ c.complaintId }}</td>
                  <td class="font-mono text-sm">
                    <div>{{ getUserName(c.userId) }}</div>
                    <small class="text-muted">{{ c.userId }}</small>
                  </td>
                  <td><span class="badge badge-info">{{ c.category }}</span></td>
                  <td class="font-semibold">{{ c.subject }}</td>
                  <td class="text-sm" style="max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{{ c.description }}</td>
                  <td>{{ formatDate(c.createdAt) }}</td>
                  <td><span class="badge" [ngClass]="'badge-' + getStatusBadgeClass(c.status)">{{ c.status }}</span></td>
                  <td>
                    <button *ngIf="c.status === 'OPEN'" class="btn btn-primary btn-xs" (click)="openResolveModal(c)">
                      <span class="material-icons-round text-xs">done</span> Resolve
                    </button>
                    <span *ngIf="c.status === 'RESOLVED'" class="text-xs text-success">Resolved</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>

      <!-- Resolution Modal -->
      <div *ngIf="activeResolveComplaint" class="modal-backdrop fade-in" (click)="closeResolveModal()">
        <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 550px;">
          <div class="modal-header">
            <h3>Resolve Support Ticket — {{ activeResolveComplaint.complaintId }}</h3>
            <button type="button" class="btn-icon" (click)="closeResolveModal()"><span class="material-icons-round">close</span></button>
          </div>
          <div class="modal-body">
            <div class="mb-sm"><strong>Customer:</strong> {{ getUserName(activeResolveComplaint.userId) }} ({{ activeResolveComplaint.userId }})</div>
            <div class="mb-sm"><strong>Subject:</strong> {{ activeResolveComplaint.subject }}</div>
            <div class="mb-md p-sm bg-surface rounded text-sm"><strong>Description:</strong> {{ activeResolveComplaint.description }}</div>

            <div class="form-group">
              <label class="form-label">Official Resolution Remarks <span class="text-danger">*</span></label>
              <textarea class="form-control" name="remarks" [(ngModel)]="resolutionRemarks" rows="4" placeholder="Enter resolution details provided to the customer..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeResolveModal()">Cancel</button>
            <button class="btn btn-success" (click)="submitResolution()">Submit Resolution</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HelpSupportComponent implements OnInit {
  user: User | null = null;
  isStaffRole = false;

  openFaqIndex: number | null = 0;
  complaintType = 'ACCOUNT';
  complaintSummary = '';
  complaintDescription = '';

  myComplaints: Complaint[] = [];
  allStaffComplaints: Complaint[] = [];
  filteredStaffComplaints: Complaint[] = [];
  complaintFilter = 'ALL';

  activeResolveComplaint: Complaint | null = null;
  resolutionRemarks = '';

  faqs = [
    { q: 'How do I reset my NetBanking password?', a: 'Click on "Forgot Password?" on the login page or use the Security section under My Profile after logging in.' },
    { q: 'What is the daily fund transfer limit?', a: 'Standard daily online transfer limit is ₹5,00,000 for Savings accounts and ₹25,00,000 for Current accounts.' },
    { q: 'How can I block a lost debit or credit card?', a: 'Navigate to Debit Cards or Credit Cards in the sidebar menu and click "Block Card" for instant blocking.' },
    { q: 'When will my loan application be approved?', a: 'Loan applications are reviewed by staff within 24-48 business hours. You can track progress under Loan Status.' }
  ];

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
      this.isStaffRole = this.authService.isCsr() || this.authService.isStaff() || this.authService.isManager() || this.authService.isAdmin();
      this.loadComplaints();
    }
  }

  loadComplaints() {
    if (this.isStaffRole) {
      this.allStaffComplaints = this.storeService.getAll<Complaint>('complaints');
      this.setFilter(this.complaintFilter);
    } else if (this.user) {
      const complaints = this.storeService.getAll<Complaint>('complaints');
      this.myComplaints = complaints.filter(c => c.userId === this.user?.userId);
    }
  }

  setFilter(filter: string) {
    this.complaintFilter = filter;
    if (filter === 'ALL') {
      this.filteredStaffComplaints = [...this.allStaffComplaints];
    } else {
      this.filteredStaffComplaints = this.allStaffComplaints.filter(c => c.status === filter);
    }
  }

  getUserName(userId: string): string {
    const u = this.storeService.getUserById(userId);
    return u ? `${u.firstName} ${u.lastName}` : userId;
  }

  formatDate(dateStr: string): string {
    return this.utilsService.formatDate(dateStr);
  }

  getStatusBadgeClass(status: string): string {
    return this.utilsService.getStatusBadgeClass(status);
  }

  toggleFaq(index: number) {
    this.openFaqIndex = this.openFaqIndex === index ? null : index;
  }

  onSubmitTicket() {
    if (!this.complaintType || !this.complaintSummary || !this.complaintDescription) {
      this.toastService.error('Error', 'Please select a complaint type and add a short description');
      return;
    }
    if (!this.user) return;

    const complaintId = 'COMP' + Math.floor(1000 + Math.random() * 9000);
    const newComplaint: Complaint = {
      complaintId,
      userId: this.user.userId,
      category: this.complaintType,
      subject: this.complaintSummary.trim(),
      description: this.complaintDescription.trim(),
      status: 'OPEN',
      createdAt: this.utilsService.todayISO(),
      updatedAt: this.utilsService.todayISO()
    };

    this.storeService.addComplaint(newComplaint);

    this.storeService.addAuditLog({
      id: this.utilsService.generateAuditId(this.storeService),
      userId: this.user.userId,
      action: 'COMPLAINT_CREATED',
      target: complaintId,
      details: `Customer submitted support complaint: ${newComplaint.subject}`,
      timestamp: this.utilsService.nowISO()
    });

    this.toastService.success('Complaint Registered', `Complaint ${complaintId} submitted. Our support team will review it.`);
    this.complaintType = 'ACCOUNT';
    this.complaintSummary = '';
    this.complaintDescription = '';
    this.loadComplaints();
  }

  openResolveModal(c: Complaint) {
    this.activeResolveComplaint = c;
    this.resolutionRemarks = '';
  }

  closeResolveModal() {
    this.activeResolveComplaint = null;
    this.resolutionRemarks = '';
  }

  submitResolution() {
    if (!this.activeResolveComplaint || !this.resolutionRemarks.trim()) {
      this.toastService.error('Error', 'Please enter official resolution remarks');
      return;
    }

    const complaint = this.activeResolveComplaint;
    this.storeService.updateComplaint(complaint.complaintId, {
      status: 'RESOLVED',
      resolution: this.resolutionRemarks.trim(),
      updatedAt: this.utilsService.todayISO()
    });

    // Notify customer
    this.storeService.addNotification({
      id: 'N' + Date.now(),
      userId: complaint.userId,
      title: 'Complaint Resolved',
      message: `Your ticket (${complaint.complaintId}) has been resolved: "${this.resolutionRemarks.trim()}"`,
      type: 'info',
      timestamp: this.utilsService.nowISO(),
      read: false
    });

    // Audit log
    this.storeService.addAuditLog({
      id: this.utilsService.generateAuditId(this.storeService),
      userId: this.user?.userId || 'STAFF',
      action: 'COMPLAINT_RESOLVED',
      target: complaint.complaintId,
      details: `Ticket ${complaint.complaintId} resolved by ${this.user?.firstName} ${this.user?.lastName}`,
      timestamp: this.utilsService.nowISO()
    });

    this.toastService.success('Resolved!', `Complaint ${complaint.complaintId} marked as RESOLVED.`);
    this.closeResolveModal();
    this.loadComplaints();
  }
}


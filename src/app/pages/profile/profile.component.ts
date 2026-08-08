import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { StoreService } from '../../core/services/store.service';
import { UtilsService } from '../../core/services/utils.service';
import { ToastService } from '../../core/services/toast.service';
import { ModalService } from '../../core/services/modal.service';
import { User } from '../../core/models/bank.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-enter" *ngIf="user">
      <div class="page-header">
        <div>
          <h1>My Profile</h1>
          <p>View and manage your personal details</p>
        </div>
      </div>

      <div class="profile-header">
        <div class="profile-avatar">{{ initials }}</div>
        <div class="profile-info">
          <h2>{{ user.firstName }} {{ user.lastName }}</h2>
          <div class="user-id">{{ user.userId }}</div>
          <div class="flex items-center gap-sm mt-sm">
            <span class="badge" [ngClass]="'badge-' + getStatusBadgeClass(user.status)">{{ user.status }}</span>
            <span class="badge badge-primary">{{ user.role }}</span>
          </div>
        </div>
        <div style="margin-left:auto">
          <button class="btn btn-secondary" (click)="openEditModal()">
            <span class="material-icons-round">edit</span> Edit Profile
          </button>
        </div>
      </div>

      <div class="profile-details-grid">
        <div class="card">
          <div class="card-header"><h4>Personal Information</h4></div>
          <div class="info-row">
            <span class="info-label">Full Name</span>
            <span class="info-value">{{ user.firstName }} {{ user.lastName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date of Birth</span>
            <span class="info-value">{{ formatDate(user.dateOfBirth) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email</span>
            <span class="info-value">{{ user.email }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Mobile</span>
            <span class="info-value">{{ user.phone }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Address</span>
            <span class="info-value">{{ user.address }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Member Since</span>
            <span class="info-value">{{ formatDate(user.createdAt) }}</span>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h4>Identity Documents</h4></div>
          <div class="info-row">
            <span class="info-label">PAN Number</span>
            <span class="info-value">{{ user.pan || 'Not provided' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Aadhaar Number</span>
            <span class="info-value">{{ formattedAadhaar }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Nominee</span>
            <span class="info-value">As per account</span>
          </div>

          <div class="divider"></div>
          <div class="card-header"><h4>Security</h4></div>
          <div class="info-row">
            <span class="info-label">Password</span>
            <span class="info-value">
              <button class="btn btn-outline btn-sm" (click)="openChangePasswordModal()">
                <span class="material-icons-round">lock_reset</span> Change Password
              </button>
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">Two-Factor Auth</span>
            <span class="info-value">
              <label class="toggle-switch">
                <input type="checkbox" checked disabled>
                <span class="toggle-slider"></span>
              </label>
            </span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  initials = '?';
  formattedAadhaar = 'Not provided';

  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private utilsService: UtilsService,
    private toastService: ToastService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.initials = this.utilsService.getInitials(`${this.user.firstName} ${this.user.lastName}`);
      this.formattedAadhaar = this.user.aadhaar
        ? this.user.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')
        : 'Not provided';
    }
  }

  formatDate(dateStr: string): string {
    return this.utilsService.formatDate(dateStr);
  }

  getStatusBadgeClass(status: string): string {
    return this.utilsService.getStatusBadgeClass(status);
  }

  openEditModal() {
    if (!this.user) return;
    const u = this.user;
    this.modalService.show({
      title: 'Edit Profile',
      size: 'modal-lg',
      content: `
        <p class="text-muted">Update your contact information below:</p>
      `,
      confirmText: 'Save Changes',
      onConfirm: () => {
        this.toastService.info('Notice', 'Profile fields can be updated directly');
      }
    });
  }

  openChangePasswordModal() {
    this.modalService.alert('Change Password', 'Please enter your current and new password in the Security settings panel.');
  }
}

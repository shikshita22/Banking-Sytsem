import { Component, Input, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { StoreService } from '../../../core/services/store.service';
import { UtilsService } from '../../../core/services/utils.service';
import { ToastService } from '../../../core/services/toast.service';
import { SidebarService } from '../../../core/services/sidebar.service';
import { Notification } from '../../../core/models/bank.models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="app-header" [ngClass]="{ 'sidebar-collapsed': isCollapsed }">
      <div class="header-left">
        <div class="header-breadcrumb">
          <span>ILPBank</span>
          <span class="material-icons-round separator" style="font-size:16px">chevron_right</span>
          <span class="current">{{ pageTitle }}</span>
        </div>
      </div>
      <div class="header-right">
        <div class="header-search">
          <span class="material-icons-round">search</span>
          <input type="text" placeholder="Search anything..." (input)="onSearch($event)">
        </div>
        <div class="header-notification" style="position:relative">
          <button class="btn btn-ghost btn-icon" (click)="toggleNotifDropdown($event)">
            <span class="material-icons-round">notifications</span>
            <span *ngIf="unreadCount > 0" class="notif-badge"></span>
          </button>

          <!-- Notification Dropdown -->
          <div *ngIf="showNotifDropdown" class="notif-dropdown" (click)="$event.stopPropagation()">
            <div class="notif-dropdown-header">
              <h4 style="font-size:var(--font-sm)">Notifications</h4>
              <button class="btn btn-ghost btn-sm" (click)="markAllRead()">Mark all read</button>
            </div>
            <div class="notif-list">
              <div *ngIf="notifications.length === 0" class="empty-state p-lg">
                <span class="material-icons-round" style="font-size:32px">notifications_none</span>
                <p class="text-sm">No notifications</p>
              </div>
              <div *ngFor="let n of notifications" class="notif-item" [ngClass]="{ 'unread': !n.read }">
                <div class="card-icon" [ngClass]="n.type || 'info'" style="width:36px;height:36px;border-radius:50%">
                  <span class="material-icons-round" style="font-size:18px">
                    {{ n.type === 'success' ? 'check_circle' : n.type === 'error' ? 'error' : n.type === 'warning' ? 'warning' : 'info' }}
                  </span>
                </div>
                <div>
                  <div class="notif-text">{{ n.title }}</div>
                  <div class="notif-time">{{ getRelativeTime(n.timestamp) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="btn btn-ghost btn-icon" (click)="logout()" title="Logout">
          <span class="material-icons-round">logout</span>
        </button>
        <div class="avatar sm" style="cursor:pointer" (click)="goToProfile()">{{ initials }}</div>
      </div>
    </header>
  `
})
export class HeaderComponent implements OnInit {
  @Input() pageTitle: string = 'Dashboard';
  isCollapsed = false;
  showNotifDropdown = false;
  notifications: Notification[] = [];
  unreadCount = 0;
  initials = '?';

  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private utilsService: UtilsService,
    private toastService: ToastService,
    private sidebarService: SidebarService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.sidebarService.collapsed$.subscribe(c => this.isCollapsed = c);
    this.loadUserData();
  }

  loadUserData() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.initials = this.utilsService.getInitials(`${user.firstName} ${user.lastName}`);
      this.notifications = this.storeService.getNotificationsByUser(user.userId).slice(0, 10);
      this.unreadCount = this.notifications.filter(n => !n.read).length;
    }
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  toggleNotifDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.showNotifDropdown = !this.showNotifDropdown;
    if (this.showNotifDropdown) {
      this.loadUserData();
    }
  }

  markAllRead() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.notifications.forEach(n => this.storeService.markNotificationRead(n.id));
      this.unreadCount = 0;
      this.notifications.forEach(n => n.read = true);
      this.toastService.info('Notifications', 'All notifications marked as read');
    }
  }

  getRelativeTime(timestamp: string): string {
    return this.utilsService.getRelativeTime(timestamp);
  }

  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    // Search filter handling if needed
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.showNotifDropdown && !this.elementRef.nativeElement.contains(event.target)) {
      this.showNotifDropdown = false;
    }
  }
}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { StoreService } from './store.service';
import { SeedService } from './seed.service';
import { UtilsService } from './utils.service';
import { Session, User, UserRole } from '../models/bank.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly SESSION_KEY = 'securebank_session';
  private sessionSubject = new BehaviorSubject<Session | null>(this.getSessionFromStorage());
  session$: Observable<Session | null> = this.sessionSubject.asObservable();

  private currentOTP: string | null = null;
  private otpExpiry: number | null = null;

  constructor(
    private store: StoreService,
    private seedService: SeedService,
    private utils: UtilsService,
    private router: Router
  ) {}

  private getSessionFromStorage(): Session | null {
    try {
      const data = localStorage.getItem(this.SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  getSession(): Session | null {
    return this.sessionSubject.value;
  }

  setSession(user: User): Session {
    const session: Session = {
      userId: user.userId,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      loginAt: new Date().toISOString()
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    this.sessionSubject.next(session);
    return session;
  }

  clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    this.sessionSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.getSession() !== null;
  }

  getCurrentUser(): User | null {
    const session = this.getSession();
    if (!session) return null;
    return this.store.getUserById(session.userId);
  }

  getCurrentUserId(): string | null {
    const session = this.getSession();
    return session ? session.userId : null;
  }

  getCurrentRole(): UserRole | null {
    const session = this.getSession();
    return session ? session.role : null;
  }

  isCustomer(): boolean {
    return this.getCurrentRole() === 'CUSTOMER';
  }

  isAdmin(): boolean {
    return this.getCurrentRole() === 'ADMIN';
  }

  isManager(): boolean {
    return this.getCurrentRole() === 'MANAGER';
  }

  isStaff(): boolean {
    return this.getCurrentRole() === 'STAFF';
  }

  isLoanOfficer(): boolean {
    return this.getCurrentRole() === 'LOAN_OFFICER';
  }

  isCsr(): boolean {
    return this.getCurrentRole() === 'CSR';
  }

  getRoleDefaultRoute(role?: UserRole | null): string {
    const r = role || this.getCurrentRole();
    switch (r) {
      case 'ADMIN':
        return '/admin';
      case 'MANAGER':
      case 'STAFF':
        return '/staff-dashboard';
      case 'LOAN_OFFICER':
        return '/loan-status';
      case 'CSR':
        return '/customer-mgmt';
      case 'CUSTOMER':
      default:
        return '/dashboard';
    }
  }

  async login(identifier: string, password: string): Promise<{ success: boolean; error?: string; user?: User; session?: Session }> {
    if (!this.store.isInitialized()) {
      await this.seedService.loadSeedData();
    } else {
      // Ensure seed data integrity
      await this.seedService.verifyAndRepairSeedUsers();
    }

    const cleanId = (identifier || '').trim();
    if (!cleanId || !password) {
      return { success: false, error: 'Please enter both User ID/Email and Password' };
    }

    // Try finding user by User ID (case-insensitive) or Email (case-insensitive)
    const allUsers = this.store.getAll<User>('users');
    let user = allUsers.find(u => u.userId.toUpperCase() === cleanId.toUpperCase()) || null;
    if (!user) {
      user = allUsers.find(u => u.email.toLowerCase() === cleanId.toLowerCase()) || null;
    }

    if (!user) {
      return { success: false, error: 'Invalid credentials. User not found.' };
    }

    if (user.status === 'BLOCKED' || user.status === 'INACTIVE') {
      return { success: false, error: 'Your account has been blocked or deactivated. Please contact support.' };
    }

    const hashedInput = await this.utils.hashPassword(password);
    
    // Compute legacy hash with old salt if needed for backward compatibility
    const encoder = new TextEncoder();
    const legacyData = encoder.encode(password + 'ilpbank_salt_2024');
    const legacyHashBuffer = await crypto.subtle.digest('SHA-256', legacyData);
    const legacyHashedInput = Array.from(new Uint8Array(legacyHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    const isMatch = (hashedInput === user.password) || (legacyHashedInput === user.password) || (password === user.password);

    if (!isMatch) {
      return { success: false, error: 'Invalid credentials. Incorrect password.' };
    }

    // Upgrade stored password hash to standard SHA-256 hash if it matched plain or legacy hash
    if (user.password !== hashedInput) {
      user.password = hashedInput;
      this.store.updateUser(user.userId, { password: hashedInput });
    }

    const session = this.setSession(user);

    this.store.addAuditLog({
      id: this.utils.generateAuditId(this.store),
      userId: user.userId,
      action: 'USER_LOGIN',
      target: user.userId,
      details: `${user.firstName} ${user.lastName} logged in (${user.role})`,
      timestamp: this.utils.nowISO()
    });

    return { success: true, user, session };
  }

  async register(formData: any): Promise<{ success: boolean; error?: string; user?: User; accountId?: string }> {
    if (!formData.firstName || formData.firstName.trim().length < 2) {
      return { success: false, error: 'First name must be at least 2 characters' };
    }
    if (!formData.lastName || formData.lastName.trim().length < 2) {
      return { success: false, error: 'Last name must be at least 2 characters' };
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }
    const normalizedEmail = formData.email.trim().toLowerCase();
    if (!normalizedEmail.endsWith('@tcs.com')) {
      return { success: false, error: 'Email must be a @tcs.com address' };
    }
    if (!formData.phone || !/^[6-9]\d{9}$/.test(formData.phone)) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number' };
    }
    if (!formData.password || formData.password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long' };
    }
    if (!formData.dateOfBirth) {
      return { success: false, error: 'Please enter a valid Date of Birth' };
    }
    if (!formData.addressLine1 || formData.addressLine1.trim().length < 5) {
      return { success: false, error: 'Please enter a valid address line 1' };
    }
    if (!formData.city || formData.city.trim().length < 2) {
      return { success: false, error: 'Please enter your city' };
    }
    if (!formData.state || formData.state.trim().length < 2) {
      return { success: false, error: 'Please enter your state' };
    }
    if (!formData.pincode || !/^[0-9]{6}$/.test(formData.pincode.trim())) {
      return { success: false, error: 'Please enter a valid 6-digit PIN code' };
    }
    if (!formData.accountType) {
      return { success: false, error: 'Please select an account type' };
    }

    const addressParts = [
      formData.addressLine1.trim(),
      formData.addressLine2 ? formData.addressLine2.trim() : '',
      formData.city.trim(),
      formData.state.trim(),
      formData.pincode.trim()
    ].filter(Boolean);

    const userId = this.utils.generateUserId('CUSTOMER', this.store);
    const hashedPassword = await this.utils.hashPassword(formData.password);

    const user: User = {
      userId,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: normalizedEmail,
      phone: formData.phone.trim(),
      password: hashedPassword,
      role: 'CUSTOMER',
      dateOfBirth: formData.dateOfBirth,
      address: addressParts.join(', '),
      pan: formData.pan || '',
      aadhaar: formData.aadhaar || '',
      createdAt: this.utils.todayISO(),
      status: 'ACTIVE'
    };

    this.store.addUser(user);

    const accountId = this.utils.generateAccountId(formData.accountType, this.store);

    const account = {
      accountId,
      userId,
      accountType: formData.accountType,
      balance: 0,
      availableBalance: 0,
      minBalance: formData.accountType === 'SAVINGS' ? 5000 : 10000,
      ifsc: 'KBKK0000001',
      branch: 'Online Registration',
      openingDate: this.utils.todayISO(),
      status: 'PENDING',
      nominee: formData.nominee || ''
    };

    this.store.addAccount(account);

    this.store.addNotification({
      id: 'N' + Date.now(),
      userId,
      title: 'Welcome to ILPBank!',
      message: `Your account application (${accountId}) has been submitted. It will be reviewed shortly.`,
      type: 'info',
      timestamp: this.utils.nowISO(),
      read: false
    });

    this.store.addAuditLog({
      id: this.utils.generateAuditId(this.store),
      userId,
      action: 'USER_REGISTERED',
      target: userId,
      details: `New customer ${user.firstName} ${user.lastName} registered. Account ${accountId} pending approval.`,
      timestamp: this.utils.nowISO()
    });

    return { success: true, user, accountId };
  }

  logout(): void {
    const session = this.getSession();
    if (session) {
      this.store.addAuditLog({
        id: this.utils.generateAuditId(this.store),
        userId: session.userId,
        action: 'USER_LOGOUT',
        target: session.userId,
        details: `${session.firstName} ${session.lastName} logged out`,
        timestamp: this.utils.nowISO()
      });
    }
    this.clearSession();
    this.router.navigate(['/login']);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const user = this.store.getUserById(userId);
    if (!user) return { success: false, error: 'User not found' };

    const currentHash = await this.utils.hashPassword(currentPassword);
    if (currentHash !== user.password) {
      return { success: false, error: 'Current password is incorrect' };
    }

    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters long' };
    }

    const newHash = await this.utils.hashPassword(newPassword);
    this.store.updateUser(userId, { password: newHash });

    return { success: true };
  }

  generateOTP(): string {
    this.currentOTP = String(this.utils.randomInt(100000, 999999));
    this.otpExpiry = Date.now() + 300000;
    return this.currentOTP;
  }

  verifyOTP(input: string): { success: boolean; error?: string } {
    if (!this.currentOTP || !this.otpExpiry) return { success: false, error: 'No OTP generated' };
    if (Date.now() > this.otpExpiry) return { success: false, error: 'OTP has expired' };
    if (input !== this.currentOTP) return { success: false, error: 'Invalid OTP' };
    this.currentOTP = null;
    this.otpExpiry = null;
    return { success: true };
  }
}

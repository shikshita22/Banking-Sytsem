import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page auth-login-page">
      <div class="auth-container">
        <div class="auth-logo">
          <div class="logo-icon">
            <span class="material-icons-round">account_balance</span>
          </div>
          <h1>ILPBank</h1>
          <p>Your trusted banking partner</p>
        </div>
        <div class="auth-card fade-up">
          <h2>Welcome Back</h2>
          <p>Sign in to your ILPBank account</p>

          <form (ngSubmit)="onSubmit()" autocomplete="off" [ngClass]="{ 'shake': isShaking }">
            <div class="form-group">
              <label class="form-label">User ID or Email <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-icon"><span class="material-icons-round">person</span></span>
                <input type="text" class="form-control" name="identifier" [(ngModel)]="identifier"
                       placeholder="e.g. U0001 or S0001 or amit.sharma@tcs.com" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Password <span class="text-danger">*</span></label>
              <div class="input-group has-icon-right">
                <span class="input-icon"><span class="material-icons-round">lock</span></span>
                <input [type]="showPassword ? 'text' : 'password'" class="form-control" name="password" [(ngModel)]="password" placeholder="Enter your password" required>
                <button type="button" class="input-icon-right" (click)="togglePasswordVisibility()" aria-label="Toggle password visibility" title="Toggle password visibility" style="display: inline-flex !important; opacity: 1 !important; visibility: visible !important; pointer-events: auto !important;">
                  <span class="material-icons-round" style="font-size: 20px; color: var(--text-muted);">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between mb-lg">
              <label class="form-check">
                <input type="checkbox" name="remember" [(ngModel)]="remember"> Remember me
              </label>
              <a (click)="showForgotPassword()" style="cursor:pointer" class="text-sm">Forgot password?</a>
            </div>

            <button type="submit" class="btn btn-primary btn-block btn-lg" [disabled]="isLoading">
              <span class="material-icons-round" [ngClass]="{ 'spin': isLoading }">{{ isLoading ? 'sync' : 'login' }}</span>
              {{ isLoading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <div class="auth-footer">
            Don't have an account? <a routerLink="/register">Create Account</a>
          </div>
        </div>

        <div class="demo-credentials-box text-center mt-lg p-md" style="background: rgba(255,255,255,0.92); border-radius: 12px; border: 1px solid var(--border-color, #e2e8f0); box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <p class="text-xs text-muted font-bold mb-sm" style="text-transform: uppercase; letter-spacing: 0.5px;">Quick Demo Sign-In (Click to Autofill)</p>
          <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
            <a (click)="fillDemo('U0001', 'Customer@1234')" style="cursor: pointer; color: var(--primary-color, #1e40af); text-decoration: underline; font-size: 0.875rem; font-weight: 500;" class="demo-link">Customer: U0001 (amit.sharma&#64;tcs.com)</a>
            <a (click)="fillDemo('S0001', 'Admin@1234')" style="cursor: pointer; color: var(--primary-color, #1e40af); text-decoration: underline; font-size: 0.875rem; font-weight: 500;" class="demo-link">Admin: S0001 (rajesh.kumar&#64;tcs.com)</a>
            <a (click)="fillDemo('S0004', 'Manager@1234')" style="cursor: pointer; color: var(--primary-color, #1e40af); text-decoration: underline; font-size: 0.875rem; font-weight: 500;" class="demo-link">Manager: S0004 (vikram.sharma&#64;tcs.com)</a>
            <a (click)="fillDemo('S0002', 'Staff@1234')" style="cursor: pointer; color: var(--primary-color, #1e40af); text-decoration: underline; font-size: 0.875rem; font-weight: 500;" class="demo-link">Staff: S0002 (priya.singh&#64;tcs.com)</a>
            <a (click)="fillDemo('S0003', 'LoanOfficer@123')" style="cursor: pointer; color: var(--primary-color, #1e40af); text-decoration: underline; font-size: 0.875rem; font-weight: 500;" class="demo-link">Loan Officer: S0003 (arun.bhatia&#64;tcs.com)</a>
            <a (click)="fillDemo('S0005', 'Csr@1234')" style="cursor: pointer; color: var(--primary-color, #1e40af); text-decoration: underline; font-size: 0.875rem; font-weight: 500;" class="demo-link">CSR: S0005 (ananya.verma&#64;tcs.com)</a>
          </div>
        </div>
      </div>
      <footer class="auth-footer-pane auth-login-footer">
        <div class="auth-footer-support">
          <strong>Need help?</strong>
          <span>Customer Care <a href="tel:18001239876">1800-123-9876</a></span>
          <span>Cards <a href="tel:18004561234">1800-456-1234</a></span>
          <span>Loans <a href="tel:18007894321">1800-789-4321</a></span>
        </div>
        <div class="auth-footer-links">
          <a routerLink="/help">Help & Support</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms & Conditions</a>
          <a href="#">Security</a>
        </div>
        <div class="auth-footer-copy">© 2026 ILPBank. All rights reserved. &nbsp; | &nbsp; Banking made simple, secure and accessible.</div>
      </footer>
    </div>
  `
})
export class LoginComponent implements OnInit {
  identifier: string = '';
  password: string = '';
  showPassword: boolean = false;
  remember: boolean = false;
  isLoading: boolean = false;
  isShaking: boolean = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private modalService: ModalService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const roleParam = this.route.snapshot.params['role'];
    if (roleParam === 'staff') {
      this.fillDemo('S0001', 'Admin@1234');
    } else if (roleParam === 'customer') {
      this.fillDemo('U0001', 'Customer@1234');
    }
  }

  fillDemo(id: string, pass: string) {
    this.identifier = id;
    this.password = pass;
    this.isShaking = false;
  }

  async onSubmit() {
    this.isShaking = false;
    if (!this.identifier || !this.password) {
      this.toastService.error('Error', 'Please enter User ID/Email and Password');
      this.isShaking = true;
      setTimeout(() => this.isShaking = false, 500);
      return;
    }

    this.isLoading = true;

    // Small delay for smooth UX transition
    await new Promise(r => setTimeout(r, 400));

    const result = await this.authService.login(this.identifier, this.password);

    this.isLoading = false;

    if (result.success && result.user) {
      this.toastService.success('Welcome!', `Logged in as ${result.user.firstName} ${result.user.lastName} (${result.user.role})`);
      const targetRoute = this.authService.getRoleDefaultRoute(result.user.role);
      this.router.navigate([targetRoute]);
    } else {
      this.toastService.error('Login Failed', result.error || 'Invalid credentials');
      this.isShaking = true;
      setTimeout(() => this.isShaking = false, 500);
    }
  }

  showForgotPassword() {
    const otp = this.authService.generateOTP();
    this.modalService.alert('Forgot Password', `A password reset OTP has been sent: ${otp} (Simulated). Please contact support to complete reset.`);
  }
}

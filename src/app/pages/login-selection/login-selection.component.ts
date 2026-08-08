import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login-selection',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="auth-page auth-selection-page">
      <div class="auth-container wide">
        <div class="auth-card fade-up text-center">
          <span class="eyebrow">Welcome back</span>
          <h1>Sign in to your ILPBank account</h1>
          <p class="text-muted">Choose the login path that matches your role and continue to your secure dashboard.</p>
          <div class="login-choice-grid">
            <div class="login-choice-card">
              <span class="material-icons-round">account_circle</span>
              <h3>Customer Login</h3>
              <p>Access account details, transfers, statements, loan services and personalized banking tools.</p>
              <a routerLink="/login/customer" class="btn btn-primary btn-block">Login as Customer</a>
            </div>
            <div class="login-choice-card">
              <span class="material-icons-round">admin_panel_settings</span>
              <h3>Staff / Admin Login</h3>
              <p>Manage customers, approve accounts, review reports, and handle service requests.</p>
              <a routerLink="/login/staff" class="btn btn-outline btn-block">Login as Staff</a>
            </div>
          </div>
          <div class="auth-footer">
            New here? <a routerLink="/register">Create an account</a> or go back to the <a routerLink="/">landing page</a>.
          </div>
        </div>
      </div>
      <footer class="auth-footer-pane auth-footer-pane-compact">
        <div class="auth-footer-support">
          <strong>Need help?</strong>
          <span>Customer Care <a href="tel:18001239876">1800-123-9876</a></span>
          <span>Cards <a href="tel:18004561234">1800-456-1234</a></span>
          <span>Loans <a href="tel:18007894321">1800-789-4321</a></span>
        </div>
        <div class="auth-footer-links">
          <a routerLink="/help">Help & Support</a><a href="#">Privacy Policy</a><a href="#">Terms & Conditions</a><a href="#">Security</a>
        </div>
        <div class="auth-footer-copy">© 2026 ILPBank. All rights reserved.</div>
      </footer>
    </section>
  `
})
export class LoginSelectionComponent {}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="landing-page">

      <!-- Navigation -->
      <header class="landing-topbar">
        <a routerLink="/" class="landing-brand" aria-label="ILPBank home">
          <span class="brand-mark"><span class="material-icons-round">account_balance</span></span>
          <span>ILP<span>Bank</span></span>
        </a>

        <nav class="landing-nav" aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#security">Security</a>
          <a routerLink="/help">Support</a>
          <a routerLink="/login" class="nav-login">Login</a>
          <a routerLink="/register" class="btn btn-primary">Open Account</a>
        </nav>
      </header>

      <!-- Hero -->
      <section class="landing-hero">
        <div class="hero-copy">
          <div class="hero-kicker">
            <span class="live-dot"></span>
            DIGITAL BANKING, SIMPLIFIED
          </div>

          <h1>Banking that puts <span>you</span> in control.</h1>

          <p class="hero-lead">
            Manage your accounts, cards, transfers and loans from one secure,
            beautifully simple banking experience.
          </p>

          <div class="hero-actions">
            <a routerLink="/register" class="btn btn-primary btn-lg">
              Open an Account
              <span class="material-icons-round">arrow_forward</span>
            </a>
            <a routerLink="/login" class="btn btn-outline btn-lg">
              Sign In
            </a>
          </div>

          <div class="hero-trust">
            <span><span class="material-icons-round">verified_user</span> Secure access</span>
            <span><span class="material-icons-round">bolt</span> Fast transfers</span>
            <span><span class="material-icons-round">support_agent</span> 24/7 support</span>
          </div>
        </div>

        <!-- Dashboard visual -->
        <div class="hero-visual" aria-label="Banking dashboard preview">
          <div class="visual-glow"></div>

          <div class="bank-dashboard">
            <div class="dashboard-head">
              <div>
                <span class="dashboard-overline">TOTAL BALANCE</span>
                <strong>₹ 1,24,580.00</strong>
              </div>
              <span class="dashboard-avatar">SY</span>
            </div>

            <div class="balance-chart">
              <div class="chart-labels">
                <span>Spending overview</span>
                <span class="positive">+12.8%</span>
              </div>
              <div class="chart-bars">
                <i style="height:34%"></i>
                <i style="height:52%"></i>
                <i style="height:43%"></i>
                <i style="height:70%"></i>
                <i style="height:58%"></i>
                <i style="height:84%"></i>
                <i style="height:67%"></i>
                <i style="height:94%"></i>
                <i style="height:78%"></i>
                <i style="height:88%"></i>
              </div>
            </div>

            <div class="dashboard-actions">
              <a routerLink="/transfer"><span class="material-icons-round">north_east</span>Transfer</a>
              <a routerLink="/accounts"><span class="material-icons-round">account_balance_wallet</span>Accounts</a>
              <a routerLink="/statement"><span class="material-icons-round">receipt_long</span>Statement</a>
            </div>

            <div class="recent-head">
              <strong>Recent activity</strong>
              <span>View all</span>
            </div>

            <div class="activity-row">
              <span class="activity-icon income"><span class="material-icons-round">south_west</span></span>
              <div><strong>Salary credited</strong><small>Today · 10:24 AM</small></div>
              <b class="income-text">+₹45,000</b>
            </div>
            <div class="activity-row">
              <span class="activity-icon"><span class="material-icons-round">shopping_bag</span></span>
              <div><strong>Online purchase</strong><small>Yesterday · 6:42 PM</small></div>
              <b>-₹2,450</b>
            </div>
          </div>

          <div class="floating-security">
            <span class="material-icons-round">shield</span>
            <div><strong>Protected</strong><small>Secure banking session</small></div>
            <span class="material-icons-round check">check_circle</span>
          </div>
        </div>
      </section>

      <!-- Trust stats -->
      <section class="trust-strip" id="security">
        <div><strong>99.99%</strong><span>Platform reliability</span></div>
        <div><strong>24/7</strong><span>Digital availability</span></div>
        <div><strong>256-bit</strong><span>Data encryption</span></div>
        <div><strong>100%</strong><span>Secure sessions</span></div>
      </section>

      <!-- Features -->
      <section class="landing-features" id="features">
        <div class="section-heading">
          <span class="section-kicker">EVERYTHING IN ONE PLACE</span>
          <h2>Banking tools designed around <span>your day.</span></h2>
          <p>From everyday payments to long-term financial planning, ILPBank keeps the essentials simple and accessible.</p>
        </div>

        <div class="feature-grid">
          <article class="feature-card feature-primary">
            <div class="feature-icon"><span class="material-icons-round">account_balance_wallet</span></div>
            <h3>Smart accounts</h3>
            <p>View balances, statements, cards and account history without jumping between screens.</p>
            <a routerLink="/accounts">Explore accounts <span class="material-icons-round">arrow_forward</span></a>
          </article>

          <article class="feature-card">
            <div class="feature-icon"><span class="material-icons-round">swap_horiz</span></div>
            <h3>Instant transfers</h3>
            <p>Send money quickly with clear confirmations and easy-to-follow transaction status.</p>
            <a routerLink="/transfer">Make a transfer <span class="material-icons-round">arrow_forward</span></a>
          </article>

          <article class="feature-card">
            <div class="feature-icon"><span class="material-icons-round">credit_card</span></div>
            <h3>Card management</h3>
            <p>Keep your debit and credit cards organised, visible and ready when you need them.</p>
            <a routerLink="/credit-card">Manage cards <span class="material-icons-round">arrow_forward</span></a>
          </article>

          <article class="feature-card">
            <div class="feature-icon"><span class="material-icons-round">trending_up</span></div>
            <h3>Loan tracking</h3>
            <p>Follow applications, approvals and repayment progress with simple, useful insights.</p>
            <a routerLink="/loan-status">View loans <span class="material-icons-round">arrow_forward</span></a>
          </article>
        </div>
      </section>

      <!-- Security callout -->
      <section class="security-section">
        <div class="security-visual">
          <div class="security-ring"><span class="material-icons-round">security</span></div>
          <div class="security-pill pill-one"><span class="material-icons-round">lock</span> Encrypted</div>
          <div class="security-pill pill-two"><span class="material-icons-round">verified</span> Verified</div>
        </div>
        <div class="security-copy">
          <span class="section-kicker">SECURITY FIRST</span>
          <h2>Your money deserves a <span>stronger shield.</span></h2>
          <p>Built with secure sessions, protected customer workflows and clear account controls, so you can bank with confidence.</p>
          <div class="security-list">
            <div><span class="material-icons-round">check_circle</span><span><strong>Protected access</strong><small>Secure authentication for customers and staff.</small></span></div>
            <div><span class="material-icons-round">check_circle</span><span><strong>Clear activity</strong><small>Keep track of payments and account movements.</small></span></div>
            <div><span class="material-icons-round">check_circle</span><span><strong>Helpful support</strong><small>Get assistance whenever you need it.</small></span></div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="landing-cta">
        <div class="cta-copy">
          <span class="section-kicker">READY WHEN YOU ARE</span>
          <h2>Make your next banking experience <span>simpler.</span></h2>
          <p>Open an ILPBank account and get started with a cleaner way to manage your everyday banking.</p>
        </div>
        <div class="cta-actions">
          <a routerLink="/register" class="btn btn-primary btn-lg">Open Account <span class="material-icons-round">arrow_forward</span></a>
          <a routerLink="/help" class="btn btn-light btn-lg">Talk to Support</a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="landing-footer">
        <div class="footer-grid">
          <div class="footer-brand-block">
            <a routerLink="/" class="landing-brand">
              <span class="brand-mark"><span class="material-icons-round">account_balance</span></span>
              <span>ILP<span>Bank</span></span>
            </a>
            <p>Secure, simple digital banking for customers, staff and administrators.</p>
            <div class="footer-social"><span class="material-icons-round">security</span><span class="material-icons-round">verified_user</span><span class="material-icons-round">support_agent</span></div>
          </div>

          <div class="footer-column">
            <h4>Banking</h4>
            <a routerLink="/accounts">Accounts</a>
            <a routerLink="/transfer">Transfers</a>
            <a routerLink="/statement">Statements</a>
            <a routerLink="/credit-card">Cards</a>
          </div>

          <div class="footer-column">
            <h4>Services</h4>
            <a routerLink="/loan-products">Loan products</a>
            <a routerLink="/loan-status">Loan status</a>
            <a routerLink="/help">Help Center</a>
            <a routerLink="/register">Open an account</a>
          </div>

          <div class="footer-column footer-contact">
            <h4>Customer care</h4>
            <strong>1800-123-9876</strong>
            <span>Mon–Sat · 9:00 AM–9:00 PM</span>
            <a href="mailto:support&#64;ilpbank.com">support&#64;ilpbank.com</a>
          </div>
        </div>

        <div class="footer-bottom">
          <span>© 2026 ILPBank. All rights reserved.</span>
          <span>Secure banking · Built for clarity · <a routerLink="/help">Help Center</a></span>
        </div>
      </footer>
    </main>
  `
})
export class LandingComponent {}

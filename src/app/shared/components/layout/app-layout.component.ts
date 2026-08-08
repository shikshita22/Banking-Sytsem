import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { SidebarService } from '../../../core/services/sidebar.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <div class="app-main" [ngClass]="{ 'sidebar-collapsed': isCollapsed }">
        <app-header [pageTitle]="currentPageTitle"></app-header>
        <main class="app-content">
          <router-outlet></router-outlet>
        </main>
        <footer class="app-footer">
          <div class="app-footer-main">
            <div class="app-footer-brand">
              <div class="app-footer-logo"><span class="material-icons-round">account_balance</span></div>
              <div>
                <strong>ILPBank</strong>
                <p>Simple, secure digital banking for your everyday needs.</p>
              </div>
            </div>

            <div class="app-footer-section">
              <h4>Customer Service</h4>
              <a href="tel:18001239876">1800-123-9876</a>
              <a href="mailto:support&#64;ilpbank.com">support&#64;ilpbank.com</a>
              <a routerLink="/help">Help & Support</a>
              <a routerLink="/help">Report Fraud / Raise Dispute</a>
            </div>

            <div class="app-footer-section">
              <h4>Important Links</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms & Conditions</a>
              <a href="#">Disclaimer</a>
              <a routerLink="/help">Important Information</a>
            </div>

            <div class="app-footer-section">
              <h4>Banking Support</h4>
              <span>Cards: <a href="tel:18004561234">1800-456-1234</a></span>
              <span>Loans: <a href="tel:18007894321">1800-789-4321</a></span>
              <span>Available for assistance 24×7</span>
            </div>
          </div>

          <div class="app-footer-bottom">
            <span>© 2026 ILPBank. All rights reserved.</span>
            <span>ILPBank is committed to secure and responsible digital banking.</span>
          </div>
        </footer>
      </div>
    </div>
  `
})
export class AppLayoutComponent implements OnInit {
  isCollapsed = false;
  currentPageTitle: string = 'Dashboard';

  constructor(
    private sidebarService: SidebarService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.sidebarService.collapsed$.subscribe(c => this.isCollapsed = c);

    this.updateTitle();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateTitle();
    });
  }

  private updateTitle() {
    let route = this.activatedRoute.firstChild;
    while (route?.firstChild) {
      route = route.firstChild;
    }
    if (route?.snapshot.data && route.snapshot.data['title']) {
      this.currentPageTitle = route.snapshot.data['title'];
    }
  }
}

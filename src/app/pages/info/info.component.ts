import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-pages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1>Information & Guidelines</h1>
          <p>Bank interest rates, security guidelines, terms and policies</p>
        </div>
      </div>

      <div class="tabs mb-xl">
        <button class="tab" [ngClass]="{ 'active': activeTab === 'rates' }" (click)="activeTab = 'rates'">Interest Rates</button>
        <button class="tab" [ngClass]="{ 'active': activeTab === 'security' }" (click)="activeTab = 'security'">Security Guidelines</button>
        <button class="tab" [ngClass]="{ 'active': activeTab === 'terms' }" (click)="activeTab = 'terms'">Terms & Conditions</button>
      </div>

      <div *ngIf="activeTab === 'rates'" class="card fade-up">
        <div class="card-header"><h3>Deposit Interest Rates</h3></div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Account / Product</th>
                <th>Interest Rate (% p.a.)</th>
                <th>Minimum Balance Required</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Savings Account</td><td>3.50% - 4.00%</td><td>₹5,000</td></tr>
              <tr><td>Current Account</td><td>0.00%</td><td>₹10,000</td></tr>
              <tr><td>Fixed Deposit (1 Year)</td><td>6.75%</td><td>₹10,000</td></tr>
              <tr><td>Fixed Deposit (3 Years)</td><td>7.25%</td><td>₹10,000</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="activeTab === 'security'" class="card fade-up">
        <div class="card-header"><h3>Online Safety & Security Advice</h3></div>
        <div class="p-md">
          <ul class="text-sm text-secondary" style="line-height: 1.8;">
            <li>Never share your passwords, PINs, OTPs, or card CVVs with anyone, including bank staff.</li>
            <li>Always verify the website address (ensure HTTPS and valid SSL certificate) before logging in.</li>
            <li>Report lost or stolen cards immediately through the app or customer care.</li>
            <li>Enable notification alerts for all account transactions.</li>
          </ul>
        </div>
      </div>

      <div *ngIf="activeTab === 'terms'" class="card fade-up">
        <div class="card-header"><h3>Terms & Conditions</h3></div>
        <div class="p-md text-sm text-secondary">
          <p>By using ILPBank NetBanking services, you agree to adhere to all terms, policies, and regulatory guidelines prescribed by the Reserve Bank of India.</p>
        </div>
      </div>
    </div>
  `
})
export class InfoPagesComponent {
  activeTab: 'rates' | 'security' | 'terms' = 'rates';
}

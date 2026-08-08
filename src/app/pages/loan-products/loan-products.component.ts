import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UtilsService } from '../../core/services/utils.service';

@Component({
  selector: 'app-loan-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1>Loan Products</h1>
          <p>Explore competitive loan products and calculate your estimated EMI</p>
        </div>
      </div>

      <!-- EMI Calculator -->
      <div class="card mb-xl">
        <div class="card-header"><h3>Interactive EMI Calculator</h3></div>
        <div class="grid grid-2 gap-lg">
          <div>
            <div class="form-group">
              <label class="form-label">Loan Amount (₹): <span class="font-bold text-primary">{{ formatCurrency(calcAmount) }}</span></label>
              <input type="range" class="form-range" min="50000" max="10000000" step="50000" [(ngModel)]="calcAmount" (input)="updateEMI()">
            </div>
            <div class="form-group">
              <label class="form-label">Interest Rate (% p.a.): <span class="font-bold text-primary">{{ calcRate }}%</span></label>
              <input type="range" class="form-range" min="6" max="18" step="0.25" [(ngModel)]="calcRate" (input)="updateEMI()">
            </div>
            <div class="form-group">
              <label class="form-label">Tenure (Months): <span class="font-bold text-primary">{{ calcTenure }} months</span></label>
              <input type="range" class="form-range" min="12" max="360" step="12" [(ngModel)]="calcTenure" (input)="updateEMI()">
            </div>
          </div>

          <div class="card card-flat p-lg flex flex-col justify-center items-center text-center">
            <div class="text-muted text-sm mb-xs">Estimated Monthly EMI</div>
            <div class="font-bold text-accent" style="font-size: 2.2rem;">{{ formatCurrency(calculatedEMI) }}</div>
            <div class="text-xs text-muted mt-sm">Total Interest Payable: {{ formatCurrency(totalInterest) }}</div>
            <button class="btn btn-primary mt-md" routerLink="/loan-apply">Apply for Loan Now</button>
          </div>
        </div>
      </div>

      <!-- Loan Catalog -->
      <div class="grid grid-3 gap-lg">
        <div *ngFor="let prod of loanProducts" class="card hover-lift">
          <div class="card-header">
            <h3>{{ prod.name }}</h3>
            <span class="badge badge-success">{{ prod.rate }}% p.a.</span>
          </div>
          <p class="text-sm text-secondary">{{ prod.description }}</p>
          <div class="info-row"><span class="info-label">Max Tenure</span><span class="info-value">{{ prod.maxTenure }} Years</span></div>
          <div class="info-row"><span class="info-label">Max Amount</span><span class="info-value">{{ formatCurrency(prod.maxAmount) }}</span></div>
          <div class="info-row"><span class="info-label">Processing Fee</span><span class="info-value">{{ prod.fee }}</span></div>
          <button class="btn btn-outline btn-block mt-md" routerLink="/loan-apply" [queryParams]="{ type: prod.id }">Apply Now</button>
        </div>
      </div>
    </div>
  `
})
export class LoanProductsComponent implements OnInit {
  calcAmount = 500000;
  calcRate = 10.5;
  calcTenure = 36;
  calculatedEMI = 0;
  totalInterest = 0;

  loanProducts = [
    { id: 'PERSONAL', name: 'Personal Loan', rate: 10.5, maxTenure: 5, maxAmount: 2500000, fee: '1%', description: 'Quick collateral-free personal loans for all your immediate needs.' },
    { id: 'HOME', name: 'Home Loan', rate: 8.5, maxTenure: 30, maxAmount: 50000000, fee: '0.5%', description: 'Low-interest home financing to make your dream house a reality.' },
    { id: 'VEHICLE', name: 'Vehicle Loan', rate: 9.0, maxTenure: 7, maxAmount: 5000000, fee: '1%', description: 'Flexible financing for cars, two-wheelers, and commercial vehicles.' },
    { id: 'EDUCATION', name: 'Education Loan', rate: 7.5, maxTenure: 12, maxAmount: 3000000, fee: 'Nil', description: 'Comprehensive student loans for higher education in India & abroad.' }
  ];

  constructor(private utilsService: UtilsService) {}

  ngOnInit() {
    this.updateEMI();
  }

  updateEMI() {
    this.calculatedEMI = this.utilsService.calculateEMI(this.calcAmount, this.calcRate, this.calcTenure);
    this.totalInterest = (this.calculatedEMI * this.calcTenure) - this.calcAmount;
  }

  formatCurrency(amount: number): string {
    return this.utilsService.formatCurrency(amount);
  }
}

import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/guards/auth.guard';
import { AppLayoutComponent } from './shared/components/layout/app-layout.component';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AccountDetailsComponent } from './pages/accounts/accounts.component';
import { AccountStatementComponent } from './pages/statement/statement.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { FundTransferComponent } from './pages/transfer/transfer.component';
import { ScheduledPaymentsComponent } from './pages/scheduled/scheduled.component';
import { DebitCardComponent } from './pages/debit-card/debit-card.component';
import { CreditCardComponent } from './pages/credit-card/credit-card.component';
import { LoanProductsComponent } from './pages/loan-products/loan-products.component';
import { LoanApplicationComponent } from './pages/loan-apply/loan-apply.component';
import { LoanStatusComponent } from './pages/loan-status/loan-status.component';
import { HelpSupportComponent } from './pages/help/help.component';
import { InfoPagesComponent } from './pages/info/info.component';
import { StaffDashboardComponent } from './pages/staff-dashboard/staff-dashboard.component';
import { CustomerMgmtComponent } from './pages/customer-mgmt/customer-mgmt.component';
import { AccountApprovalComponent } from './pages/account-approval/account-approval.component';
import { AdminPanelComponent } from './pages/admin/admin.component';
import { LoginSelectionComponent } from './pages/login-selection/login-selection.component';
import { ReportsComponent } from './pages/reports/reports.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, canActivate: [guestGuard], pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'login-selection', component: LoginSelectionComponent, canActivate: [guestGuard] },
  { path: 'login/:role', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, canActivate: [roleGuard(['CUSTOMER'])], data: { title: 'Dashboard' } },
      { path: 'profile', component: ProfileComponent, canActivate: [roleGuard(['CUSTOMER', 'ADMIN', 'MANAGER', 'STAFF', 'LOAN_OFFICER', 'CSR'])], data: { title: 'My Profile' } },
      { path: 'accounts', component: AccountDetailsComponent, canActivate: [roleGuard(['CUSTOMER', 'ADMIN', 'MANAGER', 'STAFF'])], data: { title: 'Account Details' } },
      { path: 'statement', component: AccountStatementComponent, canActivate: [roleGuard(['CUSTOMER'])], data: { title: 'Account Statement' } },
      { path: 'transactions', component: TransactionsComponent, canActivate: [roleGuard(['CUSTOMER'])], data: { title: 'Deposit & Withdrawal' } },
      { path: 'transfer', component: FundTransferComponent, canActivate: [roleGuard(['CUSTOMER'])], data: { title: 'Fund Transfer' } },
      { path: 'scheduled', component: ScheduledPaymentsComponent, canActivate: [roleGuard(['CUSTOMER'])], data: { title: 'Scheduled Payments' } },
      { path: 'debit-card', component: DebitCardComponent, canActivate: [roleGuard(['CUSTOMER', 'CSR', 'STAFF', 'MANAGER', 'ADMIN'])], data: { title: 'Debit Cards' } },
      { path: 'credit-card', component: CreditCardComponent, canActivate: [roleGuard(['CUSTOMER', 'ADMIN', 'MANAGER'])], data: { title: 'Credit Cards' } },
      { path: 'loan-products', component: LoanProductsComponent, canActivate: [roleGuard(['CUSTOMER', 'LOAN_OFFICER', 'MANAGER', 'ADMIN'])], data: { title: 'Loan Products' } },
      { path: 'loan-apply', component: LoanApplicationComponent, canActivate: [roleGuard(['CUSTOMER'])], data: { title: 'Apply for Loan' } },
      { path: 'loan-status', component: LoanStatusComponent, canActivate: [roleGuard(['CUSTOMER', 'LOAN_OFFICER', 'MANAGER', 'ADMIN'])], data: { title: 'Loan Status' } },
      { path: 'help', component: HelpSupportComponent, canActivate: [roleGuard(['CUSTOMER', 'CSR', 'STAFF', 'MANAGER', 'ADMIN'])], data: { title: 'Help & Support' } },
      { path: 'info', component: InfoPagesComponent, canActivate: [roleGuard(['CUSTOMER', 'ADMIN', 'MANAGER', 'STAFF', 'LOAN_OFFICER', 'CSR'])], data: { title: 'Information' } },
      { path: 'staff-dashboard', component: StaffDashboardComponent, canActivate: [roleGuard(['ADMIN', 'MANAGER', 'STAFF', 'CSR'])], data: { title: 'Staff Dashboard' } },
      { path: 'customer-mgmt', component: CustomerMgmtComponent, canActivate: [roleGuard(['ADMIN', 'MANAGER', 'STAFF', 'CSR'])], data: { title: 'Customer Management' } },
      { path: 'account-approval', component: AccountApprovalComponent, canActivate: [roleGuard(['ADMIN', 'MANAGER', 'STAFF'])], data: { title: 'Account Approval' } },
      { path: 'admin', component: AdminPanelComponent, canActivate: [roleGuard(['ADMIN', 'MANAGER'])], data: { title: 'Admin Panel' } },
      { path: 'reports', component: ReportsComponent, canActivate: [roleGuard(['ADMIN', 'MANAGER', 'STAFF'])], data: { title: 'Reports & Analytics' } }
    ]
  },
  { path: '**', redirectTo: '' }
];

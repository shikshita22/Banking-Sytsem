import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-container wide">
        <div class="auth-logo">
          <div class="logo-icon">
            <span class="material-icons-round">account_balance</span>
          </div>
          <h1>ILPBank</h1>
          <p>Create your banking account</p>
        </div>
        <div class="auth-card fade-up">
          <h2>Customer Registration</h2>
          <p>Fill in your details to open a new account</p>

          <div *ngIf="registrationSuccess" class="registration-success card card-flat p-md mt-md fade-up" role="status" aria-live="polite">
            <div class="flex items-center gap-sm">
              <span class="material-icons-round text-success">check_circle</span>
              <div>
                <strong>Account created successfully!</strong>
                <div class="form-hint">{{ registrationMessage }}</div>
                <div class="form-hint">Redirecting you to the login page...</div>
              </div>
            </div>
          </div>

          <div *ngIf="registrationError" class="card card-flat p-md mt-md fade-up" role="alert">
            <div class="flex items-center gap-sm">
              <span class="material-icons-round text-danger">error</span>
              <div>
                <strong>Registration failed</strong>
                <div class="form-hint">{{ registrationError }}</div>
              </div>
            </div>
          </div>

          <div class="stepper">
            <div class="step" [ngClass]="{ 'active': currentStep === 1, 'completed': currentStep > 1 }">
              <div class="step-circle">1</div>
              <span class="step-label">Personal</span>
            </div>
            <div class="step-line" [ngClass]="{ 'completed': currentStep > 1 }"></div>
            <div class="step" [ngClass]="{ 'active': currentStep === 2, 'completed': currentStep > 2 }">
              <div class="step-circle">2</div>
              <span class="step-label">Identity</span>
            </div>
            <div class="step-line" [ngClass]="{ 'completed': currentStep > 2 }"></div>
            <div class="step" [ngClass]="{ 'active': currentStep === 3 }">
              <div class="step-circle">3</div>
              <span class="step-label">Account</span>
            </div>
          </div>

          <form (ngSubmit)="onSubmit()" autocomplete="off">
            <!-- Step 1: Personal Details -->
            <div *ngIf="currentStep === 1" class="form-step fade-up">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">First Name <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-icon"><span class="material-icons-round">person</span></span>
                    <input type="text" class="form-control" name="firstName" [(ngModel)]="formData.firstName" placeholder="Enter first name" required>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Last Name <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-icon"><span class="material-icons-round">person</span></span>
                    <input type="text" class="form-control" name="lastName" [(ngModel)]="formData.lastName" placeholder="Enter last name" required>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Date of Birth <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-icon"><span class="material-icons-round">cake</span></span>
                  <input type="date" class="form-control" name="dateOfBirth" [(ngModel)]="formData.dateOfBirth" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Email Address <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-icon"><span class="material-icons-round">email</span></span>
                    <input type="email" class="form-control" name="email" [(ngModel)]="formData.email" placeholder="your.name@tcs.com" required>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Mobile Number <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-icon"><span class="material-icons-round">phone</span></span>
                    <input type="tel" class="form-control" name="phone" [(ngModel)]="formData.phone" placeholder="9876543210" required>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Address Line 1 <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-icon"><span class="material-icons-round">home</span></span>
                  <input type="text" class="form-control" name="addressLine1" [(ngModel)]="formData.addressLine1" placeholder="House no, street, or building" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Landmark / Locality</label>
                <div class="input-group">
                  <span class="input-icon"><span class="material-icons-round">location_on</span></span>
                  <input type="text" class="form-control" name="addressLine2" [(ngModel)]="formData.addressLine2" placeholder="Colony, landmark, or area">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">City <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" name="city" [(ngModel)]="formData.city" placeholder="City" required>
                </div>
                <div class="form-group">
                  <label class="form-label">State <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" name="state" [(ngModel)]="formData.state" placeholder="State" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Pincode <span class="text-danger">*</span></label>
                <input type="text" class="form-control" name="pincode" [(ngModel)]="formData.pincode" placeholder="6-digit PIN code" maxlength="6" required>
              </div>
            </div>

            <!-- Step 2: Identity Documents -->
            <div *ngIf="currentStep === 2" class="form-step fade-up">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">PAN Number</label>
                  <div class="input-group">
                    <span class="input-icon"><span class="material-icons-round">badge</span></span>
                    <input type="text" class="form-control" name="pan" [(ngModel)]="formData.pan" placeholder="ABCDE1234F">
                  </div>
                  <div class="form-hint">Format: 5 letters + 4 digits + 1 letter</div>
                </div>
                <div class="form-group">
                  <label class="form-label">Aadhaar Number</label>
                  <div class="input-group">
                    <span class="input-icon"><span class="material-icons-round">fingerprint</span></span>
                    <input type="text" class="form-control" name="aadhaar" [(ngModel)]="formData.aadhaar" placeholder="1234 5678 9012">
                  </div>
                  <div class="form-hint">Enter 12-digit Aadhaar number</div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Passport Number (Optional)</label>
                <div class="input-group">
                  <span class="input-icon"><span class="material-icons-round">flight</span></span>
                  <input type="text" class="form-control" name="passport" [(ngModel)]="formData.passport" placeholder="A1234567">
                </div>
              </div>
            </div>

            <!-- Step 3: Account Setup -->
            <div *ngIf="currentStep === 3" class="form-step fade-up">
              <div class="form-group">
                <label class="form-label">Account Type <span class="text-danger">*</span></label>
                <select class="form-select" name="accountType" [(ngModel)]="formData.accountType" required>
                  <option value="SAVINGS">Savings Account</option>
                  <option value="CURRENT">Current Account</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Nominee Name (Optional)</label>
                <div class="input-group">
                  <span class="input-icon"><span class="material-icons-round">people</span></span>
                  <input type="text" class="form-control" name="nominee" [(ngModel)]="formData.nominee" placeholder="Enter nominee full name">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Password <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-icon"><span class="material-icons-round">lock</span></span>
                  <input type="password" class="form-control" name="password" [(ngModel)]="formData.password" placeholder="Create a strong password" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Confirm Password <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-icon"><span class="material-icons-round">lock_reset</span></span>
                  <input type="password" class="form-control" name="confirmPassword" [(ngModel)]="formData.confirmPassword" placeholder="Re-enter your password" required>
                </div>
              </div>

              <div class="card card-flat p-md mt-md">
                <label class="form-check">
                  <input type="checkbox" name="terms" [(ngModel)]="formData.terms">
                  I agree to the Terms & Conditions and Privacy Policy
                </label>
              </div>
            </div>

            <div class="flex justify-between mt-xl">
              <button type="button" class="btn btn-secondary" *ngIf="currentStep > 1" (click)="prevStep()">
                <span class="material-icons-round">arrow_back</span> Previous
              </button>
              <div style="flex:1"></div>
              <button type="button" class="btn btn-primary" *ngIf="currentStep < 3" (click)="nextStep()">
                Next <span class="material-icons-round">arrow_forward</span>
              </button>
              <button type="submit" class="btn btn-success btn-lg" *ngIf="currentStep === 3" [disabled]="isSubmitting">
                <span class="material-icons-round" [ngClass]="{ 'spin': isSubmitting }">{{ isSubmitting ? 'sync' : 'how_to_reg' }}</span>
                {{ isSubmitting ? 'Creating Account...' : 'Create Account' }}
              </button>
            </div>
          </form>

          <div class="auth-footer">
            Already have an account? <a routerLink="/login">Sign In</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  currentStep = 1;
  isSubmitting = false;
  registrationSuccess = false;
  registrationMessage = '';
  registrationError = '';

  formData = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    pan: '',
    aadhaar: '',
    passport: '',
    accountType: 'SAVINGS',
    nominee: '',
    password: '',
    confirmPassword: '',
    terms: false
  };

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private modalService: ModalService,
    private router: Router
  ) {}

  nextStep() {
    if (this.currentStep === 1) {
      if (!this.formData.firstName || !this.formData.lastName || !this.formData.email || !this.formData.phone || !this.formData.addressLine1 || !this.formData.city || !this.formData.state || !this.formData.pincode) {
        this.toastService.error('Error', 'Please fill all required personal and address details');
        return;
      }
      if (!/^[1-9][0-9]{5}$/.test(this.formData.pincode)) {
        this.toastService.error('Error', 'Please enter a valid 6-digit PIN code');
        return;
      }
    }
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  async onSubmit() {
    this.registrationError = '';

    if (this.formData.password !== this.formData.confirmPassword) {
      this.registrationError = 'Passwords do not match.';
      return;
    }
    if (!this.formData.terms) {
      this.registrationError = 'Please accept the Terms & Conditions.';
      return;
    }

    this.isSubmitting = true;

    try {
      const result = await this.authService.register(this.formData);

      if (result.success && result.user) {
        this.registrationSuccess = true;
        this.registrationMessage = `Your User ID is ${result.user.userId} and Account No is ${result.accountId || 'being processed'}. Your account is pending approval.`;

        // Give the user time to see the success confirmation, then return to login.
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1800);
      } else {
        this.registrationError = result.error || 'Unable to create the account. Please check the entered details and try again.';
        this.isSubmitting = false;
      }
    } catch (error) {
      this.registrationError = 'Unable to create the account right now. Please try again.';
      this.isSubmitting = false;
    }
  }
}

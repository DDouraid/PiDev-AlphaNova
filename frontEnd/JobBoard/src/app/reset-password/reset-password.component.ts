// frontend/src/app/components/reset-password/reset-password.component.ts
import { Component } from '@angular/core';
import { AuthService } from 'src/services/auth.service';
import { MessageResponse } from 'src/models/message-response';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  step: 'request-otp' | 'reset-password' = 'request-otp';
  email: string = '';
  otp: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService) {}

  onRequestOtp(): void {
    if (!this.email) {
      this.errorMessage = 'Please enter your email.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.requestOtp({ email: this.email }).subscribe({
      next: (response: MessageResponse) => {
        this.successMessage = response.message;
        this.step = 'reset-password';
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Error requesting OTP.';
        this.isLoading = false;
      }
    });
  }

  onResetPassword(): void {
    if (!this.otp || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resetPassword({
      email: this.email,
      otp: this.otp,
      newPassword: this.newPassword
    }).subscribe({
      next: (response: MessageResponse) => {
        this.successMessage = response.message;
        this.isLoading = false;
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Error resetting password.';
        this.isLoading = false;
      }
    });
  }
}

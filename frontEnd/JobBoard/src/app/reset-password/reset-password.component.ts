// frontend/src/app/components/reset-password/reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/services/auth.service';
import { MessageResponse } from 'src/models/message-response';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  step: 'request-otp' | 'reset-password' = 'request-otp';
  email: string = '';
  otp: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  currentSlide = 0;
  currentYear = new Date().getFullYear(); // Add currentYear for footer

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.startSlider();
  }

  startSlider() {
    setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % 3; // Assuming 3 images
      const slides = document.querySelectorAll('.slide');
      slides.forEach((slide: Element, index) => {
        slide.classList.remove('active');
        if (index === this.currentSlide) {
          slide.classList.add('active');
        }
      });
    }, 5000);
  }

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

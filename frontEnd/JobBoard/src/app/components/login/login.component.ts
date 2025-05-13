// frontend/src/app/components/login/login.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { LoginRequest } from 'src/models/login-request';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginRequest: LoginRequest = { username: '', password: '' };
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  currentYear = new Date().getFullYear();
  currentSlide = 0;

  @ViewChild('loginForm') loginForm!: NgForm;

  constructor(private authService: AuthService, public router: Router) {}

  ngOnInit(): void {
    this.startSlider();
  }

  startSlider() {
    setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % 3;
      const slides = document.querySelectorAll('.slide');
      slides.forEach((slide: Element, index) => {
        slide.classList.remove('active');
        if (index === this.currentSlide) {
          slide.classList.add('active');
        }
      });
    }, 5000);
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.form.markAllAsTouched();
      this.errorMessage = 'Please fix the form errors before submitting.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.authService.login(this.loginRequest).subscribe({
      next: (response) => {
        this.successMessage = 'Login successful!';
        this.errorMessage = '';
        this.isLoading = false;
        const isBlocked = this.authService.getIsBlocked();
        if (isBlocked) {
          this.errorMessage = 'Login failed: Your account has been blocked. Contact support for assistance.';
          console.warn('Account blocked detected from token:', isBlocked);
          this.successMessage = '';
        } else {
          setTimeout(() => {
            if (this.authService.hasRole('ADMIN')) {
              this.router.navigate(['/dashboard']);
            } else if (this.authService.hasRole('STUDENT')) {
              this.router.navigate(['/customize-profile']);
            } else {
              this.router.navigate(['/home']);
            }
          }, 1000);
        }
      },
      error: (err) => {
        this.isLoading = false;
        const errorMsg = err.message || 'Login failed: Unknown error';
        console.log('Login error received:', errorMsg);
        if (errorMsg.includes('Your account has been blocked')) {
          this.errorMessage = errorMsg;
          console.warn('Account blocked:', errorMsg);
        } else {
          this.errorMessage = errorMsg;
        }
        this.successMessage = '';
      }
    });
  }

//////////////////////////////////////////////////////////////////////////////////////////////////////
loginWithLinkedIn() {
  this.isLoading = true;
  console.log('Login with LinkedIn clicked');
  const clientId = '77ip9kskqvd40o'; // Replace with your Client ID
  const redirectUri = 'http://localhost:4200/auth/callback';
  const scope = 'openid profile email';
  const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
  window.location.href = linkedInAuthUrl;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
  loginWithGitHub() {
    this.isLoading = true;
    console.log('Login with GitHub clicked');
    const clientId = 'Ov23liyPX428Fh4qo4fW'; // Ensure this matches your GitHub app
    const redirectUri = 'http://localhost:8088/api/auth/github-callback'; // Must match GitHub app settings
    const scope = 'user:email';
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
    window.location.href = githubAuthUrl;
  }

//////////////////////////////////////////////////////////////////////////////////////////////////////
}

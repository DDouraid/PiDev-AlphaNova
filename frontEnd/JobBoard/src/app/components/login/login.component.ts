import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { LoginRequest } from 'src/models/login-request';

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

  constructor(private authService: AuthService, public router: Router) {}

  ngOnInit(): void {
    // Optional: Auto-slide images every 5 seconds
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

  onSubmit() {
    this.isLoading = true;
    this.authService.login(this.loginRequest).subscribe({
      next: (response) => {
        this.successMessage = 'Login successful!';
        this.errorMessage = '';
        this.isLoading = false;
        setTimeout(() => {
          if (this.authService.hasRole('ADMIN')) {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/home']);
          }
        }, 1000);
      },
      error: (err) => {
        this.errorMessage = 'Login failed: ' + (err.error.message || 'Unknown error');
        this.successMessage = '';
        this.isLoading = false;
      }
    });
  }

  loginWithLinkedIn() {
    this.isLoading = true;
    console.log('Login with LinkedIn clicked');
    window.location.href = 'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=77ip9kskqvd40o&redirect_uri=http://localhost:4200/auth/callback&scope=r_liteprofile%20r_emailaddress';
  }

  loginWithGoogle() {
    this.isLoading = true;
    console.log('Login with Google clicked');
    window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=email%20profile';
  }
}

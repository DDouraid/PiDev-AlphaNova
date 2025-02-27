import { Component, OnInit, ViewChild } from '@angular/core';
import { SignupRequest } from 'src/models/signup-request';
import { AuthService } from 'src/services/auth.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  signupRequest: SignupRequest = { username: '', email: '', password: '', role: [] };
  errorMessage = '';
  successMessage = '';
  redirectMessage = '';
  isLoading = false;
  currentSlide = 0;
  countdown = 5;

  @ViewChild('registerForm') registerForm!: NgForm;

  constructor(private authService: AuthService, private router: Router) {}

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

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.form.markAllAsTouched(); // Highlight all invalid fields
      this.errorMessage = 'Please fix the form errors before submitting.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.authService.register(this.signupRequest).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.errorMessage = '';
        this.isLoading = false;
        this.startRedirectCountdown();
      },
      error: (err) => {
        this.errorMessage = 'Registration failed: ' + (err.error.message || 'Unknown error');
        this.successMessage = '';
        this.redirectMessage = '';
        this.isLoading = false;
      }
    });
  }

  startRedirectCountdown() {
    this.redirectMessage = `Redirecting to login page in ${this.countdown} seconds...`;
    const timer = setInterval(() => {
      this.countdown--;
      this.redirectMessage = `Redirecting to login page in ${this.countdown} seconds...`;
      if (this.countdown <= 0) {
        clearInterval(timer);
        this.router.navigate(['/login']);
        this.redirectMessage = '';
        this.successMessage = '';
        this.countdown = 5; // Reset countdown
      }
    }, 1000); // Update every second
  }

  onRoleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.signupRequest.role = target.value.split(',').map((role: string) => role.trim());
    }
  }

  registerWithGoogle() {
    this.isLoading = true;
    console.log('Register with Google clicked');
    window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=http://localhost:4200/auth/register-callback&scope=email%20profile';
  }

  registerWithGitHub() {
    this.isLoading = true;
    console.log('Register with GitHub clicked');
    window.location.href = 'https://github.com/login/oauth/authorize?client_id=YOUR_GITHUB_CLIENT_ID&redirect_uri=http://localhost:4200/auth/register-callback&scope=user:email';
  }
}

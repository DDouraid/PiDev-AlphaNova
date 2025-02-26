import { Component, OnInit, HostListener } from '@angular/core';
import { SignupRequest } from 'src/models/signup-request';
import { AuthService } from 'src/services/auth.service';
import { Router } from '@angular/router';

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
  isLoading = false; // Add loading state
  currentSlide = 0;
  countdown = 5; // Countdown timer in seconds

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
      this.signupRequest.role = target.value.split(',').map(role => role.trim()); // Trim whitespace
    }
  }
}

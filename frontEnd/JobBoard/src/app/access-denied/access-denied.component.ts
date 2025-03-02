// frontend/src/app/components/access-denied/access-denied.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.css']
})
export class AccessDeniedComponent implements OnInit, OnDestroy {
  countdown: number = 5; // 5 seconds countdown
  private timer: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Start countdown timer
    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.clearTimer();
        this.router.navigate(['/home']);
      }
    }, 1000);

    // Play sound effect (optional)
    this.playDeniedSound();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  goToHome(): void {
    this.clearTimer();
    this.router.navigate(['/home']);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private playDeniedSound(): void {
    // Optional: Play a sound effect when the page loads
    const audio = new Audio('assets/sounds/denied.mp3'); // Add your sound file to assets/sounds/
    audio.play().catch(err => {
      console.error('Error playing denied sound:', err);
    });
  }
}

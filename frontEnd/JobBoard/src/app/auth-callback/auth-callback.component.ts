import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';

@Component({
  selector: 'app-auth-callback',
  template: `<p>Logging in...</p>`,
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const authCode = params['code'];
      if (authCode) {
        this.authService.exchangeLinkedInCode(authCode).subscribe({
          next: (response) => {
            console.log('LinkedIn login successful', response);
            this.router.navigate(['/home']);
          },
          error: (err) => {
            console.error('LinkedIn login failed', err);
            this.router.navigate(['/login']);
          }
        });
      }
    });
  }
}

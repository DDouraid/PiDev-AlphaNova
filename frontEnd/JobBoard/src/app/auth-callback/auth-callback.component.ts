// frontend/src/app/components/auth-callback/auth-callback.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-auth-callback',
  template: `<p>Processing authentication...</p>`
})
export class AuthCallbackComponent implements OnInit, OnDestroy {
  private queryParamsSub: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.queryParamsSub = this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        console.log('GitHub callback received token:', token);
        this.authService.setTokenDirectly(token);
        this.authService.getCurrentUserFromServer().subscribe({
          next: (response) => {
            console.log('User info fetched after GitHub login:', response);
            this.navigateBasedOnRole(response.roles);
          },
          error: (err) => {
            console.error('Error fetching user info after GitHub login:', err);
            this.router.navigate(['/login'], { queryParams: { error: 'auth_failed' } });
          }
        });
      } else {
        console.error('No token found in GitHub callback URL:', window.location.href);
        this.router.navigate(['/login'], { queryParams: { error: 'no_token' } });
      }
    });
    this.queryParamsSub = this.route.queryParams.subscribe(params => {
      const code = params['code'];
      if (code) {
        console.log('LinkedIn callback received code:', code);
        this.authService.exchangeLinkedInCode(code).subscribe({
          next: (response) => {
            console.log('LinkedIn login response:', response);
            this.navigateBasedOnRole(response.roles);
          },
          error: (err) => {
            console.error('Error during LinkedIn login:', err);
            this.router.navigate(['/login'], { queryParams: { error: 'auth_failed' } });
          }
        });
      } else {
        console.error('No code found in LinkedIn callback URL:', window.location.href);
        this.router.navigate(['/login'], { queryParams: { error: 'no_code' } });
      }
    });
  }

  private navigateBasedOnRole(roles: string[]): void {
    if (roles.includes('ADMIN')) {
      this.router.navigate(['/dashboard']);
    } else if (roles.includes('STUDENT')) {
      this.router.navigate(['/customize-profile']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  ngOnDestroy(): void {
    if (this.queryParamsSub) {
      this.queryParamsSub.unsubscribe();
    }
  }
}
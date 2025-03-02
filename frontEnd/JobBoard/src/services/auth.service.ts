// frontend/src/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoginRequest } from '../models/login-request';
import { SignupRequest } from '../models/signup-request';
import { JwtResponse } from '../models/jwt-response';
import { MessageResponse } from '../models/message-response';
import { CvData } from 'src/models/cv-data';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authApiUrl = 'http://localhost:8088/api/auth';
  private dashboardApiUrl = 'http://localhost:8088/api/dashboard';
  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('token'));

  constructor(private http: HttpClient) {
    console.log('AuthService initialized, initial token:', this.tokenSubject.value);
  }

  exchangeLinkedInCode(authCode: string): Observable<any> {
    const url = 'https://api.linkedin.com/v2/oauth2/token';
    const body = {
      grant_type: 'authorization_code',
      code: authCode,
      redirect_uri: 'YOUR_REDIRECT_URI',
      client_id: 'YOUR_CLIENT_ID',
      client_secret: 'YOUR_CLIENT_SECRET'
    };
    return this.http.post<any>(url, body);
  }

  login(loginRequest: LoginRequest): Observable<JwtResponse> {
    console.log('Login request:', loginRequest);
    return this.http.post<JwtResponse>(`${this.authApiUrl}/signin`, loginRequest).pipe(
      tap((response: JwtResponse) => {
        console.log('Login response:', response);
        if (response && response.accessToken) {
          localStorage.setItem('token', response.accessToken);
          this.tokenSubject.next(response.accessToken);
          console.log('Token stored:', response.accessToken);
        } else {
          console.error('No accessToken in login response:', response);
          throw new Error('No accessToken received from server');
        }
      }),
      catchError(err => {
        console.error('Login error:', err);
        const errorMessage = err.error?.message || 'Login failed: Unknown error';
        if (errorMessage.includes('Your account has been blocked')) {
          console.warn('Account blocked detected:', errorMessage);
          return throwError(() => new Error('Login failed: Your account has been blocked. Contact support for assistance.'));
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getIsBlocked(): boolean {
    const token = this.getToken();
    if (token && this.validateToken(token)) {
      const payload = this.parseJwt(token);
      return payload?.isBlocked === 1 || payload?.is_blocked === 1 || false;
    }
    return false;
  }

  register(signupRequest: SignupRequest): Observable<MessageResponse> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });
    return this.http.post<MessageResponse>(`${this.authApiUrl}/signup`, signupRequest, { headers }).pipe(
      tap(response => console.log('User registered:', response)),
      catchError(err => {
        console.error('Error registering user:', err);
        return throwError(() => new Error('Failed to register user: ' + (err.message || 'Unknown error')));
      })
    );
  }

  logout(): void {
    console.log('Logout called, removing token');
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const isValid = !!token && this.validateToken(token);
    console.log('isLoggedIn check - Token:', token, 'Valid:', isValid);
    return isValid;
  }

  getToken(): string | null {
    const token = this.tokenSubject.value || localStorage.getItem('token');
    console.log('getToken called, retrieved:', token);
    return token;
  }

  getCurrentUserFromServer(): Observable<JwtResponse> {
    const token = this.getToken();
    if (!token || !this.validateToken(token)) {
      console.error('Cannot fetch user: Invalid or missing token:', token);
      return throwError(() => new Error('Invalid or missing token'));
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    console.log('Fetching current user with token:', token);
    return this.http.get<JwtResponse>(`${this.authApiUrl}/me`, { headers }).pipe(
      tap(response => console.log('Current user response:', response)),
      catchError(err => {
        console.error('Error fetching current user:', err);
        return throwError(() => new Error('Failed to fetch user: ' + (err.message || 'Unknown error')));
      })
    );
  }

  private validateToken(token: string | null): boolean {
    if (!token || token.split('.').length !== 3) {
      console.error('Token validation failed: Incorrect format', token);
      return false;
    }
    console.log('Token validated successfully:', token);
    return true;
  }

  getRoles(): string[] {
    const token = this.getToken();
    if (token && this.validateToken(token)) {
      const payload = this.parseJwt(token);
      return payload?.roles || [];
    }
    return [];
  }

  getUserDetailsFromToken(token: string): { username: string; email: string; roles: string[] } | null {
    try {
      const payload = this.parseJwt(token);
      return {
        username: payload.sub || '',
        email: payload.email || '',
        roles: payload.roles || []
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  private parseJwt(token: string): any {
    if (!token || !this.validateToken(token)) return {};
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to parse JWT:', error);
      return {};
    }
  }

  blockUser(userId: number): Observable<MessageResponse> {
    const token = this.getToken();
    if (!token || !this.validateToken(token)) {
      console.error('Invalid or missing token for block request:', token);
      return throwError(() => new Error('Invalid or missing token'));
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    console.log('Blocking user:', userId);
    return this.http.put<MessageResponse>(`${this.dashboardApiUrl}/users/${userId}/block`, {}, { headers }).pipe(
      tap(response => {
        console.log('User blocked/unblocked response:', response);
      }),
      catchError(err => {
        console.error('Error blocking user:', err);
        return throwError(() => new Error('Failed to block user: ' + (err.message || 'Unknown error')));
      })
    );
  }

  getCurrentUser(): { username: string; email: string; roles: string[] } | null {
    const token = this.getToken();
    return token && this.validateToken(token) ? this.getUserDetailsFromToken(token) : null;
  }

  hasRole(role: string): boolean {
    const roles = this.getRoles();
    return roles.includes(role.toUpperCase());
  }

  getRegisteredUsers(): Observable<{ isBlocked: boolean; id: number; username: string; email: string; roles: string[] }[]> {
    const token = this.getToken();
    if (!token || !this.validateToken(token)) {
      console.error('Cannot fetch users: Invalid or missing token:', token);
      return throwError(() => new Error('Invalid or missing token'));
    }
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<{ isBlocked: boolean; id: number; username: string; email: string; roles: string[] }[]>(`${this.dashboardApiUrl}/users?t=${new Date().getTime()}`, { headers }).pipe(
      tap(users => {
        console.log('Registered users response:', users);
        users.forEach(user => console.log(`User ${user.username} isBlocked: ${user.isBlocked}`));
      }),
      catchError(err => {
        console.error('Error fetching users:', err);
        return throwError(() => new Error('Failed to fetch users'));
      })
    );
  }

  updateUserProfile(updateProfileRequest: { username?: string; email?: string; roles?: string[] }): Observable<MessageResponse> {
    const token = this.getToken();
    if (!token || !this.validateToken(token)) {
      console.error('Invalid or missing token for update profile request:', token);
      return throwError(() => new Error('Invalid or missing token'));
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    console.log('Updating profile with data:', updateProfileRequest);
    return this.http.put<MessageResponse>(`${this.authApiUrl}/profile`, updateProfileRequest, { headers }).pipe(
      tap(response => console.log('Profile update response:', response)),
      catchError(err => {
        console.error('Error updating profile:', err);
        return throwError(() => new Error('Failed to update profile: ' + (err.message || 'Unknown error')));
      })
    );
  }

  uploadProfileImage(image: File): Observable<MessageResponse> {
    const token = this.getToken();
    if (!token || !this.validateToken(token)) {
      console.error('Invalid or missing token for image upload request:', token);
      return throwError(() => new Error('Invalid or missing token'));
    }
    const formData = new FormData();
    formData.append('image', image);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    console.log('Uploading profile image:', image.name);
    return this.http.post<MessageResponse>(`${this.authApiUrl}/profile/image`, formData, { headers }).pipe(
      tap(response => console.log('Image upload response:', response)),
      catchError(err => {
        console.error('Error uploading image:', err);
        return throwError(() => new Error('Failed to upload image: ' + (err.message || 'Unknown error')));
      })
    );
  }

  uploadCV(cv: File): Observable<MessageResponse> {
    const token = this.getToken();
    if (!token || !this.validateToken(token)) {
      console.error('Invalid or missing token for CV upload request:', token);
      return throwError(() => new Error('Invalid or missing token'));
    }
    const formData = new FormData();
    formData.append('cv', cv);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    console.log('Uploading CV:', cv.name);
    return this.http.post<MessageResponse>(`${this.authApiUrl}/profile/cv`, formData, { headers }).pipe(
      tap(response => console.log('CV upload response:', response)),
      catchError(err => {
        console.error('Error uploading CV:', err);
        return throwError(() => new Error('Failed to upload CV: ' + (err.message || 'Unknown error')));
      })
    );
  }

  updateUser(userId: number, userData: { username: string; email: string; roles: string[] }): Observable<MessageResponse> {
    const token = this.getToken();
    if (!token || !this.validateToken(token)) {
      console.error('Invalid or missing token for update request:', token);
      return throwError(() => new Error('Invalid or missing token'));
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    console.log('Updating user:', userId, userData);
    return this.http.put<MessageResponse>(`${this.dashboardApiUrl}/users/${userId}`, userData, { headers }).pipe(
      tap(response => console.log('User updated:', response)),
      catchError(err => {
        console.error('Error updating user:', err);
        return throwError(() => new Error('Failed to update user: ' + (err.message || 'Unknown error')));
      })
    );
  }

  deleteUser(userId: number): Observable<MessageResponse> {
    const token = this.getToken();
    if (!token || !this.validateToken(token)) {
      console.error('Invalid or missing token for delete request:', token);
      return throwError(() => new Error('Invalid or missing token'));
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    console.log('Deleting user:', userId);
    return this.http.delete<MessageResponse>(`${this.dashboardApiUrl}/users/${userId}`, { headers }).pipe(
      tap(response => console.log('User deleted:', response)),
      catchError(err => {
        console.error('Error deleting user:', err);
        return throwError(() => new Error('Failed to delete user: ' + (err.message || 'Unknown error')));
      })
    );
  }

  saveCV(cvData: CvData): Observable<MessageResponse> {
    const token = this.getToken();
    if (!token || !this.validateToken(token)) {
      console.error('Invalid or missing token for saveCV request:', token);
      return throwError(() => new Error('Invalid or missing token'));
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    console.log('Saving CV with data:', cvData);
    return this.http.post<MessageResponse>(`${this.dashboardApiUrl}/cv`, cvData, { headers }).pipe(
      tap(response => console.log('CV saved:', response)),
      catchError(err => {
        console.error('Error saving CV:', err);
        return throwError(() => new Error('Failed to save CV: ' + (err.message || 'Unknown error')));
      })
    );
  }

  getStats(): Observable<{ totalUsers: number; adminCount: number }> {
    const token = this.getToken();
    if (!token || !this.validateToken(token)) {
      console.error('Cannot fetch stats: Invalid or missing token:', token);
      return throwError(() => new Error('Invalid or missing token'));
    }
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<{ totalUsers: number; adminCount: number }>(`${this.dashboardApiUrl}/stats`, { headers }).pipe(
      tap(stats => console.log('Stats response:', stats)),
      catchError(err => {
        console.error('Error fetching stats:', err);
        return throwError(() => new Error('Failed to fetch stats'));
      })
    );
  }



  requestOtp(request: { email: string }): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.authApiUrl}/request-otp`, request).pipe(
      tap(response => console.log('Request OTP response:', response)),
      catchError(err => {
        console.error('Error requesting OTP:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to request OTP'));
      })
    );
  }

  resetPassword(request: { email: string; otp: string; newPassword: string }): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.authApiUrl}/reset-password`, request).pipe(
      tap(response => console.log('Reset password response:', response)),
      catchError(err => {
        console.error('Error resetting password:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to reset password'));
      })
    );
  }
}

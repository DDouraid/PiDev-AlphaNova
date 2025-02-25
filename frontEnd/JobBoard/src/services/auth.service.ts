import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoginRequest } from '../models/login-request';
import { SignupRequest } from '../models/signup-request';
import { JwtResponse } from '../models/jwt-response';
import { MessageResponse } from '../models/message-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authApiUrl = 'http://localhost:8088/api/auth'; // For authentication endpoints
  private dashboardApiUrl = 'http://localhost:8088/api/dashboard'; // For dashboard endpoints
  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('token'));

  constructor(private http: HttpClient) {
    console.log('AuthService initialized, initial token:', this.tokenSubject.value);
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
        return throwError(() => new Error('Login failed: ' + (err.error?.message || 'Unknown error')));
      })
    );
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

  // Existing methods (unchanged)
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

  getCurrentUser(): { username: string; email: string; roles: string[] } | null {
    const token = this.getToken();
    return token && this.validateToken(token) ? this.getUserDetailsFromToken(token) : null;
  }

  hasRole(role: string): boolean {
    const roles = this.getRoles();
    return roles.includes(role.toUpperCase());
  }

  // CRUD methods using /api/dashboard
  getRegisteredUsers(): Observable<{ id: number; username: string; email: string; roles: string[] }[]> {
    const token = this.getToken();
    if (!token || !this.validateToken(token)) {
      console.error('Cannot fetch users: Invalid or missing token:', token);
      return throwError(() => new Error('Invalid or missing token'));
    }
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<{ id: number; username: string; email: string; roles: string[] }[]>(`${this.dashboardApiUrl}/users`, { headers }).pipe(
      tap(users => console.log('Registered users response:', users)),
      catchError(err => {
        console.error('Error fetching users:', err);
        return throwError(() => new Error('Failed to fetch users'));
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

  // Example stats method (adjust as needed)
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
}

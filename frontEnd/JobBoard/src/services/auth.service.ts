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
  private tokenSubject = new BehaviorSubject<string | null>(null); // Store raw token string

  constructor(private http: HttpClient) {
    const storedToken = localStorage.getItem('jwtToken');
    if (storedToken) {
      this.tokenSubject.next(storedToken);
    }
    console.log('AuthService initialized, initial token:', this.tokenSubject.value);
  }

  login(loginRequest: LoginRequest): Observable<JwtResponse> {
    console.log('Login request:', loginRequest);
    return this.http.post<JwtResponse>(`${this.authApiUrl}/signin`, loginRequest).pipe(
      tap((response: JwtResponse) => {
        console.log('Login response:', response);
        if (response?.accessToken) {
          this.setToken(response.accessToken); // Stores token
          localStorage.setItem('userId', response.id.toString());
          console.log('Token stored from login:', response.accessToken);
        } else {
          console.error('No token in login response');
          throw new Error('No token received from server');
        }
      }),
      catchError(err => {
        console.error('Login error:', err);
        const errorMessage = err.error?.message || 'Login failed: Unknown error';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  register(signupRequest: SignupRequest): Observable<MessageResponse> {
    const token = this.getToken();
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
    return this.http.post<MessageResponse>(`${this.authApiUrl}/signup`, signupRequest, { headers }).pipe(
      tap(response => console.log('User registered:', response)),
      catchError(err => {
        console.error('Error registering user:', err);
        return throwError(() => new Error('Failed to register user: ' + (err.message || 'Unknown error')));
      })
    );
  }

  registerWithAvatar(signupRequest: SignupRequest, avatar: File | null): Observable<MessageResponse> {
    const formData = new FormData();
    formData.append('signupRequest', new Blob([JSON.stringify(signupRequest)], { type: 'application/json' }));
    if (avatar) {
      formData.append('avatar', avatar);
    }
    const token = this.getToken();
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
    return this.http.post<MessageResponse>(`${this.authApiUrl}/signup`, formData, { headers }).pipe(
      tap(response => console.log('User registered with avatar:', response)),
      catchError(err => {
        console.error('Error registering user with avatar:', err);
        return throwError(() => new Error('Failed to register user: ' + (err.message || 'Unknown error')));
      })
    );
  }

  setToken(token: string): void {
    localStorage.setItem('jwtToken', token);
    this.tokenSubject.next(token);
    console.log('Token set in localStorage:', token);
  }

  setTokenDirectly(token: string): void {
    this.setToken(token); // Reuse setToken for consistency
  }

  getToken(): string | null {
    const token = this.tokenSubject.value;
    console.log('getToken retrieved:', token || 'null');
    return token;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const isValid = !!token && this.validateToken(token);
    console.log('isLoggedIn check - Token:', token || 'null', 'Valid:', isValid);
    return isValid;
  }

  logout(): void {
    console.log('Logout called, removing token');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userId');
    this.tokenSubject.next(null);
  }

  getCurrentUserFromServer(): Observable<JwtResponse> {
    const token = this.getToken(); // Retrieves token
    if (!token || !this.validateToken(token)) {
      console.error('Cannot fetch user: Invalid or missing token:', token);
      return throwError(() => new Error('Invalid or missing token'));
    }
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    console.log('Fetching current user with token:', token);
    return this.http.get<JwtResponse>(`${this.authApiUrl}/me`, { headers }).pipe(
      tap(response => console.log('Current user response:', response)),
      catchError(err => {
        console.error('Error fetching current user:', err);
        return throwError(() => new Error('Failed to fetch user: ' + (err.message || 'Unknown error')));
      })
    );
  }

  getIsBlocked(): boolean {
    const token = this.getToken();
    if (token && this.validateToken(token)) {
      const payload = this.parseJwt(token);
      return payload?.isBlocked === true || payload?.is_blocked === true || false;
    }
    return false;
  }

  private validateToken(token: string): boolean {
    if (!token || token.split('.').length !== 3) {
      console.error('Token validation failed: Incorrect format', token);
      return false;
    }
    try {
      const payload = this.parseJwt(token);
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      if (exp < now) {
        console.error('Token expired:', new Date(exp), 'Current time:', new Date(now));
        return false;
      }
      console.log('Token validated successfully:', token);
      return true;
    } catch (e) {
      console.error('Token validation failed:', e);
      return false;
    }
  }

  private parseJwt(token: string): any {
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

  getRoles(): string[] {
    const token = this.getToken();
    if (token && this.validateToken(token)) {
      const payload = this.parseJwt(token);
      return payload.roles || [];
    }
    return [];
  }

  hasRole(role: string): boolean {
    const roles = this.getRoles();
    return roles.includes(role.toUpperCase());
  }


  blockUser(userId: number): Observable<MessageResponse> {
    const token = this.getToken();
    if (!token || !this.validateToken(token)) {
      console.error('Invalid or missing token for block request:', token);
      return throwError(() => new Error('Invalid or missing token'));
    }
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    console.log('Blocking user:', userId);
    return this.http.put<MessageResponse>(`${this.dashboardApiUrl}/users/${userId}/block`, {}, { headers }).pipe(
      tap(response => console.log('User blocked/unblocked response:', response)),
      catchError(err => {
        console.error('Error blocking user:', err);
        return throwError(() => new Error('Failed to block user: ' + (err.message || 'Unknown error')));
      })
    );
  }
//////////////////////////////////////////////////////////////////////////////////////////////////////


CVtoBack(formData: FormData): Observable<MessageResponse> {
  const token = this.getToken();
  if (!token || !this.validateToken(token)) {
    console.error('Invalid or missing token for CVtoBack request:', token);
    return throwError(() => new Error('Invalid or missing token'));
  }
  const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  console.log('Sending CV to backend via CVtoBack');
  return this.http.post<MessageResponse>(`${this.authApiUrl}/profile/CVtoBack`, formData, { headers }).pipe(
    tap(response => console.log('CVtoBack response:', response)),
    catchError(err => {
      console.error('Error in CVtoBack:', err);
      return throwError(() => new Error('Failed to send CV to backend: ' + (err.message || 'Unknown error')));
    })
  );
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
  exchangeGitHubCode(code: string): Observable<JwtResponse> {
    const url = `${this.authApiUrl}/github-callback?code=${code}`;
    return this.http.get<JwtResponse>(url).pipe(
      tap(response => {
        console.log('GitHub token response:', response);
        if (response?.accessToken) {
          this.setToken(response.accessToken);
        } else {
          throw new Error('No token in GitHub response');
        }
      }),
      catchError(err => {
        console.error('Error exchanging GitHub code:', err);
        return throwError(() => new Error('Failed to authenticate with GitHub: ' + (err.message || 'Unknown error')));
      })
    );
  }
//////////////////////////////////////////////////////////////////////////////////////////////////////

// frontend/src/services/auth.service.ts
exchangeLinkedInCode(code: string): Observable<JwtResponse> {
  const url = `${this.authApiUrl}/linkedin-callback?code=${code}`;
  return this.http.post<JwtResponse>(url, {}).pipe(
    tap(response => {
      console.log('LinkedIn token response:', response);
      if (response?.accessToken) {
        this.setToken(response.accessToken);
      } else {
        throw new Error('No token in LinkedIn response');
      }
    }),
    catchError(err => {
      console.error('Error exchanging LinkedIn code:', err);
      return throwError(() => new Error('Failed to authenticate with LinkedIn: ' + (err.message || 'Unknown error')));
    })
  );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////

getCurrentUser(): { username: string; email: string; roles: string[]; profileImage?: string } | null {
  const token = this.getToken();
  if (token && this.validateToken(token)) {
    const payload = this.parseJwt(token);

    // Extract first and last names if available, otherwise fallback to username or sub
    const firstName = payload.given_name || '';
    const lastName = payload.family_name || '';
    const usernameFromPayload = payload.username || payload.sub || '';

    // Construct username as "LastName FirstName" if both are present, else use fallback
    const username = (lastName && firstName)
      ? `${lastName} ${firstName}`
      : (lastName || firstName || usernameFromPayload);

    return {
      username: username,
      email: payload.email || '',
      roles: payload.roles || [],
      profileImage: payload.profileImage || payload.picture || undefined // From JWT if present
    };
  }
  return null;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
  getRegisteredUsers(page: number = 0, size: number = 5, search: string = ''): Observable<PaginatedUserResponse> {
    const token = this.getToken();
    if (!token || !this.validateToken(token)) {
      console.error('Cannot fetch users: Invalid or missing token:', token);
      return throwError(() => new Error('Invalid or missing token'));
    }
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const url = `${this.authApiUrl}/users?page=${page}&size=${size}&search=${encodeURIComponent(search)}&t=${new Date().getTime()}`;
    return this.http.get<PaginatedUserResponse>(url, { headers }).pipe(
      tap(response => {
        console.log('Paginated users response:', response);
        response.users.forEach(user => console.log(`User ${user.username} isBlocked: ${user.isBlocked}`));
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
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
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
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
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
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
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
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
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
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
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
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
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

export interface PaginatedUserResponse {
  users: { isBlocked: boolean; id: number; username: string; email: string; roles: string[] }[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
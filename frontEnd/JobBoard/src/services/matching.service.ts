import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs'; // Import throwError
import { catchError } from 'rxjs/operators'; // Import catchError
import { MatchResult } from '../models/match-result';

@Injectable({
  providedIn: 'root',
})
export class MatchingService {
  private apiUrl = 'http://localhost:8082/api/matching';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    console.log('Sending token to Matching Service:', token);
    if (!token) {
      console.error('No token found in localStorage');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
  }

  matchCvWithOffers(): Observable<MatchResult[]> {
    const headers = this.getHeaders();
    console.log('Request headers:', headers);
    return this.http.get<MatchResult[]>(`${this.apiUrl}/match`, { headers });
  }

  getMapTilerApiKey(): Observable<string> {
    const url = `${this.apiUrl}/maptiler/key`; // Fix the URL syntax (use backticks for template literals)
    return this.http.get(url, { responseType: 'text' }).pipe(
      catchError((error) => {
        console.error('MapTiler API Key Fetch Error:', error);
        return throwError(() => new Error('Failed to fetch MapTiler API key'));
      })
    );
  }
}
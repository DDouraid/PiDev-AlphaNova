import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Interview } from 'src/models/interviewR.model';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {

  private apiUrl = '/api/api/interviews'; // Using proxy configuration

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getInterviews(): Observable<Interview[]> {
    return this.http.get<Interview[]>(this.apiUrl, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  addInterview(interview: Interview): Observable<Interview> {
    return this.http.post<Interview>(`${this.apiUrl}/addInter`, interview, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  deleteInterview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Interview Service Error:', error);
    const errorMsg = error.error?.message || error.message || 'Unknown error occurred';
    return throwError(() => new Error(errorMsg));
  }
}

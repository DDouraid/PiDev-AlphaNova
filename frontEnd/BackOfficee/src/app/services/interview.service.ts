import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Interview } from '../models/interview';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  scheduleInterview(requestId: number, interviewDate: string): Observable<Interview> {
    const payload = {
        requestId,
        interviewDate
    };
    return this.http.post<Interview>(`${this.baseUrl}/interviews`, payload).pipe(
        catchError(this.handleError('scheduleInterview'))
    );
}

  getInterviews(): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.baseUrl}/interviews`).pipe(
      catchError(this.handleError('getInterviews'))
    );
  }

  updateInterviewStatus(interviewId: number, status: 'SCHEDULED' | 'ACCEPTED' | 'REJECTED'): Observable<Interview> {
    return this.http.put<Interview>(`${this.baseUrl}/interviews/${interviewId}?status=${status}`, null).pipe(
      catchError(this.handleError('updateInterviewStatus'))
    );
  }

  sendEmail(id: number, status: string, interviewDate?: string): Observable<string> {
    const payload = { status, interviewDate };
    return this.http.post<string>(`${this.baseUrl}/interviews/${id}/email`, payload, { responseType: 'text' as 'json' }).pipe(
      catchError(this.handleError('sendEmail'))
    );
  }

  private handleError(operation: string) {
    return (error: any): Observable<never> => {
      console.error(`${operation} failed: ${error.message}`);
      return throwError(() => new Error(`${operation} failed: ${error.message}`));
    };
  }
  
}
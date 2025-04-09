import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { InternshipRequest } from '../models/internship-request';

@Injectable({
  providedIn: 'root'
})
export class InternshipRequestService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  getAllInternshipRequests(): Observable<InternshipRequest[]> {
    return this.http.get<InternshipRequest[]>(`${this.baseUrl}/internship-requests`).pipe(
      catchError(this.handleError('getAllInternshipRequests'))
    );
  }

  getInternshipRequestById(id: number): Observable<InternshipRequest> {
    return this.http.get<InternshipRequest>(`${this.baseUrl}/internship-requests/${id}`).pipe(
      catchError(this.handleError('getInternshipRequestById'))
    );
  }

  getRequestsByOfferId(offerId: number): Observable<InternshipRequest[]> {
    return this.http.get<InternshipRequest[]>(`${this.baseUrl}/internship-requests/by-offer/${offerId}`).pipe(
      catchError(this.handleError('getRequestsByOfferId'))
    );
  }

  createInternshipRequest(request: InternshipRequest): Observable<InternshipRequest>;
  createInternshipRequest(request: InternshipRequest, offerId: number): Observable<InternshipRequest>;
  createInternshipRequest(request: InternshipRequest, offerId?: number): Observable<InternshipRequest> {
    const formData = new FormData();
    formData.append('title', request.title || '');
    formData.append('description', request.description || '');
    formData.append('email', request.email || '');
    formData.append('type', request.type || '');
    if (request.cv) {
      formData.append('cv', request.cv, request.cv.name);
      console.log('Adding CV to FormData:', request.cv.name);
    } else {
      console.log('No CV to add to FormData.');
    }

    let url = `${this.baseUrl}/internship-requests`;
    if (offerId !== undefined) {
      console.log('Sending request to create with offerId:', offerId);
      url = `${this.baseUrl}/internship-requests/${offerId}`;
    } else {
      console.log('Sending request to create without offerId.');
    }

    return this.http.post<InternshipRequest>(url, formData).pipe(
      catchError(this.handleError('createInternshipRequest'))
    );
  }

  updateInternshipRequest(request: InternshipRequest): Observable<InternshipRequest> {
    if (!request.id) {
      throw new Error('Internship request ID is required for update');
    }

    const formData = new FormData();
    formData.append('title', request.title || '');
    formData.append('description', request.description || '');
    formData.append('email', request.email || '');
    formData.append('type', request.type || '');
    if (request.status) {
      formData.append('status', request.status);
    }
    if (request.cv) {
      formData.append('cv', request.cv, request.cv.name);
      console.log('Updating CV in FormData:', request.cv.name);
    }

    return this.http.put<InternshipRequest>(`${this.baseUrl}/internship-requests/${request.id}`, formData).pipe(
      catchError(this.handleError('updateInternshipRequest'))
    );
  }

  updateInternshipRequestStatus(id: number, status: string): Observable<InternshipRequest> {
    const formData = new FormData();
    formData.append('status', status);
    return this.http.put<InternshipRequest>(`${this.baseUrl}/internship-requests/${id}/status`, formData).pipe(
      catchError(this.handleError('updateInternshipRequestStatus'))
    );
  }

  deleteInternshipRequest(id: number): Observable<void> {
    if (!id) {
      throw new Error('Internship request ID is required for deletion');
    }

    return this.http.delete<void>(`${this.baseUrl}/internship-requests/${id}`).pipe(
      catchError(this.handleError('deleteInternshipRequest'))
    );
  }

  downloadCv(fileName: string): Observable<Blob> {
    if (!fileName) {
      throw new Error('File name is required to download CV');
    }

    return this.http.get(`${this.baseUrl}/internship-requests/cv/${fileName}`, { responseType: 'blob' }).pipe(
      catchError(this.handleError('downloadCv'))
    );
  }

  private handleError(operation: string) {
    return (error: any): Observable<never> => {
      console.error(`${operation} failed: ${error.message}`);
      return throwError(() => new Error(`${operation} failed: ${error.message}`));
    };
  }
}
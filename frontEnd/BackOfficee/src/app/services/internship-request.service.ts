import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InternshipRequest } from '../models/internship-request';

@Injectable({
  providedIn: 'root'
})
export class InternshipRequestService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  getAllInternshipRequests(): Observable<InternshipRequest[]> {
    return this.http.get<InternshipRequest[]>(`${this.baseUrl}/internship-requests`);
  }

  getInternshipRequestById(id: number): Observable<InternshipRequest> {
    return this.http.get<InternshipRequest>(`${this.baseUrl}/internship-requests/${id}`);
  }

  getRequestsByOfferId(offerId: number): Observable<InternshipRequest[]> {
    return this.http.get<InternshipRequest[]>(`${this.baseUrl}/internship-requests/by-offer/${offerId}`);
  }

  createInternshipRequest(request: InternshipRequest): Observable<InternshipRequest>;
  createInternshipRequest(request: InternshipRequest, offerId: number): Observable<InternshipRequest>;

  createInternshipRequest(request: InternshipRequest, offerId?: number): Observable<InternshipRequest> {
    const formData = new FormData();
    formData.append('title', request.title);
    formData.append('description', request.description);
    formData.append('email', request.email || ''); // Add email to FormData
    if (request.cv) {
      formData.append('cv', request.cv, request.cv.name);
      console.log('Adding CV to FormData:', request.cv.name);
    } else {
      console.log('No CV to add to FormData.');
    }

    if (offerId !== undefined) {
      console.log('Sending request to create with offerId:', offerId);
      return this.http.post<InternshipRequest>(`${this.baseUrl}/internship-requests/${offerId}`, formData);
    } else {
      console.log('Sending request to create without offerId.');
      return this.http.post<InternshipRequest>(`${this.baseUrl}/internship-requests`, formData);
    }
  }

  updateInternshipRequest(request: InternshipRequest): Observable<InternshipRequest> {
    const formData = new FormData();
    formData.append('title', request.title);
    formData.append('description', request.description);
    formData.append('email', request.email || ''); // Add email to FormData
    if (request.cv) {
      formData.append('cv', request.cv, request.cv.name);
    }
    return this.http.put<InternshipRequest>(`${this.baseUrl}/internship-requests/${request.id}`, formData);
  }

  deleteInternshipRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/internship-requests/${id}`);
  }

  downloadCv(fileName: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/internship-requests/cv/${fileName}`, { responseType: 'blob' });
  }
}
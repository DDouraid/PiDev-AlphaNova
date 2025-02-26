import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InternshipRequest } from '../models/internship-request';

@Injectable({
  providedIn: 'root'
})
export class InternshipRequestService {
  private baseUrl = '/api'; // Relative path for proxy

  constructor(private http: HttpClient) {}

  getAllInternshipRequests(): Observable<InternshipRequest[]> {
    return this.http.get<InternshipRequest[]>(`${this.baseUrl}/internship-requests`);
  }

  getInternshipRequestById(id: number): Observable<InternshipRequest> {
    return this.http.get<InternshipRequest>(`${this.baseUrl}/internship-requests/${id}`);
  }

  createInternshipRequest(request: InternshipRequest): Observable<InternshipRequest> {
    return this.http.post<InternshipRequest>(`${this.baseUrl}/internship-requests`, request);
  }

  updateInternshipRequest(request: InternshipRequest): Observable<InternshipRequest> {
    return this.http.put<InternshipRequest>(`${this.baseUrl}/internship-requests/${request.id}`, request);
  }

  deleteInternshipRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/internship-requests/${id}`);
  }
}
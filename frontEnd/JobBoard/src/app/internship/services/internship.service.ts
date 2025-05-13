import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InternshipRequestService } from './internship-request.service'; // Adjust the path
import { Internship } from 'src/app/core/models/internship';
import { InternshipRequest } from 'src/app/core/models/internship-request';

@Injectable({
  providedIn: 'root'
})
export class InternshipService {
  private baseUrl = '/api';

  constructor(private http: HttpClient, private internshipRequestService: InternshipRequestService) {}

  getAllInternships(): Observable<Internship[]> {
    return this.http.get<Internship[]>(`${this.baseUrl}/internships`);
  }

  getInternshipById(id: number): Observable<Internship> {
    return this.http.get<Internship>(`${this.baseUrl}/internships/${id}`);
  }

  createInternship(internship: Internship): Observable<Internship> {
    return this.http.post<Internship>(`${this.baseUrl}/internships`, internship);
  }

  updateInternship(internship: Internship): Observable<Internship> {
    return this.http.put<Internship>(`${this.baseUrl}/internships/${internship.id}`, internship);
  }

  deleteInternship(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/internships/${id}`);
  }

  updateStatusAndEndDate(id: number, status: string, endDate: string | null): Observable<Internship> {
    const params: any = { status };
    if (endDate) {
      params.endDate = endDate;
    }
    return this.http.put<Internship>(`${this.baseUrl}/internships/${id}/status-end-date`, null, { params });
  }

  // Delegate to InternshipRequestService for status updates
  acceptInternshipRequest(id: number, startDate: string, endDate?: string): Observable<InternshipRequest> {
    return this.internshipRequestService.updateInternshipRequestStatus(id, 'ACCEPTED');
  }

  rejectInternshipRequest(id: number): Observable<InternshipRequest> {
    return this.internshipRequestService.updateInternshipRequestStatus(id, 'REJECTED');
  }
}

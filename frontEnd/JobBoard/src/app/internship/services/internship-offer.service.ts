import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InternshipRequest } from 'src/app/core/models/internship-request';
import { InternshipOffer } from 'src/app/core/models/internship-offer';

@Injectable({
  providedIn: 'root'
})
export class InternshipOfferService {
  private baseUrl = '/api'; // Using proxy path

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

  getAllInternshipOffers(): Observable<InternshipOffer[]> {
    return this.http.get<any[]>(`${this.baseUrl}/internship-offers`, { headers: this.getAuthHeaders() }).pipe(
      map(offers => offers.map(offer => this.mapToFrontend(offer)))
    );
  }

  getInternshipOfferById(id: number): Observable<InternshipOffer> {
    return this.http.get<any>(`${this.baseUrl}/internship-offers/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map(offer => this.mapToFrontend(offer))
    );
  }

  getRequestsForOffer(offerId: number): Observable<InternshipRequest[]> {
    return this.http.get<InternshipRequest[]>(`${this.baseUrl}/internship-requests/by-offer/${offerId}`, { headers: this.getAuthHeaders() });
  }

  createInternshipOffer(offer: InternshipOffer): Observable<InternshipOffer> {
    const backendOffer = this.mapToBackend(offer);
    return this.http.post<any>(`${this.baseUrl}/internship-offers/addOffer`, backendOffer, { headers: this.getAuthHeaders() }).pipe(
      map(response => this.mapToFrontend(response))
    );
  }

  updateInternshipOffer(offer: InternshipOffer): Observable<InternshipOffer> {
    const backendOffer = this.mapToBackend(offer);
    return this.http.put<any>(`${this.baseUrl}/internship-offers/${offer.id}`, backendOffer, { headers: this.getAuthHeaders() }).pipe(
      map(response => this.mapToFrontend(response))
    );
  }

  deleteInternshipOffer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/internship-offers/${id}`, { headers: this.getAuthHeaders() });
  }

  downloadCv(fileName: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/internship-requests/cv/${fileName}`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  private mapToFrontend(backendOffer: any): InternshipOffer {
    return {
      id: backendOffer.id,
      title: backendOffer.title,
      description: backendOffer.description,
      company: backendOffer.company,
      location: backendOffer.location,
      datePosted: backendOffer.datePosted,
      durationInMonths: backendOffer.duration_in_months ? Number(backendOffer.duration_in_months) : null,
      internshipRequests: backendOffer.internships || [],
      userId: backendOffer.userId,
      username: backendOffer.username
    };
  }

  private mapToBackend(frontendOffer: InternshipOffer): any {
    return {
      id: frontendOffer.id,
      title: frontendOffer.title,
      description: frontendOffer.description,
      company: frontendOffer.company,
      location: frontendOffer.location,
      datePosted: frontendOffer.datePosted,
      duration_in_months: frontendOffer.durationInMonths,
      internships: frontendOffer.internshipRequests,
      userId: frontendOffer.userId,
      username: frontendOffer.username
    };
  }
}

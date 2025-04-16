import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InternshipOffer } from '../models/internship-offer';
import { InternshipRequest } from '../models/internship-request';

@Injectable({
  providedIn: 'root'
})
export class InternshipOfferService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  getAllInternshipOffers(): Observable<InternshipOffer[]> {
    return this.http.get<any[]>(`${this.baseUrl}/internship-offers`).pipe(
      map(offers => offers.map(offer => this.mapToFrontend(offer)))
    );
  }

  getInternshipOfferById(id: number): Observable<InternshipOffer> {
    return this.http.get<any>(`${this.baseUrl}/internship-offers/${id}`).pipe(
      map(offer => this.mapToFrontend(offer))
    );
  }

  getRequestsForOffer(offerId: number): Observable<InternshipRequest[]> {
    return this.http.get<InternshipRequest[]>(`${this.baseUrl}/internship-requests/by-offer/${offerId}`);
  }

  createInternshipOffer(offer: InternshipOffer): Observable<InternshipOffer> {
    const backendOffer = this.mapToBackend(offer);
    return this.http.post<any>(`${this.baseUrl}/internship-offers`, backendOffer).pipe(
      map(response => this.mapToFrontend(response))
    );
  }

  updateInternshipOffer(offer: InternshipOffer): Observable<InternshipOffer> {
    const backendOffer = this.mapToBackend(offer);
    return this.http.put<any>(`${this.baseUrl}/internship-offers/${offer.id}`, backendOffer).pipe(
      map(response => this.mapToFrontend(response))
    );
  }

  deleteInternshipOffer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/internship-offers/${id}`);
  }

  downloadCv(fileName: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/internship-requests/cv/${fileName}`, { responseType: 'blob' });
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
      internshipRequests: backendOffer.internships || []
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
      internships: frontendOffer.internshipRequests
    };
  }
}
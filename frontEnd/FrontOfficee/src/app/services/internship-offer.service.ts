import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InternshipOffer } from '../models/internship-offer';
import { InternshipRequest } from '../models/internship-request';

@Injectable({
  providedIn: 'root'
})
export class InternshipOfferService {
  private baseUrl = '/api'; // Relative path for proxy

  constructor(private http: HttpClient) {}

  getAllInternshipOffers(): Observable<InternshipOffer[]> {
    return this.http.get<InternshipOffer[]>(`${this.baseUrl}/internship-offers`);
  }

  getInternshipOfferById(id: number): Observable<InternshipOffer> {
    return this.http.get<InternshipOffer>(`${this.baseUrl}/internship-offers/${id}`);
  }

  getRequestsForOffer(offerId: number): Observable<InternshipRequest[]> {
    return this.http.get<InternshipRequest[]>(`${this.baseUrl}/internship-requests/by-offer/${offerId}`);
  }

  createInternshipOffer(offer: InternshipOffer): Observable<InternshipOffer> {
    return this.http.post<InternshipOffer>(`${this.baseUrl}/internship-offers`, offer);
  }

  updateInternshipOffer(offer: InternshipOffer): Observable<InternshipOffer> {
    return this.http.put<InternshipOffer>(`${this.baseUrl}/internship-offers/${offer.id}`, offer);
  }

  deleteInternshipOffer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/internship-offers/${id}`);
  }

  // Added method to download CV
  downloadCv(fileName: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/internship-requests/cv/${fileName}`, { responseType: 'blob' });
  }
}
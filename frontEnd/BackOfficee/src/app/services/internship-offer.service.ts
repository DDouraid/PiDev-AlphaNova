import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InternshipOffer } from '../models/internship-offer';

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

  createInternshipOffer(offer: InternshipOffer): Observable<InternshipOffer> {
    return this.http.post<InternshipOffer>(`${this.baseUrl}/internship-offers`, offer);
  }

  updateInternshipOffer(offer: InternshipOffer): Observable<InternshipOffer> {
    return this.http.put<InternshipOffer>(`${this.baseUrl}/internship-offers/${offer.id}`, offer);
  }

  deleteInternshipOffer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/internship-offers/${id}`);
  }
}
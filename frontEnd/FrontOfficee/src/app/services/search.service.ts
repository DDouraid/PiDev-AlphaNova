import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { InternshipService } from './internship.service';
import { InternshipOfferService } from './internship-offer.service';
import { InternshipRequestService } from './internship-request.service';
import { Internship } from '../models/internship';
import { InternshipOffer } from '../models/internship-offer';
import { InternshipRequest } from '../models/internship-request';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  constructor(
    private internshipService: InternshipService,
    private internshipOfferService: InternshipOfferService,
    private internshipRequestService: InternshipRequestService
  ) {}

  search(query: string): Observable<any[]> {
    if (!query.trim()) {
      return of([]); // Return empty array if query is empty
    }

    // Perform searches for all entities concurrently using forkJoin
    return forkJoin({
      internships: this.internshipService.getAllInternships().pipe(
        map(internships => internships.filter(internship =>
          internship.title.toLowerCase().includes(query.toLowerCase()) ||
          internship.description.toLowerCase().includes(query.toLowerCase())
        ).map(internship => ({ type: 'Internship', data: internship, route: '/ListeInternship' })))
      ),
      offers: this.internshipOfferService.getAllInternshipOffers().pipe(
        map(offers => offers.filter(offer =>
          offer.title.toLowerCase().includes(query.toLowerCase()) ||
          offer.description.toLowerCase().includes(query.toLowerCase())
        ).map(offer => ({ type: 'Offer', data: offer, route: '/listeoffers' })))
      ),
      requests: this.internshipRequestService.getAllInternshipRequests().pipe(
        map(requests => requests.filter(request =>
          request.title.toLowerCase().includes(query.toLowerCase()) ||
          request.description.toLowerCase().includes(query.toLowerCase())
        ).map(request => ({ type: 'Request', data: request, route: '/listrequests' })))
      )
    }).pipe(
      map(results => [
        ...results.internships,
        ...results.offers,
        ...results.requests
      ])
    );
  }
}
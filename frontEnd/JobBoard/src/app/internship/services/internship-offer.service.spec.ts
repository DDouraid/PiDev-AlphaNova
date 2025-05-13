import { TestBed } from '@angular/core/testing';

import { InternshipOfferService } from './internship-offer.service';

describe('InternshipOfferService', () => {
  let service: InternshipOfferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InternshipOfferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

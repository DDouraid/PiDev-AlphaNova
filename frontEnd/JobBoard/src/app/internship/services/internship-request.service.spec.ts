import { TestBed } from '@angular/core/testing';

import { InternshipRequestService } from './internship-request.service';

describe('InternshipRequestService', () => {
  let service: InternshipRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InternshipRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

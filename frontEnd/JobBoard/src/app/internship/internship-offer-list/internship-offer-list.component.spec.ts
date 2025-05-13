import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternshipOfferListComponent } from './internship-offer-list.component';

describe('InternshipOfferListComponent', () => {
  let component: InternshipOfferListComponent;
  let fixture: ComponentFixture<InternshipOfferListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InternshipOfferListComponent]
    });
    fixture = TestBed.createComponent(InternshipOfferListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

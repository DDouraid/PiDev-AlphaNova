import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserInternshipOfferListComponent } from './user-internship-offer-list.component';

describe('UserInternshipOfferListComponent', () => {
  let component: UserInternshipOfferListComponent;
  let fixture: ComponentFixture<UserInternshipOfferListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserInternshipOfferListComponent]
    });
    fixture = TestBed.createComponent(UserInternshipOfferListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

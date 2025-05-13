import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternshipRequestListComponent } from './internship-request-list.component';

describe('InternshipRequestListComponent', () => {
  let component: InternshipRequestListComponent;
  let fixture: ComponentFixture<InternshipRequestListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InternshipRequestListComponent]
    });
    fixture = TestBed.createComponent(InternshipRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

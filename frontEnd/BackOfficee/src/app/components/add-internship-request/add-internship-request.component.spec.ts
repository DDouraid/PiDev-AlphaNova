import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInternshipRequestComponent } from './add-internship-request.component';

describe('AddInternshipRequestComponent', () => {
  let component: AddInternshipRequestComponent;
  let fixture: ComponentFixture<AddInternshipRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddInternshipRequestComponent]
    });
    fixture = TestBed.createComponent(AddInternshipRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

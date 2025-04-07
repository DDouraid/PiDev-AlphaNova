import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternshipFormComponent } from './internship-form.component';

describe('InternshipFormComponent', () => {
  let component: InternshipFormComponent;
  let fixture: ComponentFixture<InternshipFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InternshipFormComponent]
    });
    fixture = TestBed.createComponent(InternshipFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

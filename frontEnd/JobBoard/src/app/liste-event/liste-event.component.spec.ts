import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeEventComponent } from './liste-event.component';

describe('ListeEventComponent', () => {
  let component: ListeEventComponent;
  let fixture: ComponentFixture<ListeEventComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListeEventComponent]
    });
    fixture = TestBed.createComponent(ListeEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
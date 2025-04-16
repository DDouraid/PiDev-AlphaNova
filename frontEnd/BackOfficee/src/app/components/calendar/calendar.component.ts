import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CalendarEvent, CalendarView, CalendarMonthViewDay } from 'angular-calendar';
import { addDays, isSameDay } from 'date-fns'; // Ensure this is imported
import { InterviewService } from '../../services/interview.service';
import { Interview } from '../../models/interview';
import { Subject } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date('2025-04-16'); // Start with April 2025
  events: CalendarEvent<Interview>[] = [];
  refresh: Subject<void> = new Subject<void>();
  selectedDateInterviews: Interview[] = [];
  activeDayIsOpen: boolean = false;
  selectedDate: Date | null = null;
  isLoading: boolean = true;
  showAlert: boolean = false;
  alertType: string = 'alert-success';
  alertMessage: string = '';
  modalRef?: BsModalRef;

  @ViewChild('InterviewModalTemplate', { static: true }) interviewModalTemplate!: TemplateRef<any>;

  constructor(private interviewService: InterviewService, private modalService: BsModalService) {}

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.loadInterviews();
    // Test data for April 2025
    this.events = [
      {
        title: 'Test Interview - Internship A',
        start: new Date('2025-04-16T10:00:00'),
        color: { primary: '#ad2121', secondary: '#FAE3E3' },
        meta: {
          id: 1,
          interviewDate: '2025-04-16T10:00:00',
          status: 'SCHEDULED',
          internshipRequest: { id: 1, email: 'test@exam.com', title: 'Internship A' },
          userName: 'test',
          internship: 'Internship A'
        }
      }
    ];
    this.isLoading = false;
    this.refresh.next();
  }

  loadInterviews(): void {
    this.isLoading = true;
    this.interviewService.getInterviews().subscribe({
      next: (interviews: Interview[]) => {
        console.log('Interviews received:', interviews);
        this.events = interviews.map(interview => {
          const userName = interview.internshipRequest?.email?.split('@')[0] || 'Unknown';
          const internship = interview.internshipRequest?.title || 'N/A';
          const startDate = new Date(interview.interviewDate || '');
          if (isNaN(startDate.getTime())) {
            console.warn('Invalid date for interview:', interview.interviewDate);
            return null;
          }
          return {
            title: `${userName} - ${internship}`,
            start: startDate,
            color: { primary: '#ad2121', secondary: '#FAE3E3' },
            meta: {
              ...interview,
              userName,
              internship
            }
          };
        }).filter(event => event !== null) as CalendarEvent<Interview>[];
        this.isLoading = false;
        this.refresh.next();
        this.showAlert = true;
        this.alertType = 'alert-success';
        this.alertMessage = 'Interviews loaded successfully!';
        setTimeout(() => this.closeAlert(), 3000);
      },
      error: (err: any) => {
        console.error('Failed to load interviews:', err);
        this.isLoading = false;
        this.showAlert = true;
        this.alertType = 'alert-danger';
        this.alertMessage = 'Failed to load interviews.';
        setTimeout(() => this.closeAlert(), 3000);
      }
    });
  }

  handleDayClick(event: { day: CalendarMonthViewDay<Interview> }): void {
    this.selectedDate = event.day.date;
    this.viewDate = event.day.date;
    this.activeDayIsOpen = true;
    this.selectedDateInterviews = this.events
      .filter(eventItem => isSameDay(eventItem.start, event.day.date))
      .map(eventItem => eventItem.meta as Interview);
    console.log('Selected interviews:', this.selectedDateInterviews);
    this.openModal();
  }

  handleEventClick(event: { event: CalendarEvent<Interview> }): void {
    const interview = event.event.meta as Interview;
    console.log('Event clicked:', interview);
  }

  openModal(): void {
    if (this.selectedDateInterviews.length > 0) {
      this.modalRef = this.modalService.show(this.interviewModalTemplate);
    }
  }

  closeAlert(): void {
    this.showAlert = false;
  }

  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.hide();
      this.modalRef = undefined;
    }
  }

  // Add method to handle month navigation
  navigateMonth(days: number): void {
    this.viewDate = addDays(this.viewDate, days);
    this.refresh.next(); // Trigger calendar refresh
  }
}
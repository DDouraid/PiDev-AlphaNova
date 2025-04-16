import { Component, OnInit } from '@angular/core';
import { InternshipService } from '../../services/internship.service';
import { Internship, InternStatus } from '../../models/internship';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-internship-form',
  templateUrl: './internship-form.component.html',
  styleUrls: ['./internship-form.component.css']
})
export class InternshipFormComponent implements OnInit {
  internship: Internship = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: InternStatus.IN_PROGRESS
  };

  statuses = Object.values(InternStatus);
  isSubmittingInternship = false;

  showAlert: boolean = false;
  alertType: string = 'alert-success';
  alertMessage: string = '';

  constructor(private internshipService: InternshipService) {}

  ngOnInit(): void {}

  onSubmitInternship(form: NgForm): void {
    if (!form.valid) return;

    this.isSubmittingInternship = true;
    this.internshipService.createInternship(this.internship).subscribe({
      next: (response) => {
        console.log('Internship saved:', response);
        this.isSubmittingInternship = false;
        form.resetForm();
        this.internship = { title: '', description: '', startDate: '', endDate: '', status: InternStatus.IN_PROGRESS };
        this.showCustomAlert('success', 'Internship created successfully!');
      },
      error: (err) => {
        console.error('Error creating internship:', err);
        this.isSubmittingInternship = false;
        this.showCustomAlert('danger', 'Failed to create internship. Please try again.');
      }
    });
  }

  showCustomAlert(type: 'success' | 'danger', message: string): void {
    this.alertType = `alert-${type}`;
    this.alertMessage = message;
    this.showAlert = true;
    setTimeout(() => this.closeAlert(), 5000);
  }

  closeAlert(): void {
    this.showAlert = false;
  }
}
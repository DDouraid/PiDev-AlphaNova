import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertService, Alert } from '../../services/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit, OnDestroy {
  alerts: Alert[] = [];
  private subscription: Subscription | undefined;

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.subscription = this.alertService.getAlerts().subscribe((alert: Alert) => {
      this.alerts.push(alert);
      // Automatically remove the alert after 5 seconds
      setTimeout(() => this.removeAlert(alert), 5000);
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  removeAlert(alert: Alert): void {
    this.alerts = this.alerts.filter(a => a.id !== alert.id);
  }

  getAlertClass(type: string): string {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-danger';
      case 'warning':
        return 'alert-warning';
      default:
        return 'alert-info';
    }
  }
}
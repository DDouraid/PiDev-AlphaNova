import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface Alert {
  type: 'success' | 'error' | 'warning';
  message: string;
  id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new Subject<Alert>();
  private alertId = 0;

  // Observable to subscribe to alerts
  getAlerts(): Observable<Alert> {
    return this.alertSubject.asObservable();
  }

  // Method to trigger a success alert
  success(message: string): void {
    this.alertSubject.next({ type: 'success', message, id: this.alertId++ });
  }

  // Method to trigger an error alert
  error(message: string): void {
    this.alertSubject.next({ type: 'error', message, id: this.alertId++ });
  }

  // Method to trigger a warning alert
  warning(message: string): void {
    this.alertSubject.next({ type: 'warning', message, id: this.alertId++ });
  }
}
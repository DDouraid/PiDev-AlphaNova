// notification.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationSubject = new BehaviorSubject<any>(null);
  notification$ = this.notificationSubject.asObservable();

  show(type: string, title: string, message: string) {
    this.notificationSubject.next({ type, title, message });
    setTimeout(() => this.notificationSubject.next(null), 3000); // Auto-hide after 3s
  }
}
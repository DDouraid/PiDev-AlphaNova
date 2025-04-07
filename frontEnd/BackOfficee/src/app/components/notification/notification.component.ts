// notification.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-notification',
  template: `
    <div class="notification" [ngClass]="type">
      <strong>{{ title }}</strong>: {{ message }}
    </div>
  `,
  styles: [`
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px;
      border-radius: 5px;
      color: white;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    }
    .success { background-color: #28a745; }
    .error { background-color: #dc3545; }
    @keyframes slideIn {
      from { right: -300px; }
      to { right: 20px; }
    }
  `]
})
export class NotificationComponent {
  @Input() type: string = 'success';
  @Input() title: string = '';
  @Input() message: string = '';
}
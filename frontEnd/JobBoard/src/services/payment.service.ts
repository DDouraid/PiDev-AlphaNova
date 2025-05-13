import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export enum PaymentMode {
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL'
}

export interface Payment {
  id: number | null;
  amount: number;
  mode: PaymentMode;
  date: string;
  userId?: number;       // Added to match backend
  username?: string;     // Added to match backend
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:8082/api/payments';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.apiUrl, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  addPayment(payment: Payment): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/addPayment`, payment, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  deletePayment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }
  createCheckoutSession() {
    return this.http.post('http://localhost:8082/api/payment/create-checkout-session', {}, { responseType: 'text' });
  }
  private handleError(error: any): Observable<never> {
    console.error('Payment Service Error:', error);
    const errorMsg = error.error?.message || error.message || 'Unknown error occurred';
    return throwError(() => new Error(errorMsg));
  }
}

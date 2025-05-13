import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Message } from 'src/app/core/models/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = '/api/messages'; // Using proxy path

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      console.error('No JWT token found in localStorage');
      throw new Error('No token found. User might not be authenticated.');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      catchError(err => this.handleError(err, 'loading messages'))
    );
  }

  getMessageById(id: number): Observable<Message> {
    return this.http.get<Message>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(err => this.handleError(err, 'getting message'))
    );
  }

  getMessagesBySender(senderId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/sender/${senderId}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(err => this.handleError(err, 'getting messages by sender'))
    );
  }

  getMessagesByReceiver(receiverId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/receiver/${receiverId}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(err => this.handleError(err, 'getting messages by receiver'))
    );
  }

  getMessagesByGroup(groupId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/group/${groupId}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(err => this.handleError(err, 'getting messages by group'))
    );
  }

  createMessage(message: Message): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/createMess`, message, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(err => {
        const errorMsg = err.status === 403
          ? 'Vous n\'êtes pas autorisé à envoyer ce message'
          : `Erreur lors de l'envoi du message: ${err.message || 'Erreur inconnue'}`;
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  updateMessage(id: number, message: Message): Observable<Message> {
    return this.http.put<Message>(`${this.apiUrl}/${id}`, message, { headers: this.getAuthHeaders() }).pipe(
      catchError(err => this.handleError(err, 'updating message'))
    );
  }

  deleteMessage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(err => this.handleError(err, 'deleting message'))
    );
  }

  private handleError(err: any, context: string): Observable<never> {
    console.error(`Error during ${context}:`, err);
    const errorMsg = err.status === 403
      ? `Forbidden: ${context}`
      : `Error ${context}: ${err.message || 'Unknown error'}`;
    return throwError(() => new Error(errorMsg));
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Event } from '../core/models/Event';
import { supervisor } from '../core/models/Supervisor';
import { AuthService } from 'src/services/auth.service';
import { Tasks, TasksStatus } from 'src/app/core/models/Tasks';

import { Feedback } from '../core/models/Feedback';

@Injectable({
  providedIn: 'root'
})
export class ServeurService {
  // Single base URL for all APIs, pointing to http://localhost:8082 via proxy
  private apiEndPoint = '/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}



 getAuthHeaders(): HttpHeaders {
  const token = localStorage.getItem('jwtToken'); // Use the correct key
  if (!token) {
    throw new Error("No token found. User might not be authenticated.");
  }
  return new HttpHeaders().set('Authorization', `Bearer ${token}`);
}


/* CRUD Tasks */
getAllTasks(): Observable<Tasks[]> {
  const url = `${this.apiEndPoint}/mic1Tasks/findAll`;
  return this.http.get<Tasks[]>(url, { headers: this.getAuthHeaders() }).pipe(
    map(response => response),
    catchError(error => {
      console.error('Tasks Fetch Error:', error);
      return throwError(() => new Error('Failed to fetch tasks'));
    })
  );
}

getTaskStatistics(): Observable<any> {
  const url = `${this.apiEndPoint}/mic1Tasks/statistics`;
  return this.http.get<any>(url, { headers: this.getAuthHeaders() }).pipe(
    map(response => response),
    catchError(error => {
      console.error('Tasks Stats Fetch Error:', error);
      return throwError(() => new Error('Failed to fetch task statistics'));
    })
  );
}

deleteTask(id: number): Observable<void> {
  const url = `${this.apiEndPoint}/mic1Tasks/delete/${id}`;
  return this.http.delete<void>(url, { headers: this.getAuthHeaders() }).pipe(
    map(() => undefined),
    catchError(error => {
      console.error('Tasks Delete Error:', error);
      return throwError(() => new Error('Failed to delete task'));
    })
  );
}

updateTask(task: Tasks): Observable<Tasks> {
  const url = `${this.apiEndPoint}/mic1Tasks/updateTasks/${task.id}`;
  return this.http.put<Tasks>(url, task, { headers: this.getAuthHeaders() }).pipe(
    catchError(error => {
      console.error('Tasks Update Error:', error);
      return throwError(() => new Error('Failed to update task'));
    })
  );
}

createTask(task: Tasks): Observable<Tasks> {
  const url = `${this.apiEndPoint}/mic1Tasks/addTasks`;
  console.log('Payload envoyé:', JSON.stringify(task));
  return this.http.post<Tasks>(url, task, { headers: this.getAuthHeaders() }).pipe(
    catchError(error => {
      console.error('Tasks Create Error:', error);
      return throwError(() => new Error('Failed to create task'));
    })
  );
}
getAllFeedback(): Observable<Feedback[]> {
  const url = `${this.apiEndPoint}/mic1Feedback/findAll`;
  return this.http.get<Feedback[]>(url, { headers: this.getAuthHeaders() }).pipe(
    map(response => response),
    catchError(error => {
      console.error('Feedback Fetch Error:', error);
      return throwError(() => new Error('Failed to fetch feedback'));
    })
  );
}

createFeedback(feedback: Feedback): Observable<Feedback> {
  const url = `${this.apiEndPoint}/mic1Feedback/addFeedback`;
  return this.http.post<Feedback>(url, feedback, { headers: this.getAuthHeaders() }).pipe(
    catchError(error => {
      console.error('Feedback Create Error:', error);
      return throwError(() => new Error('Failed to create feedback'));
    })
  );
}

updateFeedback(feedback: Feedback): Observable<Feedback> {
  const url = `${this.apiEndPoint}/mic1Feedback/updateFeedback/${feedback.id}`;
  return this.http.put<Feedback>(url, feedback, { headers: this.getAuthHeaders() }).pipe(
    catchError(error => {
      console.error('Feedback Update Error:', error);
      return throwError(() => new Error('Failed to update feedback'));
    })
  );
}

deleteFeedback(id: number): Observable<void> {
  const url = `${this.apiEndPoint}/mic1Feedback/delete/${id}`;
  return this.http.delete<void>(url, { headers: this.getAuthHeaders() }).pipe(
    map(() => undefined),
    catchError(error => {
      console.error('Feedback Delete Error:', error);
      return throwError(() => new Error('Failed to delete feedback'));
    })
  );
}

sendEmail(to: string, subject: string, body: string): Observable<any> {
  const url = `${this.apiEndPoint}/mic1Feedback/sendEmail`;
  const payload = { to, subject, body };
  return this.http.post(url, payload, { headers: this.getAuthHeaders() }).pipe(
    catchError(error => {
      console.error('Email Send Error:', error);
      return throwError(() => new Error('Failed to send email'));
    })
  );
}


  /* CRUD Event */
  updateEvent(event: Event): Observable<Event> {
    const url = `${this.apiEndPoint}/Event/update/${event.idEvent}`;
    return this.http.put<Event>(url, event, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Event Update Error:', error);
        return throwError(() => new Error('Failed to update event'));
      })
    );
  }

  getAllEvenements(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiEndPoint}/Event/get-all`, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Event Fetch Error:', error);
        return throwError(() => new Error('Failed to fetch events'));
      })
    );
  }

  addEvenement(event: Event): Observable<Event> {
    const url = `${this.apiEndPoint}/Event/add`;
    return this.http.post<Event>(url, event, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Event Create Error:', error);
        return throwError(() => new Error('Failed to create event'));
      })
    );
  }

  deleteEvenement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiEndPoint}/Event/delete/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Event Delete Error:', error);
        return throwError(() => new Error('Failed to delete event'));
      })
    );
  }

  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiEndPoint}/Event/get/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Event Fetch Error:', error);
        return throwError(() => new Error('Failed to fetch event by ID'));
      })
    );
  }

  getEventDateStats(): Observable<{ passed: number; current: number; upcoming: number; total: number }> {
    return this.http.get<{ passed: number; current: number; upcoming: number; total: number }>(
      `${this.apiEndPoint}/Event/stats/date`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Event Stats Fetch Error:', error);
        return throwError(() => new Error('Failed to fetch event date stats'));
      })
    );
  }


  /* CRUD Supervisor */
  updateSupervisor(supervisor: supervisor): Observable<supervisor> {
    const url = `${this.apiEndPoint}/Supervisor/update/${supervisor.idSup}`;
    return this.http.put<supervisor>(url, supervisor, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Supervisor Update Error:', error);
        return throwError(() => new Error('Failed to update supervisor'));
      })
    );
  }

  getAllSupervisor(): Observable<supervisor[]> {
    const url = `${this.apiEndPoint}/Supervisor/get-all`;
    console.log('Fetching from:', url);
    return this.http.get<supervisor[]>(url, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Supervisor Fetch Error:', error);
        return throwError(() => new Error('Failed to fetch supervisors'));
      })
    );
  }

  addSupervisor(supervisor: supervisor): Observable<supervisor> {
    const url = `${this.apiEndPoint}/Supervisor/add`;
    return this.http.post<supervisor>(url, supervisor, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Supervisor Create Error:', error);
        return throwError(() => new Error('Failed to create supervisor'));
      })
    );
  }

  deleteSupervisor(id: number): Observable<void> {
    const url = `${this.apiEndPoint}/Supervisor/delete/${id}`;
    return this.http.delete<void>(url, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Supervisor Delete Error:', error);
        return throwError(() => new Error('Failed to delete supervisor'));
      })
    );
  }

  /* Additional Methods */
  initiateGoogleAuth(eventId?: number): Observable<string> {
    const url = eventId ? `${this.apiEndPoint}/Event/google-auth?eventId=${eventId}` : `${this.apiEndPoint}/Event/google-auth`;
    return this.http.get(url, { headers: this.getAuthHeaders(), responseType: 'text' }).pipe(
      catchError(error => {
        console.error('Google Auth Error:', error);
        return throwError(() => new Error('Failed to initiate Google auth'));
      })
    );
  }

  getMapTilerApiKey(): Observable<string> {
    const url = `${this.apiEndPoint}/Event/maptiler/key`;
    return this.http.get(url, { headers: this.getAuthHeaders(), responseType: 'text' }).pipe(
      catchError(error => {
        console.error('MapTiler API Key Fetch Error:', error);
        return throwError(() => new Error('Failed to fetch MapTiler API key'));
      })
    );
  }

  // Optional: Fetch user details from auth microservice
  getUserDetails(userId: number): Observable<{ id: number; username: string }> {
    return this.authService.getCurrentUserFromServer().pipe(
      map(jwtResponse => ({
        id: jwtResponse.id,
        username: jwtResponse.username
      })),
      catchError(error => {
        console.error('User Fetch Error:', error);
        return throwError(() => new Error('Failed to fetch user details'));
      })
    );
  }
}

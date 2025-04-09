import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Event } from '../core/models/Event'; 
import { supervisor } from '../core/models/Supervisor';

export interface Feedback {
  id: number;
  comment: string;
  note: number;
}

export interface Tasks {
  id?: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: TasksStatus;
}

export enum TasksStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

@Injectable({
  providedIn: 'root'
})
export class ServeurService {
  // Single base URL for all APIs, pointing to http://localhost:8082 via proxy
  private apiEndPoint = '/api';

  constructor(private http: HttpClient) { }

  /* CRUD Feedback */
  getAllFeedback(): Observable<Feedback[]> {
    const url = `${this.apiEndPoint}/mic1/findAll`;
    return this.http.get<Feedback[]>(url).pipe(
      catchError(error => {
        console.error('Feedback Fetch Error:', error);
        return throwError(() => new Error('Failed to fetch feedback'));
      })
    );
  }

  deleteFeedback(id: number): Observable<void> {
    const url = `${this.apiEndPoint}/mic1/delete/${id}`;
    return this.http.delete<void>(url).pipe(
      catchError(error => {
        console.error('Feedback Delete Error:', error);
        return throwError(() => new Error('Failed to delete feedback'));
      })
    );
  }

  updateFeedback(feedback: Feedback): Observable<Feedback> {
    const url = `${this.apiEndPoint}/mic1/updateFeedback/${feedback.id}`;
    return this.http.put<Feedback>(url, feedback).pipe(
      catchError(error => {
        console.error('Feedback Update Error:', error);
        return throwError(() => new Error('Failed to update feedback'));
      })
    );
  }

  createFeedback(feedback: Feedback): Observable<Feedback> {
    const url = `${this.apiEndPoint}/mic1/addFeedback`;
    return this.http.post<Feedback>(url, feedback).pipe(
      catchError(error => {
        console.error('Feedback Create Error:', error);
        return throwError(() => new Error('Failed to create feedback'));
      })
    );
  }

  /* CRUD Event */
  updateEvent(event: Event): Observable<Event> {
    const url = `${this.apiEndPoint}/Event/update/${event.idEvent}`;
    return this.http.put<Event>(url, event).pipe(
      catchError(error => {
        console.error('Event Update Error:', error);
        return throwError(() => new Error('Failed to update event'));
      })
    );
  }

  getAllEvenements(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiEndPoint}/Event/get-all`).pipe(
      catchError(error => {
        console.error('Event Fetch Error:', error);
        return throwError(() => new Error('Failed to fetch events'));
      })
    );
  }

  addEvenement(event: Event): Observable<Event> {
    const url = `${this.apiEndPoint}/Event/add`;
    return this.http.post<Event>(url, event).pipe(
      catchError(error => {
        console.error('Event Create Error:', error);
        return throwError(() => new Error('Failed to create event'));
      })
    );
  }

  deleteEvenement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiEndPoint}/Event/delete/${id}`).pipe(
      catchError(error => {
        console.error('Event Delete Error:', error);
        return throwError(() => new Error('Failed to delete event'));
      })
    );
  }

  /* CRUD Tasks */
  getAllTasks(): Observable<Tasks[]> {
    const url = `${this.apiEndPoint}/tasks/findAll`;
    return this.http.get<Tasks[]>(url).pipe(
      catchError(error => {
        console.error('Tasks Fetch Error:', error);
        return throwError(() => new Error('Failed to fetch tasks'));
      })
    );
  }

  deleteTask(id: number): Observable<void> {
    const url = `${this.apiEndPoint}/tasks/delete/${id}`;
    return this.http.delete<void>(url).pipe(
      catchError(error => {
        console.error('Tasks Delete Error:', error);
        return throwError(() => new Error('Failed to delete task'));
      })
    );
  }

  updateTask(task: Tasks): Observable<Tasks> {
    const url = `${this.apiEndPoint}/tasks/updateTask/${task.id}`;
    return this.http.put<Tasks>(url, task).pipe(
      catchError(error => {
        console.error('Tasks Update Error:', error);
        return throwError(() => new Error('Failed to update task'));
      })
    );
  }

  createTask(task: Tasks): Observable<Tasks> {
    const url = `${this.apiEndPoint}/tasks/addTask`;
    return this.http.post<Tasks>(url, task).pipe(
      catchError(error => {
        console.error('Tasks Create Error:', error);
        return throwError(() => new Error('Failed to create task'));
      })
    );
  }

  /* CRUD Supervisor */
  updateSupervisor(supervisor: supervisor): Observable<supervisor> {
    const url = `${this.apiEndPoint}/Supervisor/update/${supervisor.idSup}`;
    return this.http.put<supervisor>(url, supervisor).pipe(
      catchError(error => {
        console.error('Supervisor Update Error:', error);
        return throwError(() => new Error('Failed to update supervisor'));
      })
    );
  }

  getAllSupervisor(): Observable<supervisor[]> {
    const url = `${this.apiEndPoint}/Supervisor/get-all`;
    console.log('Fetching from:', url);
    return this.http.get<supervisor[]>(url).pipe(
      catchError(error => {
        console.error('Supervisor Fetch Error:', error);
        return throwError(() => new Error('Failed to fetch supervisors'));
      })
    );
  }

  addSupervisor(supervisor: supervisor): Observable<supervisor> {
    const url = `${this.apiEndPoint}/Supervisor/add`;
    return this.http.post<supervisor>(url, supervisor).pipe(
      catchError(error => {
        console.error('Supervisor Create Error:', error);
        return throwError(() => new Error('Failed to create supervisor'));
      })
    );
  }

  deleteSupervisor(id: number): Observable<void> {
    const url = `${this.apiEndPoint}/Supervisor/delete/${id}`;
    return this.http.delete<void>(url).pipe(
      catchError(error => {
        console.error('Supervisor Delete Error:', error);
        return throwError(() => new Error('Failed to delete supervisor'));
      })
    );
  }
}
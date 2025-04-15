import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Event } from '../core/models/Event';
import { Feedback } from '../core/models/Feedback';
import { Tasks, TasksStatus } from '../core/models/Tasks';
import { User } from '../core/models/User';

@Injectable({
  providedIn: 'root'
})
export class ServeurService {
  private apiEndPoint = '/api'; 

  constructor(private http: HttpClient) {}

  /* CRUD User */
  getAllUsers(): Observable<User[]> {
    const url = `${this.apiEndPoint}/users/findAll`;
    return this.http.get<User[]>(url).pipe(
      map(response => response),
      catchError(error => {
        console.error('Users Fetch Error:', error);
        throw error;
      })
    );
  }

  createUser(user: User): Observable<User> {
    const url = `${this.apiEndPoint}/users/addUser`;
    return this.http.post<User>(url, user).pipe(
      catchError(error => {
        console.error('User Create Error:', error);
        throw error;
      })
    );
  }

  /* CRUD Feedback */
  getAllFeedback(): Observable<Feedback[]> {
    const url = `${this.apiEndPoint}/mic1Feedback/findAll`;
    console.log('Fetching from:', url);
    return this.http.get<Feedback[]>(url).pipe(
      map(response => {
        console.log('Feedback Response:', response);
        return response;
      }),
      catchError(error => {
        console.error('Feedback Fetch Error:', error);
        throw error;
      })
    );
  }

  getFeedbackByUser(userId: number): Observable<Feedback[]> {
    const url = `${this.apiEndPoint}/mic1Feedback/findByUser/${userId}`;
    return this.http.get<Feedback[]>(url).pipe(
      map(response => response),
      catchError(error => {
        console.error('Feedback Fetch By User Error:', error);
        throw error;
      })
    );
  }

  deleteFeedback(id: number): Observable<void> {
    const url = `${this.apiEndPoint}/mic1Feedback/delete/${id}`;
    console.log('Deleting from:', url);
    return this.http.delete<void>(url).pipe(
      map(() => undefined),
      catchError(error => {
        console.error('Feedback Delete Error:', error);
        throw error;
      })
    );
  }

  updateFeedback(feedback: Feedback): Observable<Feedback> {
    const url = `${this.apiEndPoint}/mic1Feedback/updateFeedback/${feedback.id}`;
    return this.http.put<Feedback>(url, feedback).pipe(
      catchError(error => {
        console.error('Feedback Update Error:', error);
        throw error;
      })
    );
  }

  createFeedback(feedback: Feedback): Observable<Feedback> {
    const url = `${this.apiEndPoint}/mic1Feedback/addFeedback`;
    return this.http.post<Feedback>(url, feedback).pipe(
      catchError(error => {
        console.error('Feedback Create Error:', error);
        throw error;
      })
    );
  }

  /* CRUD Event */
  getAllEvenements(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiEndPoint}/Event/Event/get-all`);
  }

  addEvenement(event: Event): Observable<Event> {
    const url = `${this.apiEndPoint}/Event/Event/add`;
    return this.http.post<Event>(url, event).pipe(
      catchError(error => {
        console.error('Event Create Error:', error);
        throw error;
      })
    );
  }

  deleteEvenement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiEndPoint}/Event/Event/delete/${id}`);
  }

  /* CRUD Tasks */
  getAllTasks(): Observable<Tasks[]> {
    const url = `${this.apiEndPoint}/mic1Tasks/findAll`;
    return this.http.get<Tasks[]>(url).pipe(
      map(response => response),
      catchError(error => {
        console.error('Tasks Fetch Error:', error);
        throw error;
      })
    );
  }

  getTasksByUser(userId: number): Observable<Tasks[]> {
    const url = `${this.apiEndPoint}/mic1Tasks/findByUser/${userId}`;
    return this.http.get<Tasks[]>(url).pipe(
      map(response => response),
      catchError(error => {
        console.error('Tasks Fetch By User Error:', error);
        throw error;
      })
    );
  }

  getTaskStatistics(): Observable<any> {
    const url = `${this.apiEndPoint}/mic1Tasks/statistics`;
    return this.http.get<any>(url).pipe(
      map(response => response),
      catchError(error => {
        console.error('Tasks Fetch Error:', error);
        throw error;
      })
    );
  }

  getTaskStatisticsByUser(userId: number): Observable<any> {
    const url = `${this.apiEndPoint}/mic1Tasks/statisticsByUser/${userId}`;
    return this.http.get<any>(url).pipe(
      map(response => response),
      catchError(error => {
        console.error('Tasks Statistics Fetch By User Error:', error);
        throw error;
      })
    );
  }

  deleteTask(id: number): Observable<void> {
    const url = `${this.apiEndPoint}/mic1Tasks/delete/${id}`;
    return this.http.delete<void>(url).pipe(
      map(() => undefined),
      catchError(error => {
        console.error('Tasks Delete Error:', error);
        throw error;
      })
    );
  }

  updateTask(task: Tasks): Observable<Tasks> {
    const url = `${this.apiEndPoint}/mic1Tasks/updateTasks/${task.id}`;
    return this.http.put<Tasks>(url, task).pipe(
      catchError(error => {
        console.error('Tasks Update Error:', error);
        throw error;
      })
    );
  }

  createTask(tasks: Tasks): Observable<Tasks> {
    const url = `${this.apiEndPoint}/mic1Tasks/addTasks`;
    console.log('Payload envoyé:', JSON.stringify(tasks));
    return this.http.post<Tasks>(url, tasks).pipe(
      catchError(error => {
        console.error('Tasks Create Error:', error);
        throw error;
      })
    );
  }

  /*send mail */
  sendEmail(to: string, subject: string, body: string): Observable<string> {
    const url = `${this.apiEndPoint}/mic1Feedback/send`;
    const params = { to, subject, body };
    return this.http.post(url, null, { params, responseType: 'text' });
  }
}
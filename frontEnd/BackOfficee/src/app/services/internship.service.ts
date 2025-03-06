import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Internship } from '../models/internship';

@Injectable({
  providedIn: 'root'
})
export class InternshipService {
  private baseUrl = '/api'; 
  constructor(private http: HttpClient) {}

  getAllInternships(): Observable<Internship[]> {
    return this.http.get<Internship[]>(`${this.baseUrl}/internships`);
  }

  getInternshipById(id: number): Observable<Internship> {
    return this.http.get<Internship>(`${this.baseUrl}/internships/${id}`);
  }

  createInternship(internship: Internship): Observable<Internship> {
    return this.http.post<Internship>(`${this.baseUrl}/internships`, internship);
  }

  updateInternship(internship: Internship): Observable<Internship> {
    return this.http.put<Internship>(`${this.baseUrl}/internships/${internship.id}`, internship);
  }

  deleteInternship(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/internships/${id}`);
  }
}
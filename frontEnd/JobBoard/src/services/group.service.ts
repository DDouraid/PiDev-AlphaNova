import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group } from 'src/app/core/models/group.model';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private apiUrl = '/api/groups'; // Using proxy configuration

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

  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  addGroup(group: Group): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/addGroup`, group, {
      headers: this.getAuthHeaders()
    });
  }

  updateGroup(id: number, group: Group): Observable<Group> {
    return this.http.put<Group>(`${this.apiUrl}/${id}`, group, {
      headers: this.getAuthHeaders()
    });
  }

  deleteGroup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}

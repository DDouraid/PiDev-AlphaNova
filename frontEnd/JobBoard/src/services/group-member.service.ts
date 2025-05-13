import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GroupMember } from 'src/app/core/models/group-member.model';

@Injectable({
  providedIn: 'root'
})
export class GroupMemberService {
  private apiUrl = '/api/group-members'; // Using proxy configuration

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

  getAllGroupMembers(): Observable<GroupMember[]> {
    return this.http.get<GroupMember[]>(this.apiUrl, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getGroupMemberById(id: number): Observable<GroupMember> {
    return this.http.get<GroupMember>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getMembersByGroupId(groupId: number): Observable<GroupMember[]> {
    return this.http.get<GroupMember[]>(`${this.apiUrl}/group/${groupId}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getGroupsByUserId(userId: number): Observable<GroupMember[]> {
    return this.http.get<GroupMember[]>(`${this.apiUrl}/user/${userId}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  addGroupMember(groupMember: GroupMember): Observable<GroupMember> {
    return this.http.post<GroupMember>(`${this.apiUrl}/addGroupMember`, groupMember, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  updateGroupMember(id: number, groupMember: GroupMember): Observable<GroupMember> {
    return this.http.put<GroupMember>(`${this.apiUrl}/${id}`, groupMember, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  deleteGroupMember(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Group Member Service Error:', error);
    const errorMsg = error.error?.message || error.message || 'Unknown error occurred';
    return throwError(() => new Error(errorMsg));
  }
}

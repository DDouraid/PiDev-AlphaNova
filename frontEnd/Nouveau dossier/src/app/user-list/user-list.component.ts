import { Component, OnInit } from '@angular/core';
import { ServeurService } from '../Serveurs/serveur.service';
import { User } from '../core/models/User';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(private serverService: ServeurService, private router: Router) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.serverService.getAllUsers().subscribe(
      (data) => {
        this.users = Array.isArray(data) ? data : data ? [data] : [];
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors du chargement des utilisateurs.';
        setTimeout(() => this.errorMessage = null, 2000);
      }
    );
  }

  viewTasks(userId: number): void {
    this.router.navigate(['/user-tasks', userId]);
  }

  viewFeedback(userId: number): void {
    this.router.navigate(['/user-feedback', userId]);
  }
}
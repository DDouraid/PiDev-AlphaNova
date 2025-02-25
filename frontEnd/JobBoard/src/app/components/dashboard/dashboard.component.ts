import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user = {
    username: '',
    email: '',
    roles: [] as string[]
  };
  registeredUsers: { id: number; username: string; email: string; roles: string[] }[] = [];
  stats = {
    totalUsers: 0,
    adminCount: 0,
    nonAdminCount: 0
  };
  newUser = {
    username: '',
    email: '',
    password: '',
    role: [] as string[] // Changed from 'roles' to 'role'
  };
  editUser: { id: number; username: string; email: string; roles: string[] } | null = null;
  availableRoles = ['ADMIN', 'STUDENT', 'COMPANY', 'ACADEMIC_SUPERVISOR'];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadRegisteredUsers();
  }

  loadUserInfo(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.authService.getCurrentUserFromServer().subscribe({
      next: (response) => {
        this.user.username = response.username;
        this.user.email = response.email;
        this.user.roles = response.roles || [];
      },
      error: (err) => {
        console.error('Error fetching user info:', err);
        this.router.navigate(['/login']);
      }
    });
  }

  loadRegisteredUsers(): void {
    if (!this.authService.isLoggedIn()) {
      return;
    }
    this.authService.getRegisteredUsers().subscribe({
      next: (users) => {
        this.registeredUsers = users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles || []
        }));
        this.calculateStats();
      },
      error: (err) => {
        console.error('Error fetching registered users:', err);
        this.router.navigate(['/login']);
      }
    });
  }

  calculateStats(): void {
    this.stats.totalUsers = this.registeredUsers.length;
    this.stats.adminCount = this.registeredUsers.filter(user =>
      user.roles.some(role => role.toUpperCase() === 'ADMIN')
    ).length;
    this.stats.nonAdminCount = this.stats.totalUsers - this.stats.adminCount;
  }

  createUser(): void {
    this.authService.register(this.newUser).subscribe({
      next: () => {
        this.loadRegisteredUsers(); // Refresh list
        this.resetNewUser();
        this.closeModal('createUserModal');
      },
      error: (err) => console.error('Error creating user:', err)
    });
  }

  editUserStart(user: { id: number; username: string; email: string; roles: string[] }): void {
    this.editUser = { ...user }; // Clone user for editing
  }

  updateUser(): void {
    if (!this.editUser) return;
    this.authService.updateUser(this.editUser.id, {
      username: this.editUser.username,
      email: this.editUser.email,
      roles: this.editUser.roles // Note: 'roles' here matches backend UserDTO
    }).subscribe({
      next: () => {
        this.loadRegisteredUsers(); // Refresh list
        this.editUser = null;
        this.closeModal('editUserModal');
      },
      error: (err) => console.error('Error updating user:', err)
    });
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.authService.deleteUser(userId).subscribe({
        next: () => this.loadRegisteredUsers(), // Refresh list
        error: (err) => console.error('Error deleting user:', err)
      });
    }
  }

  resetNewUser(): void {
    this.newUser = { username: '', email: '', password: '', role: [] }; // Changed to 'role'
  }

  toggleRole(role: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.newUser.role.push(role);
    } else {
      this.newUser.role = this.newUser.role.filter(r => r !== role);
    }
    console.log('New user role:', this.newUser.role);
  }

  toggleEditRole(role: string, event: Event): void {
    if (!this.editUser) return;
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.editUser.roles.push(role);
    } else {
      this.editUser.roles = this.editUser.roles.filter(r => r !== role);
    }
    console.log('Edited user roles:', this.editUser.roles);
  }

  closeModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
    }
    document.body.classList.remove('modal-open');
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

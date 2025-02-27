import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  registeredUsers: { id: number; username: string; email: string; roles: string[]; isBlocked: boolean }[] = [];
  stats = {
    totalUsers: 0,
    adminCount: 0,
    nonAdminCount: 0,
    blockedCount: 0
  };
  newUser = {
    username: '',
    email: '',
    password: '',
    role: [] as string[]
  };
  editUser: { id: number; username: string; email: string; roles: string[]; isBlocked: boolean } | null = null;
  availableRoles = ['ADMIN', 'STUDENT', 'COMPANY', 'ACADEMIC_SUPERVISOR'];
  errorMessage = ''; // Add error message for display

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

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
        console.log('User info loaded:', this.user);
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
          roles: user.roles || [],
          isBlocked: user.isBlocked
        }));
        this.errorMessage = ''; // Clear error on successful load
        console.log('Loaded registered users with isBlocked:', this.registeredUsers.map(u => ({ id: u.id, isBlocked: u.isBlocked })));
        this.calculateStats();
        this.cdr.detectChanges(); // Ensure re-render
      },
      error: (err) => {
        this.errorMessage = 'Error fetching users: ' + (err.message || 'Unknown error');
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
    this.stats.blockedCount = this.registeredUsers.filter(user => user.isBlocked).length;
  }

  createUser(): void {
    this.authService.register(this.newUser).subscribe({
      next: (response) => {
        console.log('Create user response:', response);
        this.loadRegisteredUsers();
        this.resetNewUser();
        this.closeModal('createUserModal');
      },
      error: (err) => {
        this.errorMessage = 'Error creating user: ' + (err.message || 'Unknown error');
        console.error('Error creating user:', err);
      }
    });
  }

  editUserStart(user: { id: number; username: string; email: string; roles: string[]; isBlocked: boolean }): void {
    this.editUser = { ...user };
  }

  updateUser(): void {
    if (!this.editUser) return;
    this.authService.updateUser(this.editUser.id, {
      username: this.editUser.username,
      email: this.editUser.email,
      roles: this.editUser.roles
    }).subscribe({
      next: (response) => {
        console.log('Update user response:', response);
        this.loadRegisteredUsers();
        this.editUser = null;
        this.closeModal('editUserModal');
      },
      error: (err) => {
        this.errorMessage = 'Error updating user: ' + (err.message || 'Unknown error');
        console.error('Error updating user:', err);
      }
    });
  }

  blockUser(userId: number): void {
    const userToBlock = this.registeredUsers.find(user => user.id === userId);
    if (userToBlock) {
      userToBlock.isBlocked = !userToBlock.isBlocked; // Toggle locally
      this.cdr.detectChanges(); // Force re-render
      this.authService.blockUser(userId).subscribe({
        next: (response) => {
          console.log('Block response:', response.message);
          this.loadRegisteredUsers(); // Sync with backend
        },
        error: (err) => {
          userToBlock.isBlocked = !userToBlock.isBlocked; // Revert on failure
          this.cdr.detectChanges();
          this.errorMessage = 'Error blocking user: ' + (err.message || 'Unknown error');
          console.error('Error blocking user:', err);
        }
      });
    }
  }

  resetNewUser(): void {
    this.newUser = { username: '', email: '', password: '', role: [] };
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

// frontend/src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, PaginatedUserResponse } from 'src/services/auth.service';

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
  errorMessage = '';
  // Pagination properties
  currentPage: number = 0;
  pageSize: number = 5;
  totalPages: number = 0;
  totalElements: number = 0;
  isLastPage: boolean = false;
  isLoading: boolean = false;
  // Search and sorting properties
  searchQuery: string = '';
  sortColumn: keyof { id: number; username: string; email: string; roles: string[]; isBlocked: boolean } = 'id'; // Default sort by ID
  sortDirection: 'asc' | 'desc' = 'asc'; // Default sort direction

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadRegisteredUsers();
  }

  loadUserInfo(): void {
    if (!this.authService.isLoggedIn()) {
      // this.router.navigate(['/login']);
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

  loadRegisteredUsers(page: number = this.currentPage): void {
    if (!this.authService.isLoggedIn()) {
      return;
    }
    this.isLoading = true;
    this.currentPage = page; // Update current page
    this.authService.getRegisteredUsers(page, this.pageSize, this.searchQuery).subscribe({
      next: (response: PaginatedUserResponse) => {
        this.registeredUsers = response.users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles || [],
          isBlocked: user.isBlocked
        }));
        // Sort the users locally after fetching
        this.sortUsers();
        this.currentPage = response.page;
        this.pageSize = response.size;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.isLastPage = response.last;
        this.errorMessage = '';
        console.log('Loaded registered users with isBlocked:', this.registeredUsers.map(u => ({ id: u.id, isBlocked: u.isBlocked })));
        this.calculateStats();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Error fetching users: ' + (err.message || 'Unknown error');
        console.error('Error fetching registered users:', err);
        this.registeredUsers = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  calculateStats(): void {
    this.stats.totalUsers = this.totalElements; // Use totalElements for accurate total
    this.stats.adminCount = this.registeredUsers.filter(user =>
      user.roles.some(role => role.toUpperCase() === 'ADMIN')
    ).length;
    this.stats.nonAdminCount = this.stats.totalUsers - this.stats.adminCount;
    this.stats.blockedCount = this.registeredUsers.filter(user => user.isBlocked).length;
  }

  // Handle search input changes
  onSearchChange(): void {
    this.currentPage = 0; // Reset to first page on search
    this.loadRegisteredUsers();
  }

  // Sort the table by column
  sortTable(column: keyof { id: number; username: string; email: string; roles: string[]; isBlocked: boolean }): void {
    if (this.sortColumn === column) {
      // Toggle direction if clicking the same column
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Change column and reset direction to ascending
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortUsers();
  }

  // Sort the registeredUsers array locally
  private sortUsers(): void {
    this.registeredUsers.sort((a, b) => {
      let valueA: any = a[this.sortColumn];
      let valueB: any = b[this.sortColumn];

      // Handle special cases for sorting
      if (this.sortColumn === 'roles') {
        valueA = valueA.join(', ');
        valueB = valueB.join(', ');
      } else if (this.sortColumn === 'isBlocked') {
        valueA = valueA ? 1 : 0;
        valueB = valueB ? 1 : 0;
      }

      // Compare values
      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
    this.cdr.detectChanges();
  }

  createUser(): void {
    this.authService.register(this.newUser).subscribe({
      next: (response) => {
        console.log('Create user response:', response);
        this.loadRegisteredUsers(this.currentPage);
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
        this.loadRegisteredUsers(this.currentPage);
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
      userToBlock.isBlocked = !userToBlock.isBlocked;
      this.cdr.detectChanges();
      this.authService.blockUser(userId).subscribe({
        next: (response) => {
          console.log('Block response:', response.message);
          this.loadRegisteredUsers(this.currentPage);
        },
        error: (err) => {
          userToBlock.isBlocked = !userToBlock.isBlocked;
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

  // Pagination methods
  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadRegisteredUsers(this.currentPage);
    }
  }

  nextPage(): void {
    if (!this.isLastPage) {
      this.currentPage++;
      this.loadRegisteredUsers(this.currentPage);
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadRegisteredUsers(this.currentPage);
    }
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Group } from '../core/models/group.model';
import { GroupService } from 'src/services/group.service';
import { ServeurService } from '../Serveurs/serveur.service';

declare var bootstrap: any;

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {
  @ViewChild('addGroupModal') addGroupModal!: ElementRef;
  @ViewChild('deleteConfirmationModal') deleteConfirmationModal!: ElementRef;

  groups: Group[] = [];
  groupForm: FormGroup;
  editingGroup: Group | null = null;
  isLoading: boolean = false;
  currentUserId: number | null = null;
  successMessage: string = '';
  errorMessage: string = '';
  deleteConfirmationMessage: string = '';
  groupToDelete: number | null = null;

  private addModalInstance: any;
  private deleteModalInstance: any;

  constructor(
    private groupService: GroupService,
    private serveurService: ServeurService,
    private fb: FormBuilder
  ) {
    this.groupForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadGroups();
  }

  ngAfterViewInit(): void {
    this.addModalInstance = new bootstrap.Modal(this.addGroupModal.nativeElement);
    this.deleteModalInstance = new bootstrap.Modal(this.deleteConfirmationModal.nativeElement);
  }

  loadCurrentUser(): void {
    this.serveurService.getUserDetails(0).subscribe({
      next: (user) => {
        this.currentUserId = user.id;
      },
      error: (err) => {
        console.error('Error loading current user:', err);
        this.errorMessage = 'Error loading user information';
      }
    });
  }

  loadGroups(): void {
    this.isLoading = true;
    this.groupService.getGroups().subscribe({
      next: (groups) => {
        this.groups = groups;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading groups:', err);
        this.errorMessage = 'Error loading groups';
        this.isLoading = false;
      }
    });
  }

  addGroup(): void {
    if (this.groupForm.invalid || !this.currentUserId) {
      this.errorMessage = 'Invalid form or user not authenticated';
      return;
    }

    this.isLoading = true;
    const groupData: Group = {
      name: this.groupForm.value.name,
      userId: this.currentUserId
    };

    const operation = this.editingGroup
      ? this.groupService.updateGroup(this.editingGroup.id!, groupData)
      : this.groupService.addGroup(groupData);

    operation.subscribe({
      next: () => {
        this.handleSuccess(
          this.editingGroup
            ? 'Group updated successfully'
            : 'Group created successfully'
        );
        this.loadGroups();
        this.closeModal();
      },
      error: (err) => {
        this.handleError(
          this.editingGroup
            ? 'Error updating group'
            : 'Error creating group',
          err
        );
      }
    });
  }

  editGroup(group: Group): void {
    this.editingGroup = { ...group };
    this.groupForm.patchValue({ name: group.name });
    this.openModal();
  }

  deleteGroup(id: number): void {
    this.groupToDelete = id;
    this.deleteConfirmationMessage = `Are you sure you want to delete this group?`;
    this.openDeleteModal();
  }

  confirmDelete(): void {
    if (!this.groupToDelete) return;

    this.isLoading = true;
    this.groupService.deleteGroup(this.groupToDelete).subscribe({
      next: () => {
        this.handleSuccess('Group deleted successfully');
        this.loadGroups();
        this.closeDeleteModal();
      },
      error: (err) => {
        this.handleError('Error deleting group', err);
      }
    });
  }

  private handleSuccess(message: string): void {
    this.isLoading = false;
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 3000);
  }

  private handleError(context: string, error: any): void {
    console.error(`${context}:`, error);
    this.isLoading = false;
    this.errorMessage = `${context}: ${error.message || 'Unknown error'}`;
    this.successMessage = '';
  }

  resetForm(): void {
    this.groupForm.reset();
    this.editingGroup = null;
  }

  openModal(): void {
    this.addModalInstance?.show();
  }

  closeModal(): void {
    this.addModalInstance?.hide();
    this.resetForm();
  }

  openDeleteModal(): void {
    this.deleteModalInstance?.show();
  }

  closeDeleteModal(): void {
    this.deleteModalInstance?.hide();
    this.groupToDelete = null;
  }
}

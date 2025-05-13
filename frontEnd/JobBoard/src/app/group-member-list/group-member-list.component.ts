import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GroupMember } from '../core/models/group-member.model';
import { GroupMemberService } from 'src/services/group-member.service';
import { ServeurService } from '../Serveurs/serveur.service';

@Component({
  selector: 'app-group-member-list',
  templateUrl: './group-member-list.component.html',
  styleUrls: ['./group-member-list.component.css']
})
export class GroupMemberListComponent implements OnInit {
  groupMembers: GroupMember[] = [];
  groupId: number | null = null;
  userId: number | null = null;
  currentUserId: number | null = null;
  groupMemberForm: FormGroup;
  editGroupMemberForm: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isLoading = false;
  deleteConfirmationMessage = '';
  deleteId: number | null = null;
  editId: number | null = null;

  constructor(
    private groupMemberService: GroupMemberService,
    private serveurService: ServeurService,
    private fb: FormBuilder
  ) {
    this.groupMemberForm = this.fb.group({
      groupId: ['', [Validators.required, Validators.min(1)]],
      userId: ['', [Validators.required, Validators.min(1)]]
    });

    this.editGroupMemberForm = this.fb.group({
      groupId: ['', [Validators.required, Validators.min(1)]],
      userId: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadAllGroupMembers();
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

  loadAllGroupMembers(): void {
    this.isLoading = true;
    this.groupMemberService.getAllGroupMembers().subscribe({
      next: (data) => {
        this.groupMembers = data;
        this.isLoading = false;
        this.clearMessages();
      },
      error: (err) => {
        this.handleError('Error loading group members', err);
      }
    });
  }

  loadMembersByGroupId(): void {
    if (this.groupId) {
      this.isLoading = true;
      this.groupMemberService.getMembersByGroupId(this.groupId).subscribe({
        next: (data) => {
          this.groupMembers = data;
          this.isLoading = false;
          this.clearMessages();
        },
        error: (err) => {
          this.handleError('Error loading members by group', err);
        }
      });
    }
  }

  loadGroupsByUserId(): void {
    if (this.userId) {
      this.isLoading = true;
      this.groupMemberService.getGroupsByUserId(this.userId).subscribe({
        next: (data) => {
          this.groupMembers = data;
          this.isLoading = false;
          this.clearMessages();
        },
        error: (err) => {
          this.handleError('Error loading groups by user', err);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.groupMemberForm.invalid || !this.currentUserId) {
      this.errorMessage = 'Invalid form or user not authenticated';
      return;
    }

    this.isLoading = true;
    const groupMember: GroupMember = {
      group: { id: this.groupMemberForm.value.groupId, name: '', createdBy: 0, createdAt: '' },
      userId: this.groupMemberForm.value.userId,
      joinedAt: new Date().toISOString()
    };

    this.groupMemberService.addGroupMember(groupMember).subscribe({
      next: () => {
        this.handleSuccess('Group member added successfully');
        this.groupMemberForm.reset();
        this.loadAllGroupMembers();
      },
      error: (err) => {
        this.handleError('Error adding group member', err);
      }
    });
  }

  openEditModal(member: GroupMember): void {
    this.editId = member.id!;
    this.editGroupMemberForm.patchValue({
      groupId: member.group?.id ?? 0,
      userId: member.userId
    });
  }

  onEditSubmit(): void {
    if (this.editGroupMemberForm.invalid || !this.editId) {
      this.errorMessage = 'Invalid form or missing member ID';
      return;
    }

    this.isLoading = true;
    const updatedGroupMember: GroupMember = {
      id: this.editId,
      group: { id: this.editGroupMemberForm.value.groupId, name: '', createdBy: 0, createdAt: '' },
      userId: this.editGroupMemberForm.value.userId,
      joinedAt: this.groupMembers.find(m => m.id === this.editId)?.joinedAt || ''
    };

    this.groupMemberService.updateGroupMember(this.editId, updatedGroupMember).subscribe({
      next: () => {
        this.handleSuccess('Group member updated successfully');
        this.editGroupMemberForm.reset();
        this.editId = null;
        this.loadAllGroupMembers();
      },
      error: (err) => {
        this.handleError('Error updating group member', err);
      }
    });
  }

  deleteGroupMember(id: number): void {
    this.deleteId = id;
    this.deleteConfirmationMessage = 'Are you sure you want to delete this group member?';
  }

  confirmDelete(): void {
    if (!this.deleteId) return;

    this.isLoading = true;
    this.groupMemberService.deleteGroupMember(this.deleteId).subscribe({
      next: () => {
        this.handleSuccess('Group member deleted successfully');
        this.deleteId = null;
        this.loadAllGroupMembers();
      },
      error: (err) => {
        this.handleError('Error deleting group member', err);
      }
    });
  }

  private handleSuccess(message: string): void {
    this.isLoading = false;
    this.successMessage = message;
    this.errorMessage = null;
    setTimeout(() => this.successMessage = null, 3000);
  }

  private handleError(context: string, error: any): void {
    console.error(`${context}:`, error);
    this.isLoading = false;
    this.errorMessage = `${context}: ${error.message || 'Unknown error'}`;
    this.successMessage = null;
    setTimeout(() => this.errorMessage = null, 5000);
  }

  clearMessages(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Message, MessageStatus } from '../core/models/message.model';
import { Group } from '../core/models/group.model';
import { MessageService } from 'src/services/message.service';
import { GroupService } from 'src/services/group.service';
import { ServeurService } from '../Serveurs/serveur.service';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.css']
})
export class MessageListComponent implements OnInit {
  messages: Message[] = [];
  currentUserId: number | null = null;
  receiverId: number | null = null;
  groupId: number | null = null;
  messageForm: FormGroup;
  editMessageForm: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isLoading = false;
  deleteConfirmationMessage = '';
  deleteId: number | null = null;
  editId: number | null = null;
  groups: Group[] = [];
  messageStatuses = Object.values(MessageStatus);
  messageType: 'individual' | 'group' = 'individual';

  constructor(
    private messageService: MessageService,
    private groupService: GroupService,
    private serveurService: ServeurService,
    private fb: FormBuilder
  ) {
    this.messageForm = this.fb.group({
      messageType: ['individual'],
      receiverId: [null],
      groupId: [null],
      content: ['', Validators.required],
      attachment: [null],
      status: [MessageStatus.SENT, Validators.required]
    });

    this.editMessageForm = this.fb.group({
      receiverId: [null],
      groupId: [null],
      content: ['', Validators.required],
      attachment: [null],
      status: [MessageStatus.SENT, Validators.required]
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadCurrentUser();
    this.loadAllMessages();
    this.groupService.getGroups().subscribe({
      next: (data) => {
        this.groups = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des groupes : ' + err.message;
        this.isLoading = false;
      }
    });
  }

  loadCurrentUser(): void {
    this.serveurService.getUserDetails(0).subscribe({
      next: (user) => {
        this.currentUserId = user.id;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la récupération de l\'utilisateur : ' + err.message;
        this.currentUserId = null;
        this.isLoading = false;
      }
    });
  }

  loadAllMessages(): void {
    this.isLoading = true;
    this.messageService.getAllMessages().subscribe({
      next: (data) => {
        this.messages = data;
        this.clearMessages();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des messages : ' + (err.message || 'Erreur inconnue');
        this.successMessage = null;
        this.isLoading = false;
      }
    });
  }

  loadMessagesByReceiver(): void {
    if (this.receiverId) {
      this.isLoading = true;
      this.messageService.getMessagesByReceiver(this.receiverId).subscribe({
        next: (data) => {
          this.messages = data;
          this.clearMessages();
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors du chargement des messages par destinataire : ' + (err.message || 'Erreur inconnue');
          this.successMessage = null;
          this.isLoading = false;
        }
      });
    }
  }

  loadMessagesByGroup(): void {
    if (this.groupId) {
      this.isLoading = true;
      this.messageService.getMessagesByGroup(this.groupId).subscribe({
        next: (data) => {
          this.messages = data;
          this.clearMessages();
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors du chargement des messages par groupe : ' + (err.message || 'Erreur inconnue');
          this.successMessage = null;
          this.isLoading = false;
        }
      });
    }
  }

  canEditMessage(message: Message): boolean {
    return this.currentUserId !== null && message.senderId === this.currentUserId;
  }

  onSubmit(): void {
    if (this.messageForm.invalid || !this.currentUserId) {
      this.errorMessage = 'Formulaire invalide ou utilisateur non authentifié.';
      return;
    }

    this.isLoading = true;
    const formValue = this.messageForm.value;
    const message: Message = {
      content: formValue.content,
      receiverId: formValue.messageType === 'individual' ? formValue.receiverId : null,
      groupId: formValue.messageType === 'group' ? formValue.groupId : null,
      attachment: formValue.attachment || null,
      status: formValue.status
      // Note: We don't set senderId here - backend will get it from token
    };

    this.messageService.createMessage(message).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Message envoyé avec succès !';
        this.errorMessage = null;
        this.messageForm.reset({
          messageType: 'individual',
          status: MessageStatus.SENT
        });
        this.loadAllMessages();
        this.closeModal('addMessageModal');
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Erreur inconnue lors de l\'envoi';
        this.successMessage = null;
      }
    });
  }

  openEditModal(message: Message): void {
    if (!this.canEditMessage(message)) {
      this.errorMessage = 'Vous n\'êtes pas autorisé à modifier ce message.';
      return;
    }
    this.editId = message.id ?? null;
    this.editMessageForm.patchValue({
      receiverId: message.receiverId,
      groupId: message.group ? message.group.id : null,
      content: message.content,
      attachment: message.attachment,
      status: message.status
    });
  }

  onEditSubmit(): void {
    if (this.editMessageForm.invalid || !this.editId || !this.currentUserId) {
      this.errorMessage = 'Formulaire invalide ou utilisateur non authentifié.';
      return;
    }

    this.isLoading = true;
    const updatedMessage: Message = {
      id: this.editId,
      senderId: this.currentUserId,
      receiverId: this.editMessageForm.value.receiverId || null,
      group: this.editMessageForm.value.groupId ? { id: this.editMessageForm.value.groupId, name: '' } : undefined,
      content: this.editMessageForm.value.content,
      attachment: this.editMessageForm.value.attachment || null,
      status: this.editMessageForm.value.status,
      createdAt: this.messages.find(m => m.id === this.editId)?.createdAt || '',
      updatedAt: new Date().toISOString()
    };

    this.messageService.updateMessage(this.editId, updatedMessage).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Message mis à jour avec succès !';
        this.errorMessage = null;
        this.editMessageForm.reset();
        this.loadAllMessages();
        this.closeModal('editMessageModal');
        this.editId = null;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de la mise à jour du message : ' + (err.message || 'Erreur inconnue');
        this.successMessage = null;
      }
    });
  }

  deleteMessage(id: number): void {
    const message = this.messages.find(m => m.id === id);
    if (message && !this.canEditMessage(message)) {
      this.errorMessage = 'Vous n\'êtes pas autorisé à supprimer ce message.';
      return;
    }
    this.deleteId = id;
    this.deleteConfirmationMessage = 'Êtes-vous sûr de vouloir supprimer ce message ?';
    const modal = document.getElementById('deleteConfirmationModal');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
  }

  confirmDelete(): void {
    if (!this.deleteId) return;

    this.isLoading = true;
    this.messageService.deleteMessage(this.deleteId).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Message supprimé avec succès !';
        this.errorMessage = null;
        this.loadAllMessages();
        this.closeModal('deleteConfirmationModal');
        this.deleteId = null;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de la suppression du message : ' + (err.message || 'Erreur inconnue');
        this.successMessage = null;
        this.closeModal('deleteConfirmationModal');
      }
    });
  }

  closeModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
    }
  }

  clearMessages(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }
}

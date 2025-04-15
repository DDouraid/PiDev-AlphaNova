import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServeurService } from '../Serveurs/serveur.service';
import { Tasks, TasksStatus } from '../core/models/Tasks';
import { ChangeDetectorRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ViewEncapsulation } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-user-tasks',
  templateUrl: './user-tasks.component.html',
  styleUrls: ['./user-tasks.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class UserTasksComponent implements OnInit {
  TasksStatus = TasksStatus;
  userId: number;
  todoTasks: Tasks[] = [];
  inProgressTasks: Tasks[] = [];
  doneTasks: Tasks[] = [];
  newTask: Tasks = {
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    status: TasksStatus.TO_DO,
    userId: 0
  };
  isEditMode: boolean = false;
  addModalInstance: any;
  updateModalInstance: any;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

  totalTasks: number = 0;
  todoPercentage: number = 0;
  inProgressPercentage: number = 0;
  donePercentage: number = 0;

  private inappropriateWords = ['putain', 'merde', 'con', 'salope'];

  constructor(
    private route: ActivatedRoute,
    private serverService: ServeurService,
    private cdr: ChangeDetectorRef
  ) {
    this.userId = +this.route.snapshot.paramMap.get('userId')!;
    this.newTask.userId = this.userId;
  }

  ngOnInit(): void {
    this.loadTasks();
    this.loadStatistics();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.serverService.getTasksByUser(this.userId).subscribe(
      (data) => {
        const tasks = Array.isArray(data) ? data : data ? [data] : [];
        this.todoTasks = tasks.filter(task => task.status === TasksStatus.TO_DO);
        this.inProgressTasks = tasks.filter(task => task.status === TasksStatus.IN_PROGRESS);
        this.doneTasks = tasks.filter(task => task.status === TasksStatus.DONE);
        this.isLoading = false;
        this.loadStatistics();
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors du chargement des tâches.';
        setTimeout(() => this.errorMessage = null, 2000);
      }
    );
  }

  loadStatistics(): void {
    this.serverService.getTaskStatisticsByUser(this.userId).subscribe(
      (stats: any) => {
        this.totalTasks = stats.totalTasks || 0;
        this.todoPercentage = stats.todoPercentage || 0;
        this.inProgressPercentage = stats.inProgressPercentage || 0;
        this.donePercentage = stats.donePercentage || 0;
      },
      (error) => {
        this.errorMessage = 'Erreur lors du chargement des statistiques.';
        setTimeout(() => this.errorMessage = null, 2000);
      }
    );
  }

  drop(event: CdkDragDrop<Tasks[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      const previousContainerData = [...event.previousContainer.data];
      const containerData = [...event.container.data];

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const newStatus = this.getStatusFromContainer(event.container.id);
      task.status = newStatus;

      this.cdr.detectChanges();
      this.updateTaskStatus(task);
    }
    this.loadStatistics();
  }

  private updateTaskStatus(task: Tasks): void {
    if (task.id !== undefined) {
      this.serverService.updateTask(task).subscribe(
        () => this.successMessage = 'Statut mis à jour avec succès',
        (error) => {
          this.errorMessage = 'Erreur lors de la mise à jour du statut';
          this.loadTasks();
          setTimeout(() => this.errorMessage = null, 2000);
        }
      );
    }
  }

  private getStatusFromContainer(containerId: string): TasksStatus {
    switch (containerId) {
      case 'todoList': return TasksStatus.TO_DO;
      case 'inProgressList': return TasksStatus.IN_PROGRESS;
      case 'doneList': return TasksStatus.DONE;
      default: return TasksStatus.TO_DO;
    }
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.resetTaskForm();
    this.openModal('addTaskModal', (instance) => this.addModalInstance = instance);
  }

  openUpdateModal(task: Tasks): void {
    this.isEditMode = true;
    this.newTask = { ...task };
    this.openModal('updateTaskModal', (instance) => this.updateModalInstance = instance);
  }

  private openModal(modalId: string, setInstance: (instance: any) => void): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      const modalInstance = new bootstrap.Modal(modal);
      setInstance(modalInstance);
      modalInstance.show();
    }
  }

  private closeModal(modalInstance: any): void {
    if (modalInstance) {
      modalInstance.hide();
      setTimeout(() => {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
        document.body.classList.remove('modal-open');
        document.body.style.overflow = 'auto';
        this.cdr.detectChanges();
      }, 300);
    }
  }

  isTaskValid(task: Tasks): boolean {
    return task.title.trim() !== '' &&
      task.description.trim() !== '' &&
      task.startDate &&
      task.endDate &&
      this.isValidDateRange();
  }

  isValidDateRange(): boolean {
    return new Date(this.newTask.startDate) <= new Date(this.newTask.endDate);
  }

  checkForInappropriateWords(text: string): boolean {
    const words = text.toLowerCase().split(/\s+/);
    return words.some(word => this.inappropriateWords.includes(word));
  }

  saveTask(): void {
    if (this.checkForInappropriateWords(this.newTask.title) ||
      this.checkForInappropriateWords(this.newTask.description)) {
      this.errorMessage = 'Le titre ou la description contient des mots inappropriés.';
      setTimeout(() => this.errorMessage = null, 2000);
      return;
    }

    if (!this.isTaskValid(this.newTask)) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      setTimeout(() => this.errorMessage = null, 2000);
      return;
    }

    this.isLoading = true;
    const action = this.isEditMode
      ? this.serverService.updateTask(this.newTask)
      : this.serverService.createTask(this.newTask);

    action.subscribe(
      (response) => {
        this.isLoading = false;
        this.successMessage = `Tâche ${this.isEditMode ? 'mise à jour' : 'ajoutée'} avec succès`;
        this.closeModal(this.isEditMode ? this.updateModalInstance : this.addModalInstance);
        this.loadTasks();
        this.resetTaskForm();
        setTimeout(() => this.successMessage = null, 2000);
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = `Échec de ${this.isEditMode ? 'la mise à jour' : "l'ajout"} de la tâche`;
        setTimeout(() => this.errorMessage = null, 2000);
      }
    );
  }

  deleteTask(id: number | undefined): void {
    if (id === undefined) return;
    if (confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
      this.isLoading = true;
      this.serverService.deleteTask(id).subscribe(
        () => {
          this.isLoading = false;
          this.successMessage = 'Tâche supprimée avec succès';
          this.loadTasks();
          setTimeout(() => this.successMessage = null, 2000);
        },
        (error) => {
          this.isLoading = false;
          this.errorMessage = 'Échec de la suppression de la tâche';
          setTimeout(() => this.errorMessage = null, 2000);
        }
      );
    }
  }

  private resetTaskForm(): void {
    this.newTask = {
      title: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      status: TasksStatus.TO_DO,
      userId: this.userId
    };
  }
}
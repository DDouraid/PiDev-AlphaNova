import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ServeurService } from '../Serveurs/serveur.service';
import { Tasks, TasksStatus } from '../core/models/Tasks';
import { ChangeDetectorRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-liste-tasks',
  templateUrl: './liste-tasks.component.html',
  styleUrls: ['./liste-tasks.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ListeTasksComponent implements OnInit {
  @ViewChild('closeModalButton') closeModalButton!: ElementRef;

  TasksStatus = TasksStatus;
  filterTasks: Tasks[] = [];
  ListTasks: Tasks[] = [];
  newTask: Tasks = {
    id: 0,
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    status: TasksStatus.TO_DO,
    userId: 0
  };
  isEditing: boolean = false;
  showSuccessAlert: boolean = false;
  successMessage: string = '';

  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 0;
  searchDate: string = '';

  // Statistiques
  taskStatusStats = { todo: 0, inProgress: 0, done: 0, total: 0 };

  private inappropriateWords = ['putain', 'merde', 'con', 'salope'];

  constructor(
    private serverService: ServeurService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadTaskStatistics();
  }

  loadTasks(): void {
    this.serverService.getAllTasks().subscribe({
      next: (data: Tasks[]) => {
        this.ListTasks = data;
        this.filterTasks = [...this.ListTasks];
        this.calculateTotalPages();
        this.updateTaskStatusStats();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des tâches:', err);
        this.showAlert('Erreur lors du chargement des tâches.');
      }
    });
  }

  loadTaskStatistics(): void {
    this.serverService.getTaskStatistics().subscribe({
      next: (stats: any) => {
        this.taskStatusStats = {
          todo: stats.todoTasks || 0,
          inProgress: stats.inProgressTasks || 0,
          done: stats.doneTasks || 0,
          total: stats.totalTasks || 0
        };
      },
      error: (err) => {
        console.error('Erreur stats tâches:', err);
        this.taskStatusStats = { todo: 0, inProgress: 0, done: 0, total: 0 };
        this.showAlert('Erreur lors du chargement des statistiques.');
      }
    });
  }

  updateTaskStatusStats(): void {
    this.taskStatusStats = {
      todo: this.ListTasks.filter(task => task.status === TasksStatus.TO_DO).length,
      inProgress: this.ListTasks.filter(task => task.status === TasksStatus.IN_PROGRESS).length,
      done: this.ListTasks.filter(task => task.status === TasksStatus.DONE).length,
      total: this.ListTasks.length
    };
  }

  addTask(): void {
    if (this.checkForInappropriateWords(this.newTask.title) ||
        this.checkForInappropriateWords(this.newTask.description)) {
      this.showAlert('Le titre ou la description contient des mots inappropriés.');
      return;
    }

    if (!this.isTaskValid(this.newTask)) {
      this.showAlert('Veuillez remplir tous les champs correctement.');
      return;
    }

    const taskToAdd: Tasks = { ...this.newTask };
    if (typeof taskToAdd.startDate === 'string') {
      taskToAdd.startDate = new Date(taskToAdd.startDate);
    }
    if (typeof taskToAdd.endDate === 'string') {
      taskToAdd.endDate = new Date(taskToAdd.endDate);
    }

    // Set userId from authenticated user (assuming token contains user info)
    this.serverService.getUserDetails(0).subscribe({
      next: (user) => {
        taskToAdd.userId = user.id;
        this.serverService.createTask(taskToAdd).subscribe({
          next: (addedTask: Tasks) => {
            this.ListTasks.push(addedTask);
            this.filterTasks = [...this.ListTasks];
            this.calculateTotalPages();
            this.updateTaskStatusStats();
            this.showAlert('Tâche ajoutée avec succès !');
            this.closeAndResetForm();
            this.closeModal('taskModal');
            this.loadTaskStatistics();
          },
          error: (err) => {
            console.error('Erreur lors de l\'ajout de la tâche:', err);
            this.showAlert('Erreur lors de l\'ajout de la tâche.');
          }
        });
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de l\'utilisateur:', err);
        this.showAlert('Erreur lors de la récupération de l\'utilisateur.');
      }
    });
  }

  updateTask(): void {
    if (this.checkForInappropriateWords(this.newTask.title) ||
        this.checkForInappropriateWords(this.newTask.description)) {
      this.showAlert('Le titre ou la description contient des mots inappropriés.');
      return;
    }

    if (!this.isTaskValid(this.newTask)) {
      this.showAlert('Veuillez remplir tous les champs correctement.');
      return;
    }

    const taskToUpdate: Tasks = { ...this.newTask };
    if (typeof taskToUpdate.startDate === 'string') {
      taskToUpdate.startDate = new Date(taskToUpdate.startDate);
    }
    if (typeof taskToUpdate.endDate === 'string') {
      taskToUpdate.endDate = new Date(taskToUpdate.endDate);
    }

    this.serverService.updateTask(taskToUpdate).subscribe({
      next: (updatedTask: Tasks) => {
        const index = this.ListTasks.findIndex(task => task.id === updatedTask.id);
        if (index !== -1) {
          this.ListTasks[index] = { ...updatedTask };
          this.filterTasks = [...this.ListTasks];
          this.cdr.detectChanges(); // Force UI refresh
        }
        this.updateTaskStatusStats();
        this.loadTaskStatistics();
        this.showAlert('Tâche modifiée avec succès !');
        this.closeAndResetForm();
        this.closeModal('taskModal');
      },
      error: (err) => {
        console.error('Erreur lors de la modification de la tâche:', err);
        this.showAlert('Erreur lors de la modification de la tâche.');
      }
    });
  }
  deleteTask(id: number | undefined): void {
    if (id === undefined) return;
    if (!confirm('Voulez-vous vraiment supprimer cette tâche ?')) return;

    this.serverService.deleteTask(id).subscribe({
      next: () => {
        this.ListTasks = this.ListTasks.filter(task => task.id !== id);
        this.filterTasks = [...this.ListTasks];
        this.calculateTotalPages();
        this.updateTaskStatusStats();
        this.showAlert('Tâche supprimée avec succès !');
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = this.totalPages;
        }
        this.loadTaskStatistics();
      },
      error: (err) => {
        console.error('Erreur lors de la suppression de la tâche:', err);
        this.showAlert('Erreur lors de la suppression de la tâche.');
      }
    });
  }

  drop(event: CdkDragDrop<Tasks[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = { ...event.previousContainer.data[event.previousIndex] };
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

      this.serverService.updateTask(task).subscribe({
        next: () => {
          this.loadTasks(); // Reload all tasks
          this.loadTaskStatistics();
          this.showAlert('Statut de la tâche mis à jour avec succès !');
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour du statut:', err);
          event.previousContainer.data = previousContainerData;
          event.container.data = containerData;
          this.cdr.detectChanges();
          this.showAlert('Erreur lors de la mise à jour du statut.');
        }
      });
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

  prepareNewTask(): void {
    this.isEditing = false;
    this.resetTaskForm();
  }

  prepareEditTask(task: Tasks): void {
    this.isEditing = true;
    this.newTask = { ...task };
    if (this.newTask.startDate instanceof Date) {
      this.newTask.startDate = this.newTask.startDate.toISOString().split('T')[0] as any;
    }
    if (this.newTask.endDate instanceof Date) {
      this.newTask.endDate = this.newTask.endDate.toISOString().split('T')[0] as any;
    }
  }

  private calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredTasks.length / this.pageSize);
  }

  get paginatedTasks(): Tasks[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredTasks.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  get filteredTasks(): Tasks[] {
    if (!this.searchDate.trim()) {
      return this.ListTasks;
    }
    const searchDateStr = new Date(this.searchDate).toISOString().split('T')[0];
    return this.filterTasks.filter(task => {
      const startDateStr = new Date(task.startDate).toISOString().split('T')[0];
      const endDateStr = new Date(task.endDate).toISOString().split('T')[0];
      return startDateStr === searchDateStr || endDateStr === searchDateStr;
    });
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  private closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      document.body.classList.remove('modal-open');
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
    }
  }

  showAlert(message: string): void {
    this.successMessage = message;
    this.showSuccessAlert = true;
    setTimeout(() => {
      this.showSuccessAlert = false;
    }, 3000);
  }

  closeAlert(): void {
    this.showSuccessAlert = false;
  }

  closeAndResetForm(): void {
    this.resetTaskForm();
  }

  resetTaskForm(): void {
    this.newTask = {
      id: 0,
      title: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      status: TasksStatus.TO_DO,
      userId: 0
    };
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
}

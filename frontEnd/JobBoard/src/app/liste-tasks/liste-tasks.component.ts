import { Component, OnInit } from '@angular/core';
import { ServeurService, Tasks , TasksStatus } from '../Serveurs/serveur.service';
import { ChangeDetectorRef } from '@angular/core';
declare var bootstrap: any;

@Component({
  selector: 'app-liste-tasks',
  templateUrl: './liste-tasks.component.html',
  styleUrls: ['./liste-tasks.component.css']
})
export class ListeTasksComponent implements OnInit{
  TasksStatus = TasksStatus;
  listTasks: Tasks[] = []; // Changed to Tasks array
  newTask: Tasks = {
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    status: TasksStatus.TODO // Use enum value instead of 'TODO'
  };
  selectedTask: Tasks = { // Changed to Tasks object
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    status: TasksStatus.TODO
  };
  addModalInstance: any;
  updateModalInstance: any;

  constructor(private serverService: ServeurService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadTasks(); // Renamed method
  }

  openModal(): void {
    const modal = document.getElementById('addTaskModal');
    if (modal) {
      this.addModalInstance = new bootstrap.Modal(modal);
      this.addModalInstance.show();
    }
  }

  closeModal(): void {
    if (this.addModalInstance) {
      this.addModalInstance.hide();
      setTimeout(() => {
        document.body.focus();
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.remove();
          document.body.style.overflow = 'auto';
          document.body.style.position = '';
        }
        this.cdr.detectChanges();
      }, 300);
    }
  }

  openUpdateModal(): void {
    const modal = document.getElementById('updateTaskModal');
    if (modal) {
      this.updateModalInstance = new bootstrap.Modal(modal);
      this.updateModalInstance.show();
    }
  }

  closeUpdateModal(): void {
    if (this.updateModalInstance) {
      this.updateModalInstance.hide();
      setTimeout(() => {
        document.body.focus();
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.remove();
          document.body.style.overflow = 'auto';
          document.body.style.position = '';
        }
        this.cdr.detectChanges();
      }, 300);
    }
  }

  selectTaskForUpdate(task: Tasks): void { // Changed parameter type
    this.selectedTask = { ...task }; // Create a copy
    this.openUpdateModal();
  }

  deleteTask(id: number | undefined): void { // id is optional in Tasks
    if (id === undefined) return;
    if (confirm('Are you sure you want to delete this task?')) {
      this.serverService.deleteTask(id).subscribe(
        () => {
          console.log('Task deleted successfully');
          this.loadTasks();
        },
        error => {
          console.error('Error deleting task:', error);
          alert('Failed to delete task. Please try again or contact support.');
        }
      );
    }
  }

  addTask(): void { // Renamed method
    if (!this.newTask.title.trim() || !this.newTask.description.trim()) {
      alert('Please provide a valid title and description.');
      return;
    }

    this.serverService.createTask(this.newTask).subscribe(
      response => {
        console.log('Task added successfully:', response);
        if (this.addModalInstance) {
          this.addModalInstance.hide();
        }
        this.loadTasks();
        this.resetForm();
      },
      error => {
        console.error('Error adding task:', error);
        alert('Failed to add task. Please try again or contact support.');
      }
    );
  }

  updateTask(): void { // Renamed method
    if (!this.selectedTask.title.trim() || !this.selectedTask.description.trim()) {
      alert('Please provide a valid title and description.');
      return;
    }

    this.serverService.updateTask(this.selectedTask).subscribe(
      response => {
        console.log('Task updated successfully:', response);
        if (this.updateModalInstance) {
          this.updateModalInstance.hide();
        }
        this.loadTasks();
        this.resetSelectedTask();
      },
      error => {
        console.error('Error updating task:', error);
        alert('Failed to update task. Please try again or contact support.');
      }
    );
  }

  resetForm(): void {
    this.newTask = {
      title: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      status: TasksStatus.TODO
    };
  }

  resetSelectedTask(): void { // Renamed method
    this.selectedTask = {
      title: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      status: TasksStatus.TODO
    };
  }

  loadTasks(): void { // Renamed method
    this.serverService.getAllTasks().subscribe(
      data => {
        console.log('Tasks data:', data);
        this.listTasks = Array.isArray(data) ? data : data ? [data] : [];
      },
      error => {
        console.error('Error fetching tasks:', error);
        this.listTasks = [];
      }
    );
  }
}

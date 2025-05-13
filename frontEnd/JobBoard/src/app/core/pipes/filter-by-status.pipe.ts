// src/app/core/pipes/filter-by-status.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { Tasks, TasksStatus } from '../models/Tasks';

@Pipe({
  name: 'filterByStatus'
})
export class FilterByStatusPipe implements PipeTransform {
  transform(tasks: Tasks[], status: TasksStatus): Tasks[] {
    return tasks.filter(task => task.status === status);
  }
}

export interface Tasks {
  id?: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: TasksStatus;
}

export enum TasksStatus {
  TO_DO = 'TO_DO',        // Aligné avec le backend
  IN_PROGRESS= 'IN_PROGRESS', // Orthographe backend
  DONE = 'DONE'
}
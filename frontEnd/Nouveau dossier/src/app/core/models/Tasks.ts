export interface Tasks {
  id?: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: TasksStatus;
  userId: number; // Replace user: User with userId
}

export enum TasksStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  TO_DO = 'TO_DO'
}
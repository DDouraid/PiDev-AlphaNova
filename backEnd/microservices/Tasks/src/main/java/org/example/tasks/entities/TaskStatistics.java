package org.example.tasks.entities;

public interface TaskStatistics {
    Long getTotalTasks();
    Double getTodoPercentage();
    Double getInProgressPercentage();
    Double getDonePercentage();
}
package org.example.tasks.service;

import org.example.tasks.entities.TaskStatistics;
import org.example.tasks.entities.Tasks;
import org.example.tasks.repo.TasksRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TasksService {
    @Autowired
    TasksRepo tasksRepo;

    public Tasks addTasks(Tasks task) {
        return tasksRepo.save(task);
    }

    public void deleteTasks(Integer idResult) {
        tasksRepo.deleteById(idResult);
    }

    public List<Tasks> getAllTasks() {
        return tasksRepo.findAll();
    }

    public Tasks updateTasks(Tasks tasks) {
        return tasksRepo.findById(tasks.getId())
                .map(existingEvent -> {
                    existingEvent.setId(tasks.getId());
                    existingEvent.setTitle(tasks.getTitle());
                    existingEvent.setDescription(tasks.getDescription());
                    existingEvent.setStartDate(tasks.getStartDate());
                    existingEvent.setEndDate(tasks.getEndDate());
                    existingEvent.setStatus(tasks.getStatus());
                    return tasksRepo.save(existingEvent);
                })
                .orElseThrow(() -> new RuntimeException("tasks not found with id: " + tasks.getId()));
    }

    public TaskStatistics getTaskStatistics() {
        return tasksRepo.getTaskStatistics();
    }
}

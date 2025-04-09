package org.example.tasks.controller;

import org.example.tasks.entities.TaskStatistics;
import org.example.tasks.entities.Tasks;
import org.example.tasks.service.TasksService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("mic1Tasks")
@CrossOrigin(origins = "http://localhost:4200")
public class TasksController {
    @Autowired
    TasksService tasksService;

    @PostMapping("/addTasks")
    public Tasks addTasks(@RequestBody Tasks tasks) {
        return tasksService.addTasks(tasks);
    }


    @GetMapping("/findAll")
    public List<Tasks> getAllEvent() {
        return tasksService.getAllTasks();
    }

    @PutMapping("/updateTasks/{id}")
    public Tasks updateTasks(@PathVariable Integer id, @RequestBody Tasks tasks) {

        tasks.setId(id);
        return tasksService.updateTasks(tasks);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteTasks(@PathVariable Integer id) {
        tasksService.deleteTasks(id);
    }

    @GetMapping("/statistics")
    public TaskStatistics getTaskStatistics() {
        return tasksService.getTaskStatistics();
    }
}

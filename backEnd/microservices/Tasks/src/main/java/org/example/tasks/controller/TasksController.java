package org.example.tasks.controller;

import org.example.tasks.Clients.UserServiceClient;
import org.example.tasks.DTO.UserDTO;
import org.example.tasks.entities.TaskStatistics;
import org.example.tasks.entities.Tasks;
import org.example.tasks.service.TasksService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController

@RequestMapping("mic1Tasks")
public class TasksController {
    @Autowired
    TasksService tasksService;
    @Autowired
    private UserServiceClient userServiceClient;

    @PostMapping("/addTasks")
    public Tasks addTasks(@RequestBody Tasks tasks, @RequestHeader("Authorization") String token) {
        // Get user info from user service
        UserDTO user = userServiceClient.getCurrentUser(token);

        // Set user info in event
        tasks.setUserId(user.getId());
        tasks.setUsername(user.getUsername());
        return tasksService.addTasks(tasks);
    }


    @GetMapping("/findAll")
    public List<Tasks> getAllEvent() {
        return tasksService.getAllTasks();
    }

    @PutMapping("/updateTasks/{id}")
    public Tasks updateTasks(@PathVariable Integer id, @RequestBody Tasks tasks, @RequestHeader("Authorization") String token) {
        // Get user info from user service
        UserDTO user = userServiceClient.getCurrentUser(token);

        // Set user info in event
        tasks.setUserId(user.getId());
        tasks.setUsername(user.getUsername());

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

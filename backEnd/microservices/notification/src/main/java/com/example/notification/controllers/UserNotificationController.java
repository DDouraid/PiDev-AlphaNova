package com.example.notification.controllers;

import com.example.notification.entites.UserNotification;
import com.example.notification.service.UserNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/user-notifications")
public class UserNotificationController {

    @Autowired
    private UserNotificationService userNotificationService;

    // Get all user notifications (new endpoint)
    @GetMapping
    public ResponseEntity<List<UserNotification>> getAllUserNotifications() {
        return ResponseEntity.ok(userNotificationService.getAllUserNotifications());
    }

    // Get all notifications for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserNotification>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(userNotificationService.getUserNotifications(userId));
    }

    // Get a specific user notification
    @GetMapping("/{id}")
    public ResponseEntity<UserNotification> getUserNotification(@PathVariable Long id) {
        Optional<UserNotification> userNotification = userNotificationService.getUserNotificationById(id);
        return userNotification.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create a new user notification
    @PostMapping
    public ResponseEntity<UserNotification> createUserNotification(@RequestBody UserNotification userNotification) {
        return ResponseEntity.ok(userNotificationService.createUserNotification(userNotification));
    }

    // Update an existing user notification
    @PutMapping("/{id}")
    public ResponseEntity<UserNotification> updateUserNotification(@PathVariable Long id, @RequestBody UserNotification userNotification) {
        UserNotification updatedUserNotification = userNotificationService.updateUserNotification(id, userNotification);
        if (updatedUserNotification != null) {
            return ResponseEntity.ok(updatedUserNotification);
        }
        return ResponseEntity.notFound().build();
    }

    // Mark a user notification as read
    @PatchMapping("/{id}/read")
    public ResponseEntity<UserNotification> markAsRead(@PathVariable Long id) {
        UserNotification userNotification = userNotificationService.markAsRead(id);
        if (userNotification != null) {
            return ResponseEntity.ok(userNotification);
        }
        return ResponseEntity.notFound().build();
    }

    // Delete a user notification
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserNotification(@PathVariable Long id) {
        userNotificationService.deleteUserNotification(id);
        return ResponseEntity.noContent().build();
    }
}
package com.example.notification.service;

import com.example.notification.entites.Notification;
import com.example.notification.entites.NotificationNotFoundException;
import com.example.notification.entites.UserNotification;
import com.example.notification.repository.NotificationRepository;
import com.example.notification.repository.UserNotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserNotificationService {

    @Autowired
    private UserNotificationRepository userNotificationRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    // Create a notification for a user
    public UserNotification createUserNotification(UserNotification userNotification) {
        Long notificationId = userNotification.getNotification().getId();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found with id: " + notificationId));

        userNotification.setNotification(notification);
        return userNotificationRepository.save(userNotification);
    }

    // Get all notifications for a user
    public List<UserNotification> getUserNotifications(Long userId) {
        return userNotificationRepository.findByUserId(userId);
    }

    // Get a specific user notification by ID
    public Optional<UserNotification> getUserNotificationById(Long id) {
        return userNotificationRepository.findById(id);
    }

    // Get a specific notification for a user
    public Optional<UserNotification> getUserNotification(Long userId, Long notificationId) {
        return userNotificationRepository.findByUserIdAndNotificationId(userId, notificationId)
                .or(() -> {
                    throw new NotificationNotFoundException("Notification not found for userId " + userId + " and notificationId " + notificationId);
                });
    }

    // Update an existing user notification
    public UserNotification updateUserNotification(Long id, UserNotification updatedUserNotification) {
        return userNotificationRepository.findById(id)
                .map(existingUserNotification -> {
                    existingUserNotification.setReadAt(updatedUserNotification.getReadAt());
                    return userNotificationRepository.save(existingUserNotification);
                })
                .orElseThrow(() -> new NotificationNotFoundException("User notification not found with id: " + id));
    }

    // Mark a notification as read
    public UserNotification markAsRead(Long id) {
        return userNotificationRepository.findById(id)
                .map(notification -> {
                    notification.setReadAt(LocalDateTime.now());
                    return userNotificationRepository.save(notification);
                })
                .orElseThrow(() -> new NotificationNotFoundException("User notification not found with id: " + id));
    }

    // Delete a user notification
    public void deleteUserNotification(Long id) {
        if (!userNotificationRepository.existsById(id)) {
            throw new NotificationNotFoundException("User notification not found with id: " + id);
        }
        userNotificationRepository.deleteById(id);
    }
}

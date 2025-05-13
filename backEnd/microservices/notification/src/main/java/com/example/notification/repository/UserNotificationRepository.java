package com.example.notification.repository;

import com.example.notification.entites.UserNotification;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface UserNotificationRepository extends CrudRepository<UserNotification, Long> {

    // Find all notifications for a user (without pagination)
    List<UserNotification> findByUserId(Long userId);

    // Find a specific notification for a user
    Optional<UserNotification> findByUserIdAndNotificationId(Long userId, Long notificationId);
}
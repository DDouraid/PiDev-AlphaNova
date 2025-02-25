package com.example.notification.repository;

import com.example.notification.entites.UserNotification;
import org.springframework.data.repository.CrudRepository;
import java.util.List;
import java.util.Optional;

public interface UserNotificationRepository extends CrudRepository<UserNotification, Long> {

    // Trouver toutes les notifications d'un utilisateur (sans pagination)
    List<UserNotification> findByUserId(Long userId);

    // Trouver une notification spécifique pour un utilisateur
    Optional<UserNotification> findByUserIdAndNotificationId(Long userId, Long notificationId);
}

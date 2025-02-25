package com.example.notification.repository;

import com.example.notification.entites.Notification;
import com.example.notification.entites.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Récupérer toutes les notifications d'un utilisateur
    List<Notification> findByUserId(Long userId);

    // Récupérer les notifications non lues d'un utilisateur
    List<Notification> findByUserIdAndStatus(Long userId, NotificationStatus status);
}

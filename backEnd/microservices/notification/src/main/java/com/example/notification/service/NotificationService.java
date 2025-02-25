package com.example.notification.service;

import com.example.notification.entites.Notification;
import com.example.notification.entites.NotificationStatus;
import com.example.notification.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    // Récupérer toutes les notifications d'un utilisateur
    public List<Notification> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserId(userId);
    }

    // Récupérer les notifications non lues d'un utilisateur
    public List<Notification> getUnreadNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdAndStatus(userId, NotificationStatus.UNREAD);
    }

    // Récupérer une notification par son ID
    public Optional<Notification> getNotificationById(Long id) {
        return notificationRepository.findById(id);
    }

    // Créer une nouvelle notification
    public Notification createNotification(Notification notification) {
        notification.setCreatedAt(LocalDateTime.now());
        notification.setUpdatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    // Mettre à jour une notification existante
    public Notification updateNotification(Long id, Notification notificationDetails) {
        Optional<Notification> optionalNotification = notificationRepository.findById(id);
        if (optionalNotification.isPresent()) {
            Notification notification = optionalNotification.get();
            notification.setMessage(notificationDetails.getMessage());
            notification.setType(notificationDetails.getType());
            notification.setStatus(notificationDetails.getStatus());
            notification.setUpdatedAt(LocalDateTime.now());
            return notificationRepository.save(notification);
        }
        return null; // Peut être géré via une exception
    }

    // Marquer une notification comme lue
    public Notification markNotificationAsRead(Long notificationId) {
        Optional<Notification> optionalNotification = notificationRepository.findById(notificationId);
        if (optionalNotification.isPresent()) {
            Notification notification = optionalNotification.get();
            notification.setStatus(NotificationStatus.READ);
            notification.setUpdatedAt(LocalDateTime.now());
            return notificationRepository.save(notification);
        }
        return null;
    }

    // Supprimer une notification
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }
}

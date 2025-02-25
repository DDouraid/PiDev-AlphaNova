package com.example.notification.entites;



import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;  // ID de l'utilisateur qui reçoit la notification

    private String message;  // Contenu de la notification

    @Enumerated(EnumType.STRING)
    private NotificationType type;  // Type de notification (system, application, document, reminder)

    @Enumerated(EnumType.STRING)
    private NotificationStatus status;  // Statut de la notification (unread, read)

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;  // Date d'envoi de la notification

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;  // Dernière mise à jour de la notification

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public NotificationStatus getStatus() {
        return status;
    }

    public void setStatus(NotificationStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Constructor
    public Notification(String message, NotificationType type, NotificationStatus status, Long userId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.message = message;
        this.type = type;
        this.status = status;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Default constructor
    public Notification() {
    }

    // Méthode statique pour créer une notification
    public static Notification createNotification(Long userId, String message, NotificationType type, NotificationStatus status) {
        LocalDateTime now = LocalDateTime.now();
        Notification notification = new Notification();
        notification.setUserId(userId);  // Utilisation de l'ID utilisateur directement
        notification.setMessage(message);
        notification.setType(type);
        notification.setStatus(status);
        notification.setCreatedAt(now);
        notification.setUpdatedAt(now);
        return notification;
    }
}

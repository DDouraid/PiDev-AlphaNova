package com.example.notification.entites;

import com.example.notification.entites.Notification;
import jakarta.persistence.*;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.time.LocalDateTime;


@Entity
public class UserNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;  // L'ID de l'utilisateur auquel la notification est associée

    @ManyToOne
    @JoinColumn(name = "notification_id", referencedColumnName = "id", nullable = false)
    private Notification notification;  // La notification envoyée à l'utilisateur

    private LocalDateTime readAt;  // Date de lecture de la notification, peut être NULL si non lue

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

    public Notification getNotification() {
        return notification;
    }

    public void setNotification(Notification notification) {
        this.notification = notification;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }

    // Constructor
    public UserNotification(Long userId, Notification notification, LocalDateTime readAt) {
        this.userId = userId;
        this.notification = notification;
        this.readAt = readAt;
    }

    // Default constructor
    public UserNotification() {
    }
}
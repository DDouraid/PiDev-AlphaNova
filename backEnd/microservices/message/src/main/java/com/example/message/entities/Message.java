package com.example.message.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // New field for user ID
    private String username; // New field for username   // ID de l'expéditeur du message
    private Long receiverId;  // ID du destinataire (NULL si message de groupe)

    @ManyToOne
    @JoinColumn(name = "group_id")
    @JsonBackReference  // Exclu lors de la sérialisation pour éviter les boucles
    private Groups group;     // Groupe cible (NULL si message privé)

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private String attachment;

    @Enumerated(EnumType.STRING)
    private MessageStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Message() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // === Getters & Setters ===
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }

    public Groups getGroup() { return group; }
    public void setGroup(Groups group) { this.group = group; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getAttachment() { return attachment; }
    public void setAttachment(String attachment) { this.attachment = attachment; }

    public MessageStatus getStatus() { return status; }
    public void setStatus(MessageStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

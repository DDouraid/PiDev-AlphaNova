package org.example.feedback.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class Feedback {
    @Id
    @GeneratedValue
    private int id;
    private String comment;
    private Float note;
    private Long userId; // New field for user ID
    private String username; // New field for username

    public Feedback() {
    }

    public Feedback(int id, String comment, Float note, Long userId, String username) {
        this.id = id;
        this.comment = comment;
        this.note = note;
        this.userId = userId;
        this.username = username;
    }

    public Feedback(String comment, Float note, Long userId, String username) {
        this.comment = comment;
        this.note = note;
        this.userId = userId;
        this.username = username;
    }

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

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Float getNote() {
        return note;
    }

    public void setNote(Float note) {
        this.note = note;
    }
}
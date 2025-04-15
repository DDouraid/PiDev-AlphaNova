package org.example.feedback.entities;

import jakarta.persistence.*;

@Entity
public class Feedback {
    @Id
    @GeneratedValue
    private int id;
    private String comment;
    private Float note;

    @Column(name = "user_id") // Map this field to the user_id column in the database
    private Long userId; // Replace User entity with a simple userId field

    public Feedback() {
    }

    public Feedback(int id, String comment, Float note, Long userId) {
        this.id = id;
        this.comment = comment;
        this.note = note;
        this.userId = userId;
    }

    public Feedback(String comment, Float note, Long userId) {
        this.comment = comment;
        this.note = note;
        this.userId = userId;
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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
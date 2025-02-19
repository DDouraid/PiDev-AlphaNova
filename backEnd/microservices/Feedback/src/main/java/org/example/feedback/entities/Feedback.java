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

    public Feedback() {
    }

    public Feedback(int id, String comment, Float note) {
        this.id = id;
        this.comment = comment;
        this.note = note;
    }

    public Feedback(String comment, Float note) {
        this.comment = comment;
        this.note = note;
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
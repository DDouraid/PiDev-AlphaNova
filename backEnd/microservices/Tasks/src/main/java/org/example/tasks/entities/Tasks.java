package org.example.tasks.entities;

import jakarta.persistence.*;

import java.util.Date;

@Entity
public class Tasks {
    @Id
    @GeneratedValue
    private int id;
    private String title;
    private String description;
    private Date startDate;
    private Date endDate;
    @Enumerated(EnumType.STRING)
    private TasksStatus status;

    public Tasks() {
    }

    public Tasks(int id, String title, String description, Date startDate, Date endDate, TasksStatus status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }

    public Tasks(String title, String description, Date startDate, Date endDate, TasksStatus status) {
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public TasksStatus getStatus() {
        return status;
    }

    public void setStatus(TasksStatus status) {
        this.status = status;
    }
}

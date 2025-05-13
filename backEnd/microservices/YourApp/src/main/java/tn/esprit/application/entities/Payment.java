package tn.esprit.application.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.util.Date;

@Entity
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Float amount;

    private Long userId; // New field for user ID
    private String username; // New field for username

    @Enumerated(EnumType.STRING)
    private PaymentMode mode;

    @Temporal(TemporalType.TIMESTAMP)
    private Date date;

    public Payment() {}

    public Payment(Float amount, PaymentMode mode, Date date, Long userId, String username) {
        this.amount = amount;
        this.mode = mode;
        this.date = date;
        this.userId = userId;
        this.username = username;
    }

    // Getters et Setters
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

    public Float getAmount() { return amount; }
    public void setAmount(Float amount) { this.amount = amount; }

    public PaymentMode getMode() { return mode; }
    public void setMode(PaymentMode mode) { this.mode = mode; }

    public Date getDate() { return date; }
    public void setDate(Date date) { this.date = date; }

}

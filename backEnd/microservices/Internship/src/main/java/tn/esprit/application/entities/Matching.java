package tn.esprit.application.entities;

import jakarta.persistence.*;
import java.util.Date;

@Entity
public class Matching {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private float matchScore;

    @Temporal(TemporalType.DATE)
    private Date date;

    private String status;

    @ManyToOne
    @JoinColumn(name = "internship_offer_id", nullable = false)
    private InternshipOffer internshipOffer;

    @ManyToOne
    @JoinColumn(name = "internship_request_id", nullable = false)
    private InternshipRequest internshipRequest;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public float getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(float matchScore) {
        this.matchScore = matchScore;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public InternshipOffer getInternshipOffer() {
        return internshipOffer;
    }

    public void setInternshipOffer(InternshipOffer internshipOffer) {
        this.internshipOffer = internshipOffer;
    }

    public InternshipRequest getInternshipRequest() {
        return internshipRequest;
    }

    public void setInternshipRequest(InternshipRequest internshipRequest) {
        this.internshipRequest = internshipRequest;
    }
}

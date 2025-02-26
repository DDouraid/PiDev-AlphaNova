package tn.esprit.application.entities;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "internship")
public class Internship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    @Temporal(TemporalType.DATE)
    private Date startDate;

    @Temporal(TemporalType.DATE)
    private Date endDate;

    @Enumerated(EnumType.STRING)
    private InternStatus status;



    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "internship_offer_id", nullable = true)
    private InternshipOffer internshipOffer;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "internship_request_id", nullable = true)
    private InternshipRequest internshipRequest;



    public Internship() {}

    public Internship(String title, String description, Date startDate, Date endDate, InternStatus status, InternshipOffer internshipOffer) {
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.internshipOffer = internshipOffer;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
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

    public InternStatus getStatus() {
        return status;
    }

    public void setStatus(InternStatus status) {
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

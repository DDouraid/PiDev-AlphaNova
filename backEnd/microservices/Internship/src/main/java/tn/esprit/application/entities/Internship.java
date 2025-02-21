package tn.esprit.application.entities;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
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

    // Many internships belong to one user
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Many internships can be linked to one offer
    @ManyToOne
    @JoinColumn(name = "internship_offer_id", nullable = false)
    private InternshipOffer internshipOffer;

    // One internship can be linked to one internship request
    @OneToOne
    @JoinColumn(name = "internship_request_id", nullable = true)
    private InternshipRequest internshipRequest;

    // One internship can have multiple matchings
    @OneToMany(mappedBy = "internship", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Matching> matchings;

    // Constructors
    public Internship() {}

    public Internship(String title, String description, Date startDate, Date endDate, InternStatus status, User user, InternshipOffer internshipOffer) {
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.user = user;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public List<Matching> getMatchings() {
        return matchings;
    }

    public void setMatchings(List<Matching> matchings) {
        this.matchings = matchings;
    }
}

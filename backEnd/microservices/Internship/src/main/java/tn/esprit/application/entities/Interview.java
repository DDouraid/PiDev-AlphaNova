package tn.esprit.application.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview")
public class Interview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "internship_request_id")
    private InternshipRequest internshipRequest;

    @Column(name = "interview_date")
    private LocalDateTime interviewDate;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private InterviewStatus status;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public InternshipRequest getInternshipRequest() {
        return internshipRequest;
    }

    public void setInternshipRequest(InternshipRequest internshipRequest) {
        this.internshipRequest = internshipRequest;
    }

    public LocalDateTime getInterviewDate() {
        return interviewDate;
    }

    public void setInterviewDate(LocalDateTime interviewDate) {
        this.interviewDate = interviewDate;
    }

    public InterviewStatus getStatus() {
        return status;
    }

    public void setStatus(InterviewStatus status) {
        this.status = status;
    }
}
